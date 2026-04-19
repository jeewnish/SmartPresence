package com.smartpresence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "attendance_records",
       uniqueConstraints = @UniqueConstraint(columnNames = {"session_id", "student_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private Long recordId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    // BUG 4 FIX: device_id is nullable here (and in the schema — see V6 migration)
    // because manual overrides have no device; the lecturer vouches for physical presence.
    // The schema column is NOT NULL by default — V6__allow_nullable_device_id.sql
    // runs ALTER TABLE attendance_records ALTER COLUMN device_id DROP NOT NULL.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    private DeviceRegistration device;

    @Builder.Default
    @Column(name = "ble_verified", nullable = false)
    private Boolean bleVerified = false;

    @Builder.Default
    @Column(name = "biometric_verified", nullable = false)
    private Boolean biometricVerified = false;

    @Builder.Default
    @Column(name = "device_verified", nullable = false)
    private Boolean deviceVerified = false;

    @Column(name = "rssi_value")
    private Short rssiValue;

    @Column(name = "ble_token_used", length = 64)
    private String bleTokenUsed;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "attendance_status")
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    @Builder.Default
    @Column(name = "checked_in_at", updatable = false)
    private OffsetDateTime checkedInAt = OffsetDateTime.now();

    @Builder.Default
    @Column(name = "is_manual_override", nullable = false)
    private Boolean isManualOverride = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "overridden_by")
    private User overriddenBy;

    @Column(name = "override_reason", length = 255)
    private String overrideReason;

    @Column(name = "overridden_at")
    private OffsetDateTime overriddenAt;

    public enum AttendanceStatus { PRESENT, LATE, MANUAL_OVERRIDE, ABSENT }

    public boolean isFullyVerified() {
        return Boolean.TRUE.equals(bleVerified)
            && Boolean.TRUE.equals(biometricVerified)
            && Boolean.TRUE.equals(deviceVerified);
    }
}
