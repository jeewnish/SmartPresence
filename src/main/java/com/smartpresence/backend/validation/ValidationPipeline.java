package com.smartpresence.backend.validation;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Orchestrates the 8-step attendance validation pipeline.
 *
 * Steps are executed in strict order; any step throws ValidationException on failure.
 * Each step may populate the ValidationContext with loaded entities so subsequent
 * steps can reuse them without additional DB queries.
 *
 * Pipeline order:
 *   1. DeviceValidator         — device exists, active, belongs to student
 *   2. AttendanceTokenValidator— JWT valid, claims match, JTI not replayed
 *   3. SessionValidator        — session exists, is ACTIVE
 *   4. EnrollmentValidator     — student enrolled in course (re-validated here, not trusted from challenge step)
 *   5. BleTokenValidatorStep   — CRC16(secret + timestamp) matches submitted token
 *   6. ExpiryValidator         — timestamp within window (live: ±5min / offline: session window)
 *   7. RssiValidator           — RSSI ≥ threshold
 *   8. DuplicateValidator      — student not already PRESENT
 */
@Component
@RequiredArgsConstructor
public class ValidationPipeline {

    private final DeviceValidator deviceValidator;
    private final AttendanceTokenValidator attendanceTokenValidator;
    private final SessionValidator sessionValidator;
    private final EnrollmentValidator enrollmentValidator;
    private final BleTokenValidatorStep bleTokenValidatorStep;
    private final ExpiryValidator expiryValidator;
    private final RssiValidator rssiValidator;
    private final DuplicateValidator duplicateValidator;

    /**
     * Runs all validation steps in order. Returns the populated context on success.
     * Throws ValidationException on the first failing step.
     */
    public ValidationContext validate(ValidationContext ctx) {
        deviceValidator.validate(ctx);
        attendanceTokenValidator.validate(ctx);
        sessionValidator.validate(ctx);
        enrollmentValidator.validate(ctx);
        bleTokenValidatorStep.validate(ctx);
        expiryValidator.validate(ctx);
        rssiValidator.validate(ctx);
        duplicateValidator.validate(ctx);
        return ctx;
    }
}
