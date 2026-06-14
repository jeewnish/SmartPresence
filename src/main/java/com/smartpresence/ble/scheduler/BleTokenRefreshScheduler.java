package com.smartpresence.ble.scheduler;

import com.smartpresence.ble.broadcast.BleBroadcastService;
import com.smartpresence.entity.Session;
import com.smartpresence.repository.SessionRepository;
import com.smartpresence.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Two scheduled tasks:
 *
 *  1. tokenRotationTask  — runs every 60 seconds.
 *     Checks every ACTIVE session. If the BLE token is within
 *     60 seconds of expiry, rotates it automatically so the
 *     lecturer app always has a valid token to broadcast.
 *
 *  2. staleSessionCleanupTask — runs every 5 minutes.
 *     Auto-ends sessions that have overrun their scheduled duration
 *     by more than 30 minutes (safety net for forgotten sessions).
 *
 * NOTE: Physical BLE hardware beacon health checks have been removed.
 * The system operates phone-to-phone: the lecturer's phone advertises
 * the BLE token and students scan it directly.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BleTokenRefreshScheduler {

    private final SessionRepository      sessionRepository;
    private final BleBroadcastService    broadcastService;
    private final SystemSettingService   settingService;

    /** Rotate tokens that are within 60 s of expiry — every 60 s */
    @Scheduled(fixedDelay = 60_000)
    public void tokenRotationTask() {
        List<Session> active = sessionRepository.findByStatus(Session.SessionStatus.ACTIVE);

        for (Session session : active) {
            try {
                if (isNearExpiry(session)) {
                    log.info("⏰ Auto-rotating BLE token for session={}", session.getSessionId());
                    broadcastService.rotateToken(session.getSessionId(), null);
                }
            } catch (Exception e) {
                log.error("Token rotation failed for session={}: {}", session.getSessionId(), e.getMessage());
            }
        }
    }

    /**
     * End sessions that have overrun their scheduled duration by > 30 minutes.
     * Prevents stale ACTIVE sessions after a lecturer forgets to close.
     * Runs every 5 minutes.
     */
    // BUG FIX: @Transactional required — without it, detached Session entities from
    // findByStatus() cause LazyInitializationException when broadcastSessionEnd() accesses
    // session.getCourse().getCourseCode() (a LAZY association, no longer in scope).
    // Also switched to findAllActiveSessions() which JOIN FETCHes course/lecturer/venue.
    @Transactional
    @Scheduled(fixedDelay = 300_000, initialDelay = 60_000)
    public void staleSessionCleanupTask() {
        List<Session> active = sessionRepository.findAllActiveSessions();
        OffsetDateTime now   = OffsetDateTime.now();

        for (Session session : active) {
            long elapsedMinutes = java.time.Duration.between(session.getStartedAt(), now).toMinutes();
            long maxMinutes     = session.getScheduledDurationMinutes() + 30L;

            if (elapsedMinutes > maxMinutes) {
                log.warn("🧹 Auto-ending stale session={} — elapsed={}min scheduled={}min",
                        session.getSessionId(), elapsedMinutes, session.getScheduledDurationMinutes());

                session.setStatus(Session.SessionStatus.ENDED);
                session.setEndedAt(now);
                sessionRepository.save(session);

                broadcastService.broadcastSessionEnd(session);
            }
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private boolean isNearExpiry(Session session) {
        if (session.getBleTokenExpiresAt() == null) return true;
        return OffsetDateTime.now().isAfter(
                session.getBleTokenExpiresAt().minusSeconds(60));
    }
}
