package com.smartpresence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "security_flags")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SecurityFlag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "flag_id")
    private Integer flagId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    private DeviceRegistration device;

    @Enumerated(EnumType.STRING)
    @Column(name = "flag_type", nullable = false, columnDefinition = "flag_type")
    private FlagType flagType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, columnDefinition = "flag_severity")
    @Builder.Default
    private FlagSeverity severity = FlagSeverity.MEDIUM;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "resolved", nullable = false)
    @Builder.Default
    private Boolean resolved = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;

    @Column(name = "resolution_note", length = 500)
    private String resolutionNote;

    @Column(name = "flagged_at", updatable = false)
    @Builder.Default
    private OffsetDateTime flaggedAt = OffsetDateTime.now();

    public enum FlagType {
        DEVICE_MISMATCH,
        MULTIPLE_DEVICE_ATTEMPT,
        WEAK_BLE_SIGNAL,
        BIOMETRIC_FAILURE,
        REPLAY_TOKEN,
        OUT_OF_RANGE,
        RAPID_CHECKIN,
        ACCOUNT_SHARING_SUSPECT,
        OTHER
    }

    public enum FlagSeverity { LOW, MEDIUM, HIGH, CRITICAL }
}
