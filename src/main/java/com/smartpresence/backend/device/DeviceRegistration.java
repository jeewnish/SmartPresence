package com.smartpresence.backend.device;

import com.smartpresence.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "device_registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Client-generated unique device identifier (e.g., Android ID). */
    @Column(name = "device_id", nullable = false, unique = true)
    private String deviceId;

    @Column(name = "device_name", nullable = false)
    private String deviceName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "platform_type")
    private PlatformType platform;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "registered_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime registeredAt = OffsetDateTime.now();

    @Column(name = "last_seen_at")
    private OffsetDateTime lastSeenAt;
}
