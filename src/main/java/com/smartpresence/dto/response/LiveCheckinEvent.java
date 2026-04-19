package com.smartpresence.dto.response;

import lombok.*;
import java.time.OffsetDateTime;

/**
 * Pushed to /topic/live-checkins/{sessionId} after every successful check-in.
 * Powers the scrolling Live Activity Stream on the Admin Dashboard and Lecturer App.
 *
 * Example message:
 *   "John Doe verified via FaceID in Room 402 — RSSI -61 dBm (~2.3 m)"
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LiveCheckinEvent {

    private Long           recordId;
    private Integer        sessionId;
    private Integer        studentId;
    private String         studentName;
    private String         indexNumber;
    private String         venueCode;
    private String         venueName;

    /** Attendance status: PRESENT or LATE */
    private String         status;

    /** Which biometric method confirmed identity */
    private String         biometricMethod;   // "FaceID" | "Fingerprint"

    /** RSSI reading at time of check-in */
    private Short          rssiDbm;

    /** Estimated physical distance in metres */
    private Double         distanceEstM;

    private boolean        bleVerified;
    private boolean        biometricVerified;
    private boolean        deviceVerified;
    private boolean        manualOverride;

    private OffsetDateTime checkedInAt;
}
