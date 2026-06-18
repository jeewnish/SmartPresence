package com.smartpresence.backend.attendance.dto;

import java.util.List;

public record OfflineSyncResponse(
    int totalSubmitted,
    int successCount,
    int failureCount,
    List<SyncResult> results
) {
    public record SyncResult(
        Long sessionId,
        boolean success,
        String error
    ) {}
}
