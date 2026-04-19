package com.smartpresence.repository;

import com.smartpresence.entity.BiometricProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BiometricProfileRepository extends JpaRepository<BiometricProfile, Integer> {

    Optional<BiometricProfile> findByUserUserId(Integer userId);

    boolean existsByUserUserId(Integer userId);
}
