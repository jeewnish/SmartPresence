package com.smartpresence.backend.course.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCourseRequest(
    @NotBlank(message = "courseCode is required") String courseCode,
    @NotBlank(message = "courseName is required") String courseName,
    @NotBlank(message = "semester is required") String semester
) {}
