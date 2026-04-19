package com.smartpresence.dto.response;

import lombok.*;
import java.time.OffsetDateTime;

// ─────────────────────────────────────────────────────────────────────────────
// DashboardKpiResponse — drives the 4 KPI cards
// ─────────────────────────────────────────────────────────────────────────────
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardKpiResponse {
    private long   totalActiveStudents;
    private double todayAvgAttendancePct;
    private long   activeSessionsNow;
    private long   openSecurityFlags;
}
