package com.smartpresence.backend.attendance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChallengeRepository extends JpaRepository<AttendanceChallenge, Long> {

    Optional<AttendanceChallenge> findByChallenge(String challenge);
}
