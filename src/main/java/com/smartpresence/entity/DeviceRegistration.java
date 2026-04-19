package com.smartpresence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "device_registrations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeviceRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "device_id")
    private Integer deviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** IMEI / Android ID / iOS identifierForVendor — unique hardware fingerprint */
    @Column(name = "device_fingerprint", nullable = false, unique = true, length = 255)
    private String deviceFingerprint;

    @Column(name = "device_model", length = 100)
    private String deviceModel;

    @Enumerated(EnumType.STRING)
    @Column(name = "os_type", nullable = false, columnDefinition = "os_type")
    private OsType osType;

    @Column(name = "os_version", length = 20)
    private String osVersion;

    @Column(name = "app_version", length = 20)
    private String appVersion;

    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private Boolean isPrimary = true;

    @Column(name = "registered_at", updatable = false)
    @Builder.Default
    private OffsetDateTime registeredAt = OffsetDateTime.now();

    @Column(name = "last_seen_at")
    private OffsetDateTime lastSeenAt;

    @Column(name = "is_revoked", nullable = false)
    @Builder.Default
    private Boolean isRevoked = false;

    @Column(name = "revoke_reason", length = 255)
    private String revokeReason;

    public enum OsType { ANDROID, IOS }
}
