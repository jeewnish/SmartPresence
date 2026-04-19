package com.smartpresence.websocket;

import com.smartpresence.entity.AttendanceRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

/**
 * Central WebSocket publisher.
 * Pushes real-time events to STOMP topics consumed by the admin dashboard,
 * lecturer app, and student app.
 *
 * Topics:
 *   /topic/session/{id}/checkins    — live check-in stream
 *   /topic/session/{id}/token       — BLE token rotations
 *   /topic/session/{id}/lifecycle   — session started / ended
 *   /topic/dashboard/alerts         — new security flag raised
 *   /topic/dashboard/kpis           — signal to refresh KPI cards
 *   /topic/beacons                  — beacon health changes
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LiveSessionPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    // ── Check-in event ────────────────────────────────────────────────────────

    public void publishCheckin(AttendanceRecord record) {
        CheckinEvent event = new CheckinEvent(
                record.getStudent().getUserId(),
                record.getStudent().getFullName(),
                record.getStudent().getIndexNumber(),
                record.getStatus().name(),
                record.getRssiValue(),
                record.getCheckedInAt(),
                Boolean.TRUE.equals(record.getIsManualOverride())
        );

        String topic = "/topic/session/" + record.getSession().getSessionId() + "/checkins";
        messagingTemplate.convertAndSend(topic, event);
        log.debug("WS checkin published → {}", topic);
    }

    // ── Token rotation ────────────────────────────────────────────────────────

    public void publishTokenRotation(Integer sessionId, String newToken, OffsetDateTime expiresAt) {
        TokenRotationEvent event = new TokenRotationEvent(newToken, expiresAt.toString());
        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/token", event);
        log.debug("WS token rotation published → session={}", sessionId);
    }

    // ── Session lifecycle ─────────────────────────────────────────────────────

    public void publishSessionStarted(Integer sessionId, String courseCode, String venueName) {
        SessionLifecycleEvent event = new SessionLifecycleEvent("STARTED", courseCode, venueName, null);
        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/lifecycle", event);
    }

    public void publishSessionEnded(Integer sessionId, String reason) {
        SessionLifecycleEvent event = new SessionLifecycleEvent("ENDED", null, null, reason);
        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/lifecycle", event);
        messagingTemplate.convertAndSend("/topic/dashboard/kpis", "REFRESH");
    }

    // ── Dashboard events ──────────────────────────────────────────────────────

    public void publishNewFlag(Integer flagId, String flagType, String severity,
                                String studentName, String courseCode) {
        AlertEvent event = new AlertEvent(
                flagId, flagType, severity,
                studentName, courseCode, OffsetDateTime.now().toString());
        messagingTemplate.convertAndSend("/topic/dashboard/alerts", event);
    }

    public void publishBeaconStatus(Object statusPayload) {
        messagingTemplate.convertAndSend("/topic/beacons", statusPayload);
        log.debug("Beacon status update published");
    }

    // ── Event payload types ───────────────────────────────────────────────────
    // Plain records — no Lombok @Builder needed, Java records generate
    // all constructors and accessors automatically.

    public record CheckinEvent(
            Integer        studentId,
            String         studentName,
            String         indexNumber,
            String         status,
            Short          rssiValue,
            OffsetDateTime checkedInAt,
            boolean        isManualOverride) {}

    public record TokenRotationEvent(
            String newToken,
            String expiresAt) {}

    public record SessionLifecycleEvent(
            String event,
            String courseCode,
            String venueName,
            String reason) {}

    public record AlertEvent(
            Integer flagId,
            String  flagType,
            String  severity,
            String  studentName,
            String  courseCode,
            String  flaggedAt) {}
}
