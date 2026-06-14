package com.smartpresence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

/**
 * A physical room or lecture hall. Each venue has an RSSI threshold
 * that defines the proximity boundary — students must be within range
 * of the lecturer's phone BLE advertisement to check in.
 *
 * No physical BLE hardware beacon is associated with venues.
 * The lecturer's phone acts as the BLE advertiser when a session is active.
 */
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

    /**
     * RSSI threshold in dBm — defines the digital room perimeter.
     * Students whose device reports RSSI below this value are considered
     * outside the room and their check-in is rejected.
     */
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
