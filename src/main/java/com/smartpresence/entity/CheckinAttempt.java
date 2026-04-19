package com.smartpresence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "checkin_attempts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckinAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attempt_id")
    private Long attemptId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    /** Raw device fingerprint — may not match any registered device */
    @Column(name = "device_fingerprint", nullable = false, length = 255)
    private String deviceFingerprint;

    @Column(name = "ble_verified", nullable = false)
    private Boolean bleVerified = false;

    @Column(name = "biometric_verified", nullable = false)
    private Boolean biometricVerified = false;

    @Column(name = "device_verified", nullable = false)
    private Boolean deviceVerified = false;

    /** RSSI value in dBm — stored as rssi_value for backward compat */
    @Column(name = "rssi_value")
    private Short rssiValue;

    /** Alias getter so AttendanceService can use req.getRssiDbm() uniformly */
    public Short getRssiDbm() { return rssiValue; }
    public void  setRssiDbm(Short v) { this.rssiValue = v; }

    @Column(name = "ble_token_presented", length = 64)
    private String bleTokenPresented;

    @Enumerated(EnumType.STRING)
    @Column(name = "outcome", nullable = false, columnDefinition = "checkin_outcome")
    private CheckinOutcome outcome;

    @Column(name = "failure_reason", length = 255)
    private String failureReason;

    @Column(name = "attempted_at", updatable = false)
    private OffsetDateTime attemptedAt = OffsetDateTime.now();

    public enum CheckinOutcome {
        SUCCESS, FAILED_BLE, FAILED_BIOMETRIC, FAILED_DEVICE, FAILED_ALL
    }
}
