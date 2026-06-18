package com.smartpresence.backend.ble;

import com.smartpresence.backend.attendance.AttendanceRecord;
import com.smartpresence.backend.device.DeviceRegistration;
import com.smartpresence.backend.session.AttendanceSession;
import com.smartpresence.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Full audit log of every check-in attempt (success AND failure).
 * Every attempt is recorded, regardless of outcome — this is the security audit trail.
 */
@Entity
@Table(name = "ble_checkin_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BleCheckinEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "device_id", nullable = false)
    private DeviceRegistration device;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private AttendanceSession session;

    /** The BLE token string as received from the mobile app. */
    @Column(nullable = false)
    private String token;

    /** Received Signal Strength Indicator in dBm. */
    @Column(nullable = false)
    private Integer rssi;

    /** Estimated distance computed from RSSI (meters). */
    @Column(name = "distance_estimate", precision = 6, scale = 2)
    private BigDecimal distanceEstimate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "checkin_result")
    private CheckinResult result;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "biometric_verified", nullable = false)
    @Builder.Default
    private boolean biometricVerified = false;

    /** FK to attendance_records — populated only on SUCCESS. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendance_token_id")
    private AttendanceRecord attendanceRecord;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
