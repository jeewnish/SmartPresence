package com.smartpresence.controller;

import com.smartpresence.dto.response.ActiveSessionResponse;
import com.smartpresence.dto.response.AlertResponse;
import com.smartpresence.dto.response.ApiResponse;
import com.smartpresence.dto.response.DashboardKpiResponse;
import com.smartpresence.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Dashboard", description = "Admin dashboard — KPIs, live sessions, alerts")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/kpis")
    @Operation(summary = "Get the 4 KPI card values")
    public ResponseEntity<ApiResponse<DashboardKpiResponse>> getKpis() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getKpis()));
    }

    @GetMapping("/active-sessions")
    @Operation(summary = "Live sessions board — all currently active sessions")
    public ResponseEntity<ApiResponse<List<ActiveSessionResponse>>> getActiveSessions() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getActiveSessions()));
    }

    @GetMapping("/alerts")
    @Operation(summary = "Actionable alerts feed — unresolved security flags")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getAlerts() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getAlertsFeed()));
    }
}
