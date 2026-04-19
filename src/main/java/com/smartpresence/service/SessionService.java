package com.smartpresence.service;

import com.smartpresence.ble.broadcast.BleBroadcastService;
import com.smartpresence.entity.*;
import com.smartpresence.repository.*;
import com.smartpresence.websocket.LiveSessionPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Manages the full lifecycle of an attendance session.
 *
 * startSession  → saves Session → BleBroadcastService.issueInitialToken()
 *                               → LiveSessionPublisher.publishSessionStarted()
 * endSession    → marks ENDED  → BleBroadcastService.broadcastSessionEnd()
 *                               → LiveSessionPublisher.publishSessionEnded()
 * forceEndSession → FORCE_ENDED → same broadcast + audit log
 */
@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository    sessionRepository;
    private final CourseRepository     courseRepository;
    private final UserRepository       userRepository;
    private final VenueRepository      venueRepository;
    private final AuditLogRepository   auditLogRepository;
    private final BleBroadcastService  broadcastService;
    private final LiveSessionPublisher livePublisher;

    @Value("${app.ble.token-lifetime-seconds}")
    private long bleTokenLifetimeSeconds;

    // ── Start ─────────────────────────────────────────────────────────────────

    @Transactional
    public Session startSession(Integer lecturerId, Integer courseId,
                                Integer venueId, Short durationMinutes) {

        Course course   = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + courseId));
        User   lecturer = userRepository.findById(lecturerId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + lecturerId));

        // Guard: no duplicate active sessions for same course/lecturer
        sessionRepository.findByLecturerUserIdAndStatus(lecturerId, Session.SessionStatus.ACTIVE)
                .stream()
                .filter(s -> s.getCourse().getCourseId().equals(courseId))
                .findFirst()
                .ifPresent(s -> { throw new IllegalStateException(
                        "An active session already exists for this course."); });

        Venue venue = (venueId != null)
                ? venueRepository.findById(venueId).orElse(null) : null;

        OffsetDateTime now = OffsetDateTime.now();

        Session session = Session.builder()
                .course(course)
                .lecturer(lecturer)
                .venue(venue)
                .bleToken("PENDING-" + System.currentTimeMillis())
                .bleTokenExpiresAt(now.plusSeconds(bleTokenLifetimeSeconds))
                .status(Session.SessionStatus.ACTIVE)
                .startedAt(now)
                .scheduledDurationMinutes(durationMinutes != null ? durationMinutes : 60)
                .tokenRotationCount((short) 0)
                .wsTopic("/topic/session/PENDING")
                .build();
        sessionRepository.save(session);

        // Issue real token, log broadcast event, push WebSocket BLE payload
        broadcastService.issueInitialToken(session, lecturer);

        // Notify admin dashboard and lecturer app
        livePublisher.publishSessionStarted(
                session.getSessionId(),
                course.getCourseCode(),
                venue != null ? venue.getVenueName() : "TBA");

        return sessionRepository.findById(session.getSessionId()).orElse(session);
    }

    // ── End ───────────────────────────────────────────────────────────────────

    @Transactional
    public Session endSession(Integer sessionId, Integer lecturerId) {
        Session session = findActiveSession(sessionId);

        if (!session.getLecturer().getUserId().equals(lecturerId)) {
            throw new SecurityException("Only the owning lecturer can end this session.");
        }

        session.setStatus(Session.SessionStatus.ENDED);
        session.setEndedAt(OffsetDateTime.now());
        Session saved = sessionRepository.save(session);

        broadcastService.broadcastSessionEnd(saved);
        livePublisher.publishSessionEnded(sessionId, "ENDED_NORMALLY");
        return saved;
    }

    // ── Force End ─────────────────────────────────────────────────────────────

    @Transactional
    public Session forceEndSession(Integer sessionId, Integer adminId, String reason) {
        Session session = findActiveSession(sessionId);
        User    admin   = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        session.setStatus(Session.SessionStatus.FORCE_ENDED);
        session.setEndedAt(OffsetDateTime.now());
        session.setForceEndedBy(admin);
        session.setForceEndedAt(OffsetDateTime.now());
        session.setForceEndedReason(reason);
        Session saved = sessionRepository.save(session);

        broadcastService.broadcastSessionEnd(saved);
        livePublisher.publishSessionEnded(sessionId, reason);

        auditLogRepository.save(AuditLog.builder()
                .actor(admin)
                .action("FORCE_END_SESSION")
                .entityType("session")
                .entityId(sessionId)
                .newValue(Map.of("reason", reason, "sessionId", sessionId))
                .build());

        return saved;
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<Session> getActiveSessions() {
        return sessionRepository.findAllActiveSessions();
    }

    @Transactional(readOnly = true)
    public List<Session> getLecturerActiveSessions(Integer lecturerId) {
        return sessionRepository.findByLecturerUserIdAndStatus(
                lecturerId, Session.SessionStatus.ACTIVE);
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private Session findActiveSession(Integer id) {
        Session s = sessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + id));
        if (s.getStatus() != Session.SessionStatus.ACTIVE) {
            throw new IllegalStateException("Session is not active.");
        }
        return s;
    }
}
