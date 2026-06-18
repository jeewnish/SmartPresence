package com.smartpresence.backend.session.dto;

import com.smartpresence.backend.attendance.AttendanceStatus;

import java.util.List;

public record RosterResponse(
    Long sessionId,
    Long courseId,
    String courseCode,
    int totalEnrolled,
    long presentCount,
    List<RosterEntry> students
) {
    public record RosterEntry(
        Long studentId,
        String firstName,
        String lastName,
        String email,
        AttendanceStatus status
    ) {}
}
