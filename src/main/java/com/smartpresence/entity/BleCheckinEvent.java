package com.smartpresence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "ble_checkin_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BleCheckinEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ble_event_id")
    private Long bleEventId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id")
    private AttendanceRecord record;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id")
    private CheckinAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    // ── Raw BLE signal data from student device ───────────────────────────────
    @Column(name = "beacon_mac", length = 17)
    private String beaconMac;

    @Column(name = "ble_token", nullable = false, length = 64)
    private String bleToken;

    /** Measured RSSI in dBm — averaged from rssiSamples readings */
    @Column(name = "rssi_dbm", nullable = false)
    private Short rssiDbm;

    /** How many raw RSSI readings were averaged to get rssiDbm */
    @Column(name = "rssi_samples")
    private Short rssiSamples;

    /** Estimated physical distance in metres derived from RSSI + TX power */
    @Column(name = "distance_est_m", precision = 5, scale = 2)
    private BigDecimal distanceEstM;

    /** TX power value extracted from the BLE advertisement packet */
    @Column(name = "tx_power_dbm")
    private Short txPowerDbm;

    // ── Validation results ────────────────────────────────────────────────────
    @Column(name = "rssi_threshold", nullable = false)
    private Short rssiThreshold;

    @Column(name = "passed_rssi", nullable = false)
    private Boolean passedRssi;

    @Column(name = "passed_token", nullable = false)
    private Boolean passedToken;

    @Column(name = "captured_at", updatable = false)
    @Builder.Default
    private OffsetDateTime capturedAt = OffsetDateTime.now();
}
