package com.smartpresence.repository;

import com.smartpresence.entity.BeaconHeartbeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;

@Repository
public interface BeaconHeartbeatRepository extends JpaRepository<BeaconHeartbeat, Long> {

    Optional<BeaconHeartbeat> findTopByVenueVenueIdOrderByReceivedAtDesc(Integer venueId);

    Optional<BeaconHeartbeat> findTopByBeaconMacOrderByReceivedAtDesc(String beaconMac);

    @Query("""
        SELECT COUNT(bh) FROM BeaconHeartbeat bh
        WHERE bh.venue.venueId = :venueId
          AND bh.receivedAt >= :since
        """)
    long countRecentHeartbeats(@Param("venueId") Integer venueId,
                               @Param("since") OffsetDateTime since);
}
