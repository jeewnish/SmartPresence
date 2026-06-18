package com.smartpresence.backend.device.dto;

import com.smartpresence.backend.device.DeviceRegistration;
import com.smartpresence.backend.device.PlatformType;

import java.time.OffsetDateTime;

public record DeviceResponse(
    Long id,
    String deviceId,
    String deviceName,
    PlatformType platform,
    boolean active,
    OffsetDateTime registeredAt,
    OffsetDateTime lastSeenAt
) {
    public static DeviceResponse from(DeviceRegistration d) {
        return new DeviceResponse(
            d.getId(), d.getDeviceId(), d.getDeviceName(),
            d.getPlatform(), d.isActive(), d.getRegisteredAt(), d.getLastSeenAt()
        );
    }
}
