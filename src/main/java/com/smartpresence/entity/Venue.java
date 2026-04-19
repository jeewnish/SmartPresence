package com.smartpresence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "venues")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "venue_id")
    private Integer venueId;

    @Column(name = "venue_code", nullable = false, unique = true, length = 20)
    private String venueCode;

    @Column(name = "venue_name", nullable = false, length = 100)
    private String venueName;

    @Column(name = "building", length = 80)
    private String building;

    @Column(name = "floor")
    private Short floor;

    @Column(name = "capacity")
    private Short capacity;

    /** MAC address of the BLE beacon installed in this room e.g. "AA:BB:CC:DD:EE:FF" */
    @Column(name = "beacon_mac", unique = true, length = 17)
    private String beaconMac;

    /** iBeacon / Eddystone UUID */
    @Column(name = "beacon_uuid", unique = true)
    private UUID beaconUuid;

    /** RSSI threshold in dBm — defines the digital room perimeter */
    @Column(name = "rssi_threshold", nullable = false)
    private Short rssiThreshold = -70;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
