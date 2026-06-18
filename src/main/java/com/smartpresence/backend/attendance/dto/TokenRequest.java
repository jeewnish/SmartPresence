package com.smartpresence.backend.attendance.dto;

import jakarta.validation.constraints.NotBlank;

public record TokenRequest(
    @NotBlank(message = "challenge is required") String challenge
) {}
