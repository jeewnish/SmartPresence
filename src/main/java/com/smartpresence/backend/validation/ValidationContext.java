package com.smartpresence.backend.validation;

import com.smartpresence.backend.device.DeviceRegistration;
import com.smartpresence.backend.session.AttendanceSession;
import com.smartpresence.backend.user.User;
import io.jsonwebtoken.Claims;
import lombok.Data;
import lombok.RequiredArgsConstructor;

/**
 * Mutable context passed through the validation pipeline.
 * Each validator reads from and writes to this object, eliminating repeated DB lookups.
 */
@Data
@RequiredArgsConstructor
public class ValidationContext {

    // ---- Input ----
    private final Long sessionId;
    private final Long timestamp;
    private final String bleToken;
    private final Integer rssi;
    private final String deviceIdString;   // the device_id string from device_registrations
    private final String attendanceToken;  // raw JWT string
    private final User student;
    private final boolean offlineSync;     // true = offline-sync flow (different expiry check)

    // ---- Populated by validators ----
    private DeviceRegistration device;
    private Claims tokenClaims;
    private String tokenJti;
    private AttendanceSession session;
}
