package com.smartpresence.backend.device.dto;

import com.smartpresence.backend.device.PlatformType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DeviceRegisterRequest(
    @NotBlank(message = "deviceId is required") String deviceId,
    @NotBlank(message = "deviceName is required") String deviceName,
    @NotNull(message = "platform is required") PlatformType platform
) {}
