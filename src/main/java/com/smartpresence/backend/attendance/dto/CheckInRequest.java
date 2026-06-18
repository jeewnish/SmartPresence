package com.smartpresence.backend.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CheckInRequest(
    @NotNull(message = "sessionId is required") Long sessionId,
    @NotNull(message = "timestamp is required") Long timestamp,
    @NotBlank(message = "token is required") String token,
    @NotNull(message = "rssi is required") Integer rssi,
    @NotBlank(message = "deviceId is required") String deviceId,
    @NotBlank(message = "attendanceToken is required") String attendanceToken
) {}
