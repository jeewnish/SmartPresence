package com.smartpresence.ble.validator;

import com.smartpresence.entity.*;
import com.smartpresence.repository.*;
import com.smartpresence.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;

/**
 * Validates every BLE signal received during a student check-in.
 *
 * The BLE token is broadcast by the lecturer's phone — no physical
 * hardware beacon is involved. The student's phone scans and picks
 * up the token, then submits it along with the measured RSSI.
 *
 * Checks performed (in order):
 *  1. Token match against the active session token
 *  2. Token expiry
 *  3. RSSI threshold (is the student physically close to the lecturer?)
 *  4. Distance estimation cross-check (log-distance path-loss model)
 *
 * All raw signal data is written to ble_checkin_events regardless of
 * outcome so that forensic analysis is always available.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BleCheckinValidator {

    private final BleCheckinEventRepository  bleCheckinEventRepo;
    private final SystemSettingService       settingService;

    /**
     * Path-loss exponent n — empirically tuned for indoor environments.
     * Typically 2.0 (free space) to 4.0 (heavy obstruction).
     */
    private static final double PATH_LOSS_EXPONENT = 2.7;

    /**
     * RSSI at 1 metre reference distance (dBm).
     * Calibrated for a typical phone BLE advertisement at 0 dBm TX power.
     */
    private static final double RSSI_AT_1M = -59.0;

    // ── Public API ────────────────────────────────────────────────────────────

    public ValidationResult validate(Session session,
                                     String  presentedToken,
                                     Short   rssiDbm,
                                     Short   rssiSamples,
                                     Short   txPowerDbm,
                                     User    student) {

        Venue venue = session.getVenue();

        // ── 1. Token match ────────────────────────────────────────────────────
        boolean tokenValid = session.getBleToken().equals(presentedToken)
                && OffsetDateTime.now().isBefore(session.getBleTokenExpiresAt());

        if (!tokenValid) {
            log.warn("BLE token invalid or expired — student={} session={}",
                    student.getUserId(), session.getSessionId());
            persistBleEvent(null, null, student, session, venue,
                    presentedToken, rssiDbm, rssiSamples, txPowerDbm,
                    getThreshold(venue), false, false);
            return ValidationResult.fail(FailReason.TOKEN_INVALID);
        }

        // ── 2. RSSI threshold ─────────────────────────────────────────────────
        short threshold = getThreshold(venue);
        boolean passedRssi = (rssiDbm != null) && (rssiDbm >= threshold);

        // ── 3. Distance estimation (informational — logged but not a hard block) ──
        BigDecimal distEst = null;
        if (rssiDbm != null) {
            double txRef = (txPowerDbm != null) ? txPowerDbm : RSSI_AT_1M;
            distEst = estimateDistance(rssiDbm, txRef);
            log.debug("BLE distance estimate={} m, rssi={} dBm, threshold={} dBm",
                    distEst, rssiDbm, threshold);
        }

        persistBleEvent(null, null, student, session, venue,
                presentedToken, rssiDbm, rssiSamples, txPowerDbm,
                threshold, passedRssi, true);

        if (!passedRssi) {
            log.warn("RSSI {} dBm below threshold {} dBm — student={} session={}",
                    rssiDbm, threshold, student.getUserId(), session.getSessionId());
            return ValidationResult.fail(FailReason.RSSI_TOO_LOW,
                    String.format("Signal %d dBm is below required %d dBm. " +
                            "Move closer to the lecturer.", rssiDbm, threshold));
        }

        return ValidationResult.pass(rssiDbm, distEst);
    }

    // ── Distance estimation ───────────────────────────────────────────────────

    /**
     * Log-distance path-loss model:
     *   distance = 10 ^ ((txPowerAt1m - rssi) / (10 * n))
     */
    public BigDecimal estimateDistance(short rssiDbm, double txPowerAt1m) {
        double ratio   = (txPowerAt1m - rssiDbm) / (10.0 * PATH_LOSS_EXPONENT);
        double distRaw = Math.pow(10.0, ratio);
        return BigDecimal.valueOf(distRaw).setScale(2, RoundingMode.HALF_UP);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private short getThreshold(Venue venue) {
        if (venue != null && venue.getRssiThreshold() != null) {
            return venue.getRssiThreshold();
        }
        return (short) settingService.getIntValue("ble_rssi_threshold_strict");
    }

    private void persistBleEvent(AttendanceRecord record, CheckinAttempt attempt,
                                  User student, Session session, Venue venue,
                                  String token, Short rssiDbm, Short rssiSamples,
                                  Short txPowerDbm, short threshold,
                                  boolean passedRssi, boolean passedToken) {
        BleCheckinEvent event = BleCheckinEvent.builder()
                .record(record)
                .attempt(attempt)
                .student(student)
                .session(session)
                .venue(venue)
                .bleToken(token)
                .rssiDbm(rssiDbm != null ? rssiDbm : (short) -99)
                .rssiSamples(rssiSamples)
                .txPowerDbm(txPowerDbm)
                .rssiThreshold(threshold)
                .passedRssi(passedRssi)
                .passedToken(passedToken)
                .distanceEstM(rssiDbm != null
                        ? estimateDistance(rssiDbm, txPowerDbm != null ? txPowerDbm : RSSI_AT_1M)
                        : null)
                .build();
        bleCheckinEventRepo.save(event);
    }

    // ── Result types ──────────────────────────────────────────────────────────

    public record ValidationResult(boolean passed,
                                   FailReason failReason,
                                   String detail,
                                   Short rssiDbm,
                                   BigDecimal distanceM) {

        public static ValidationResult pass(Short rssi, BigDecimal dist) {
            return new ValidationResult(true, null, null, rssi, dist);
        }

        public static ValidationResult fail(FailReason reason) {
            return new ValidationResult(false, reason, reason.message, null, null);
        }

        public static ValidationResult fail(FailReason reason, String detail) {
            return new ValidationResult(false, reason, detail, null, null);
        }
    }

    public enum FailReason {
        TOKEN_INVALID ("BLE token is invalid or has expired."),
        TOKEN_EXPIRED ("BLE token has expired — session may have ended."),
        RSSI_TOO_LOW  ("Signal too weak — move closer to the lecturer.");

        public final String message;
        FailReason(String m) { this.message = m; }
    }
}
