package com.smartpresence.backend.enrollment.dto;

import jakarta.validation.constraints.NotNull;

public record EnrollRequest(
    @NotNull(message = "courseId is required") Long courseId
) {}
