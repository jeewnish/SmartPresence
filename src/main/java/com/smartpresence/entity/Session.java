package com.smartpresence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Integer sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecturer_id", nullable = false)
    private User lecturer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @Column(name = "ble_token", nullable = false, unique = true, length = 64)
    private String bleToken;

    @Column(name = "ble_token_expires_at", nullable = false)
    private OffsetDateTime bleTokenExpiresAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "session_status")
    // @Builder.Default: Lombok @Builder ignores Java field initializers.
    // Without this the builder produces null, causing a NOT NULL DB violation.
    @Builder.Default
    private SessionStatus status = SessionStatus.ACTIVE;

    @Builder.Default
    @Column(name = "started_at", updatable = false)
    private OffsetDateTime startedAt = OffsetDateTime.now();

    @Column(name = "ended_at")
    private OffsetDateTime endedAt;

    @Builder.Default
    @Column(name = "scheduled_duration_minutes", nullable = false)
    private Short scheduledDurationMinutes = 60;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "force_ended_by")
    private User forceEndedBy;

    @Column(name = "force_ended_at")
    private OffsetDateTime forceEndedAt;

    @Column(name = "force_ended_reason", length = 255)
    private String forceEndedReason;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "ws_topic", length = 100)
    private String wsTopic;

    @Builder.Default
    @Column(name = "token_rotation_count", nullable = false)
    private Short tokenRotationCount = 0;

    @Column(name = "last_token_rotated_at")
    private OffsetDateTime lastTokenRotatedAt;

    public enum SessionStatus { SCHEDULED, ACTIVE, ENDED, FORCE_ENDED }

    public boolean isExpired() {
        return OffsetDateTime.now().isAfter(bleTokenExpiresAt);
    }
}
