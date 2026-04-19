package com.smartpresence.repository;

import com.smartpresence.entity.BeaconHeartbeat;
import com.smartpresence.entity.BeaconStatusLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BeaconStatusLogRepository extends JpaRepository<BeaconStatusLog, Integer> {

    Optional<BeaconStatusLog> findByVenueVenueId(Integer venueId);

    Optional<BeaconStatusLog> findByBeaconMac(String beaconMac);

    List<BeaconStatusLog> findByCurrentStatus(BeaconHeartbeat.BeaconStatus status);

    List<BeaconStatusLog> findAllByOrderByVenueVenueIdAsc();
}
