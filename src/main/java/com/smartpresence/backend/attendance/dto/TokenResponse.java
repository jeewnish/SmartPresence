package com.smartpresence.backend.attendance.dto;

public record TokenResponse(String attendanceToken, long expiresInSeconds) {}
