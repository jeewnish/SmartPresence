package com.smartpresence.backend.device;

import com.smartpresence.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeviceRepository extends JpaRepository<DeviceRegistration, Long> {

    Optional<DeviceRegistration> findByDeviceId(String deviceId);

    Optional<DeviceRegistration> findByDeviceIdAndActiveTrue(String deviceId);

    List<DeviceRegistration> findByUserAndActiveTrue(User user);

    boolean existsByDeviceId(String deviceId);
}
