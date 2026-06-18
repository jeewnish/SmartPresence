package com.smartpresence.backend.device;

import com.smartpresence.backend.device.dto.DeviceRegisterRequest;
import com.smartpresence.backend.device.dto.DeviceResponse;
import com.smartpresence.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;

    @Transactional
    public DeviceResponse register(DeviceRegisterRequest request, User user) {
        return deviceRepository.findByDeviceId(request.deviceId())
            .map(existing -> {
                if (!existing.getUser().getId().equals(user.getId())) {
                    throw new IllegalArgumentException("Device ID is already registered to another account");
                }
                // Re-activate and refresh
                existing.setActive(true);
                existing.setLastSeenAt(OffsetDateTime.now());
                return DeviceResponse.from(deviceRepository.save(existing));
            })
            .orElseGet(() -> {
                DeviceRegistration device = DeviceRegistration.builder()
                    .user(user)
                    .deviceId(request.deviceId())
                    .deviceName(request.deviceName())
                    .platform(request.platform())
                    .active(true)
                    .build();
                return DeviceResponse.from(deviceRepository.save(device));
            });
    }

    @Transactional(readOnly = true)
    public List<DeviceResponse> getMyDevices(User user) {
        return deviceRepository.findByUserAndActiveTrue(user)
            .stream()
            .map(DeviceResponse::from)
            .toList();
    }
}
