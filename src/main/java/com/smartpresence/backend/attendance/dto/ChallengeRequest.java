package com.smartpresence.backend.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ChallengeRequest(
    @NotBlank(message = "deviceId is required") String deviceId,
    @NotNull(message = "sessionId is required") Long sessionId
) {}
