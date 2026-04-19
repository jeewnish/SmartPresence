package com.smartpresence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "biometric_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BiometricProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "biometric_id")
    private Integer biometricId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "fingerprint_enrolled", nullable = false)
    private Boolean fingerprintEnrolled = false;

    @Column(name = "faceid_enrolled", nullable = false)
    private Boolean faceidEnrolled = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_method", nullable = false, columnDefinition = "biometric_method")
    private BiometricMethod preferredMethod = BiometricMethod.NONE;

    @Column(name = "enrolled_at")
    private OffsetDateTime enrolledAt;

    @Column(name = "last_verified_at")
    private OffsetDateTime lastVerifiedAt;

    public enum BiometricMethod { FINGERPRINT, FACEID, NONE }
}
