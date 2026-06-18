package com.smartpresence.backend.analytics.dto;

import java.util.List;

public record LecturerHistoryResponse(
    Long lecturerId,
    String lecturerName,
    List<SessionHistoryEntry> sessions
) {}
