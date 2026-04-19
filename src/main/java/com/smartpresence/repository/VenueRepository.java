package com.smartpresence.repository;

import com.smartpresence.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Integer> {

    Optional<Venue> findByVenueCode(String venueCode);

    Optional<Venue> findByBeaconMac(String beaconMac);

    Optional<Venue> findByBeaconUuid(java.util.UUID beaconUuid);
}
