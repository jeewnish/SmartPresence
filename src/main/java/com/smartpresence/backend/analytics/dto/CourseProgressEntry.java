package com.smartpresence.backend.analytics.dto;

public record CourseProgressEntry(
    Long courseId,
    String courseCode,
    String courseName,
    String semester,
    long totalSessions,
    long attendedSessions,
    double attendancePercentage
) {}
