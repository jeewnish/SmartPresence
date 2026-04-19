package com.smartpresence.ble.broadcast;

import com.smartpresence.ble.BleTokenService;
import com.smartpresence.dto.response.BleSessionPayload;
import com.smartpresence.entity.*;
import com.smartpresence.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Owns the BLE broadcast lifecycle for a session.
 *
 * Responsibilities:
 *  - Issue the first token when a session starts (TOKEN_ISSUED)
 *  - Rotate the token on a schedule or on-demand (TOKEN_ROTATED)
 *  - Log every event to ble_broadcast_events
 *  - Push the new token to the lecturer's WebSocket topic so the
 *    Lecturer App can immediately update its BLE advertisement
 *  - Push a BleSessionPayload to /topic/session/{id} so that
 *    Student Apps subscribed to that topic learn the new token
 *    without polling
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BleBroadcastService {

    private final BleTokenService            tokenService;
    private final SessionRepository          sessionRepository;
    private final BleBroadcastEventRepository eventRepository;
    private final SimpMessagingTemplate      messagingTemplate;

    // ── Token issuance ────────────────────────────────────────────────────────

    /**
     * Called once when a session is created.
     * Writes the first TOKEN_ISSUED event and pushes to WebSocket.
     */
    @Transactional
    public String issueInitialToken(Session session, User lecturer) {
        BleTokenService.BleTokenPair pair = tokenService.generateInitialToken(session.getSessionId());

        session.setBleToken(pair.token());
        session.setBleTokenExpiresAt(pair.expiresAt());
        session.setWsTopic("/topic/session/" + session.getSessionId());
        session.setTokenRotationCount((short) 0);
        sessionRepository.save(session);

        logBroadcastEvent(session, BleBroadcastEvent.BroadcastEvent.TOKEN_ISSUED,
                pair.token(), pair.expiresAt(), lecturer, "Initial token on session start");

        pushToWebSocket(session, pair.token(), pair.expiresAt());

        log.info("📡 BLE token ISSUED — session={} venue={} expires={}",
                session.getSessionId(),
                session.getVenue() != null ? session.getVenue().getVenueCode() : "N/A",
                pair.expiresAt());

        return pair.token();
    }

    /**
     * Rotate the token.
     * Called by the scheduler every (lifetime/2) seconds,
     * or manually by the lecturer via the Lecturer App refresh button.
     */
    @Transactional
    public String rotateToken(Integer sessionId, User initiator) {
        BleTokenService.BleTokenPair pair = tokenService.rotateToken(sessionId);
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        // Increment rotation counter
        session.setTokenRotationCount(
                (short) (session.getTokenRotationCount() + 1));
        session.setLastTokenRotatedAt(OffsetDateTime.now());
        sessionRepository.save(session);

        logBroadcastEvent(session, BleBroadcastEvent.BroadcastEvent.TOKEN_ROTATED,
                pair.token(), pair.expiresAt(), initiator,
                "Rotation #" + session.getTokenRotationCount());

        pushToWebSocket(session, pair.token(), pair.expiresAt());

        log.info("🔄 BLE token ROTATED — session={} rotation#={}",
                sessionId, session.getTokenRotationCount());

        return pair.token();
    }

    /**
     * Called when a session is ended (normally or force-ended).
     * Logs the SESSION_ENDED event and sends a final WebSocket message
     * so student apps know to stop scanning.
     */
    @Transactional
    public void broadcastSessionEnd(Session session) {
        logBroadcastEvent(session, BleBroadcastEvent.BroadcastEvent.SESSION_ENDED,
                session.getBleToken(), OffsetDateTime.now(), null, "Session ended");

        // Push a null-token payload — clients treat this as "session closed"
        BleSessionPayload payload = BleSessionPayload.builder()
                .sessionId(session.getSessionId())
                .courseCode(session.getCourse().getCourseCode())
                .courseName(session.getCourse().getCourseName())
                .venueCode(session.getVenue() != null ? session.getVenue().getVenueCode() : null)
                .bleToken(null)
                .tokenExpiresAt(null)
                .sessionActive(false)
                .build();

        messagingTemplate.convertAndSend(
                "/topic/session/" + session.getSessionId(), payload);

        log.info("📴 BLE session ENDED broadcast sent — session={}",
                session.getSessionId());
    }

    // ── Event log ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<BleBroadcastEvent> getEventLog(Integer sessionId) {
        return eventRepository.findBySessionSessionIdOrderByTokenIssuedAtDesc(sessionId);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void logBroadcastEvent(Session session, BleBroadcastEvent.BroadcastEvent type,
                                    String token, OffsetDateTime expiresAt,
                                    User initiatedBy, String note) {
        eventRepository.save(BleBroadcastEvent.builder()
                .session(session)
                .venue(session.getVenue())
                .eventType(type)
                .bleToken(token)
                .tokenExpiresAt(expiresAt)
                .txPowerDbm(session.getVenue() != null ? null : null)
                .initiatedBy(initiatedBy)
                .note(note)
                .build());
    }

    private void pushToWebSocket(Session session,
                                  String newToken,
                                  OffsetDateTime expiresAt) {
        BleSessionPayload payload = BleSessionPayload.builder()
                .sessionId(session.getSessionId())
                .courseCode(session.getCourse().getCourseCode())
                .courseName(session.getCourse().getCourseName())
                .venueCode(session.getVenue() != null ? session.getVenue().getVenueCode() : null)
                .beaconMac(session.getVenue() != null ? session.getVenue().getBeaconMac() : null)
                .bleToken(newToken)
                .tokenExpiresAt(expiresAt)
                .sessionActive(true)
                .rotationCount(session.getTokenRotationCount())
                .build();

        // Topic subscribed to by both lecturer and student apps
        messagingTemplate.convertAndSend(
                "/topic/session/" + session.getSessionId(), payload);

        // Also send to the lecturer's private queue so their app can update the advertisement
        messagingTemplate.convertAndSendToUser(
                session.getLecturer().getEmail(),
                "/queue/ble-token",
                payload);
    }
}
