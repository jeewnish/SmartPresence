package com.smartpresence.backend.validation;

import com.smartpresence.backend.ble.CheckinResult;
import com.smartpresence.backend.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Step 7: RSSI (signal strength) validation.
 *
 * Rejects check-ins where the student is physically too far from the lecturer's device.
 * Threshold is configurable via attendance.rssi.threshold (default: -80 dBm).
 */
@Component
@RequiredArgsConstructor
public class RssiValidator {

    private final AppProperties appProperties;

    public void validate(ValidationContext ctx) {
        int threshold = appProperties.getRssi().getThreshold();
        if (ctx.getRssi() < threshold) {
            throw new ValidationException(CheckinResult.LOW_RSSI,
                "RSSI " + ctx.getRssi() + " dBm is below the required threshold of " + threshold + " dBm");
        }
    }
}
