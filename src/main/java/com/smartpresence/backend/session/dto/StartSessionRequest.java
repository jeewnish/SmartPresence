package com.smartpresence.backend.session.dto;

import jakarta.validation.constraints.NotNull;

public record StartSessionRequest(
    @NotNull(message = "courseId is required") Long courseId
) {}
