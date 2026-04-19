package com.smartpresence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "beacon_status_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BeaconStatusLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "status_id")
    private Integer statusId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false, unique = true)
    private Venue venue;

    @Column(name = "beacon_mac", nullable = false, length = 17)
    private String beaconMac;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false, columnDefinition = "beacon_status")
    private BeaconHeartbeat.BeaconStatus currentStatus = BeaconHeartbeat.BeaconStatus.UNKNOWN;

    @Column(name = "last_heartbeat_at")
    private OffsetDateTime lastHeartbeatAt;

    @Column(name = "last_online_at")
    private OffsetDateTime lastOnlineAt;

    @Column(name = "offline_since")
    private OffsetDateTime offlineSince;

    @Column(name = "firmware_version", length = 20)
    private String firmwareVersion;

    @Column(name = "battery_pct")
    private Short batteryPct;

    @Column(name = "tx_power_dbm")
    private Short txPowerDbm;

    @Column(name = "consecutive_failures", nullable = false)
    private Short consecutiveFailures = 0;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public boolean isOnline() {
        return currentStatus == BeaconHeartbeat.BeaconStatus.ONLINE;
    }

    public boolean isBatteryLow() {
        return batteryPct != null && batteryPct < 20;
    }
}
