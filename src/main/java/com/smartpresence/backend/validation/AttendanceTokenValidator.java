package com.smartpresence.backend.validation;

import com.smartpresence.backend.attendance.AttendanceTokenService;
import com.smartpresence.backend.attendance.TokenUsageRepository;
import com.smartpresence.backend.ble.CheckinResult;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Step 2: Attendance token validation.
 *
 * Checks:
 *   - Token is a valid JJWT (not expired, signature correct).
 *   - Token claims match request values (studentId, deviceId, sessionId).
 *   - JTI has not been used before (replay prevention).
 */
@Component
@RequiredArgsConstructor
public class AttendanceTokenValidator {

    private final AttendanceTokenService tokenService;
    private final TokenUsageRepository tokenUsageRepository;

    public void validate(ValidationContext ctx) {
        Claims claims;
        try {
            claims = tokenService.validateToken(ctx.getAttendanceToken());
        } catch (JwtException e) {
            throw new ValidationException(CheckinResult.INVALID_TOKEN,
                "Attendance token is invalid or expired: " + e.getMessage());
        }

        // Verify claims match the request
        Long tokenStudentId = claims.get("studentId", Long.class);
        String tokenDeviceId = claims.get("deviceId", String.class);
        Long tokenSessionId  = claims.get("sessionId", Long.class);

        if (!ctx.getStudent().getId().equals(tokenStudentId)) {
            throw new ValidationException(CheckinResult.INVALID_TOKEN,
                "Attendance token student mismatch");
        }
        if (!ctx.getDeviceIdString().equals(tokenDeviceId)) {
            throw new ValidationException(CheckinResult.INVALID_TOKEN,
                "Attendance token device mismatch");
        }
        if (!ctx.getSessionId().equals(tokenSessionId)) {
            throw new ValidationException(CheckinResult.INVALID_TOKEN,
                "Attendance token session mismatch");
        }

        String jti = claims.getId();
        if (tokenUsageRepository.existsByTokenJti(jti)) {
            throw new ValidationException(CheckinResult.INVALID_TOKEN,
                "Attendance token has already been used (replay detected)");
        }

        ctx.setTokenClaims(claims);
        ctx.setTokenJti(jti);
    }
}
