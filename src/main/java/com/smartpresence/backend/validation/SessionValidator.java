package com.smartpresence.backend.validation;

import com.smartpresence.backend.ble.CheckinResult;
import com.smartpresence.backend.session.SessionRepository;
import com.smartpresence.backend.session.SessionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Step 3: Session validation.
 *
 * Checks:
 *   - Session exists.
 *   - Session status is ACTIVE.
 */
@Component
@RequiredArgsConstructor
public class SessionValidator {

    private final SessionRepository sessionRepository;

    public void validate(ValidationContext ctx) {
        var session = sessionRepository.findById(ctx.getSessionId())
            .orElseThrow(() -> new ValidationException(CheckinResult.INVALID_SESSION,
                "Session not found: " + ctx.getSessionId()));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new ValidationException(CheckinResult.INVALID_SESSION,
                "Attendance session is not active");
        }

        ctx.setSession(session);
    }
}
