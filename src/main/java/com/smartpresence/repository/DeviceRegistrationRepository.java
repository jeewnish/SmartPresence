package com.smartpresence.repository;

import com.smartpresence.entity.DeviceRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeviceRegistrationRepository extends JpaRepository<DeviceRegistration, Integer> {

    Optional<DeviceRegistration> findByDeviceFingerprint(String fingerprint);

    Optional<DeviceRegistration> findByDeviceFingerprintAndIsRevokedFalse(String fingerprint);

    Optional<DeviceRegistration> findByUserUserIdAndIsPrimaryTrue(Integer userId);

    boolean existsByDeviceFingerprint(String fingerprint);

    boolean existsByUserUserIdAndIsPrimaryTrue(Integer userId);
}
