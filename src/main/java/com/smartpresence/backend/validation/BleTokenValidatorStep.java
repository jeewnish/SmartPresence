package com.smartpresence.backend.validation;

import com.smartpresence.backend.ble.BleTokenValidator;
import com.smartpresence.backend.ble.CheckinResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Step 5: BLE token (CRC16) validation.
 *
 * Recomputes CRC16(session_secret + timestamp) and compares with the submitted token.
 */
@Component
@RequiredArgsConstructor
public class BleTokenValidatorStep {

    private final BleTokenValidator bleTokenValidator;

    public void validate(ValidationContext ctx) {
        String sessionSecret = ctx.getSession().getSessionSecret();
        boolean valid = bleTokenValidator.validate(sessionSecret, ctx.getTimestamp(), ctx.getBleToken());

        if (!valid) {
            throw new ValidationException(CheckinResult.INVALID_TOKEN,
                "BLE token CRC16 validation failed — token does not match session secret + timestamp");
        }
    }
}
