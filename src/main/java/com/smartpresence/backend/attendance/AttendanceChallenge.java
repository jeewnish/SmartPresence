package com.smartpresence.backend.attendance;

import com.smartpresence.backend.device.DeviceRegistration;
import com.smartpresence.backend.session.AttendanceSession;
import com.smartpresence.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

/**
 * Short-lived cryptographic challenge issued to a student device.
 * Expires in 60 seconds (enforced by expires_at, checked in application layer).
 * The session_id column (added in V2) links this challenge to a specific session
 * so the server can embed sessionId in the attendance token without a second round-trip.
 */
@Entity
@Table(name = "attendance_challenges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "device_id", nullable = false)
    private DeviceRegistration device;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private AttendanceSession session;

    @Column(nullable = false, unique = true)
    private String challenge;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean used = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
