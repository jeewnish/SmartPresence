package com.smartpresence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

/**
 * All system actors — students, lecturers, admins — share this table.
 * Authentication is fully handled by Keycloak; this entity stores the
 * SmartPresence-specific profile data only (department, index number, etc.).
 *
 * NOTE: Does NOT implement UserDetails. With OAuth2 Resource Server,
 * Spring Security validates tokens directly against Keycloak's JWKS endpoint;
 * it never calls UserDetailsService. Removing UserDetails prevents Lombok
 * getter conflicts with the interface's getUsername()/getPassword() methods.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    /** University index number, e.g. "22CIS0272" — students only */
    @Column(name = "index_number", unique = true, length = 20)
    private String indexNumber;

    @Column(name = "first_name", nullable = false, length = 60)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 60)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true, length = 120)
    private String email;

    /**
     * Always set to the sentinel value "OAUTH2_MANAGED" — Keycloak owns
     * authentication. This column is kept for schema compatibility only.
     */
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, columnDefinition = "user_role")
    private UserRole role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "enrollment_year")
    private Short enrollmentYear;

    @Column(name = "profile_photo_url", length = 512)
    private String profilePhotoUrl;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    // ── Convenience method ────────────────────────────────────────────────────

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
