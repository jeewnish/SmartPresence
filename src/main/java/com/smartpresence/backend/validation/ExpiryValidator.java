package com.smartpresence.backend.validation;

import com.smartpresence.backend.ble.CheckinResult;
import com.smartpresence.backend.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Step 6: Timestamp expiry validation.
 *
 * LIVE check-in: The BLE timestamp must be within ±expiryWindowSeconds of server time.
 *
 * OFFLINE sync: Instead of checking server time, we check that the timestamp falls
 *   within the session window (startedAt → endedAt, or startedAt + session-window-hours).
 *   This prevents students from capturing a BLE packet and syncing it hours later outside
 *   the session window, while still allowing legitimate offline submissions.
 */
@Component
@RequiredArgsConstructor
public class ExpiryValidator {

    private final AppProperties appProperties;

    public void validate(ValidationContext ctx) {
        long ts = ctx.getTimestamp();

        if (ctx.isOfflineSync()) {
            validateOfflineWindow(ts, ctx);
        } else {
            validateLiveWindow(ts);
        }
    }

    private void validateLiveWindow(long ts) {
        long serverTime = Instant.now().getEpochSecond();
        long diff = Math.abs(serverTime - ts);
        int window = appProperties.getBle().getExpiryWindowSeconds();
        if (diff > window) {
            throw new ValidationException(CheckinResult.TOKEN_EXPIRED,
                "BLE timestamp is outside the acceptable window (±" + window + "s). Diff: " + diff + "s");
        }
    }

    private void validateOfflineWindow(long ts, ValidationContext ctx) {
        var session = ctx.getSession();
        long sessionStart = session.getStartedAt().toEpochSecond();

        long sessionEnd = session.getEndedAt() != null
            ? session.getEndedAt().toEpochSecond()
            : sessionStart + (long) appProperties.getOffline().getSessionWindowHours() * 3600;

        if (ts < sessionStart || ts > sessionEnd) {
            throw new ValidationException(CheckinResult.TOKEN_EXPIRED,
                "Offline timestamp is outside the session window. The BLE packet was not captured during the session.");
        }
    }
}
