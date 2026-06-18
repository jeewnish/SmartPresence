package com.smartpresence.backend.analytics.dto;

import com.smartpresence.backend.session.SessionStatus;

import java.time.OffsetDateTime;

public record SessionHistoryEntry(
    Long sessionId,
    Long courseId,
    String courseCode,
    String courseName,
    SessionStatus status,
    OffsetDateTime startedAt,
    OffsetDateTime endedAt,
    long totalEnrolled,
    long presentCount,
    double attendanceRate
) {}
