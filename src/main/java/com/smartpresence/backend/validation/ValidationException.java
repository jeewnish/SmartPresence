package com.smartpresence.backend.validation;

import com.smartpresence.backend.ble.CheckinResult;
import lombok.Getter;

/**
 * Thrown by any validation step when a check-in attempt must be rejected.
 * The result field maps directly to the checkin_result PostgreSQL enum,
 * and is used both to persist the audit log entry and to build the API error response.
 */
@Getter
public class ValidationException extends RuntimeException {

    private final CheckinResult result;

    public ValidationException(CheckinResult result, String message) {
        super(message);
        this.result = result;
    }
}
