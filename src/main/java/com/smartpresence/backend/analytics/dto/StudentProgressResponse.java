package com.smartpresence.backend.analytics.dto;

import java.util.List;

public record StudentProgressResponse(
    Long studentId,
    String studentName,
    List<CourseProgressEntry> courses
) {}
