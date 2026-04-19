package com.smartpresence.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response returned to the Student App after a check-in attempt.
 *
 * NOTE: Uses explicit constructors instead of @Builder because mixing @Builder
 * with static factory methods on a non-generic class can confuse javac when
 * Lombok runs as an annotation processor under Java 21 strict mode.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CheckinResponse {

    private boolean success;
    private String  status;       // "PRESENT" | "LATE" | null on failure
    private String  courseName;
    private String  venueName;
    private String  message;

    // ── Static factory methods ────────────────────────────────────────────────

    public static CheckinResponse success(String status, String courseName, String venueName) {
        return new CheckinResponse(true, status, courseName, venueName,
                "Attendance recorded successfully.");
    }

    public static CheckinResponse failed(String reason) {
        return new CheckinResponse(false, null, null, null, reason);
    }
}
