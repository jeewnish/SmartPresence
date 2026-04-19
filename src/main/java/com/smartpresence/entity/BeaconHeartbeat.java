package com.smartpresence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "beacon_heartbeats")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BeaconHeartbeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "heartbeat_id")
    private Long heartbeatId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    @Column(name = "beacon_mac", nullable = false, length = 17)
    private String beaconMac;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "beacon_status")
    private BeaconStatus status = BeaconStatus.ONLINE;

    @Column(name = "firmware_version", length = 20)
    private String firmwareVersion;

    @Column(name = "battery_pct")
    private Short batteryPct;

    /** Beacon's configured transmit power in dBm */
    @Column(name = "tx_power_dbm")
    private Short txPowerDbm;

    /** Beacon's own RSSI self-check reading */
    @Column(name = "rssi_self_check")
    private Short rssiSelfCheck;

    @Column(name = "uptime_seconds")
    private Long uptimeSeconds;

    @Column(name = "received_at", updatable = false)
    private OffsetDateTime receivedAt = OffsetDateTime.now();

    public enum BeaconStatus { ONLINE, OFFLINE, DEGRADED, UNKNOWN }
}
