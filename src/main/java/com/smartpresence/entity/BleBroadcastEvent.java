package com.smartpresence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "ble_broadcast_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BleBroadcastEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Long eventId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, columnDefinition = "broadcast_event")
    private BroadcastEvent eventType;

    @Column(name = "ble_token", nullable = false, length = 64)
    private String bleToken;

    @Column(name = "token_issued_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime tokenIssuedAt = OffsetDateTime.now();

    @Column(name = "token_expires_at", nullable = false)
    private OffsetDateTime tokenExpiresAt;

    @Column(name = "tx_power_dbm")
    private Short txPowerDbm;

    /** NULL = automatic rotation by scheduler; non-null = triggered by a user */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiated_by")
    private User initiatedBy;

    @Column(name = "note", length = 255)
    private String note;

    public enum BroadcastEvent {
        TOKEN_ISSUED,   // first token when session starts
        TOKEN_ROTATED,  // periodic rolling rotation
        TOKEN_EXPIRED,  // logged when expiry passes without rotation
        SESSION_ENDED   // final event logged when session closes
    }
}
