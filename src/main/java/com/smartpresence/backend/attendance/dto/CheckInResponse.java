package com.smartpresence.backend.attendance.dto;

public record CheckInResponse(
    boolean success,
    Long attendanceRecordId,
    String message
) {}
