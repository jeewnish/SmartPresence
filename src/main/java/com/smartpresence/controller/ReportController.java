package com.smartpresence.controller;

import com.smartpresence.dto.response.ApiResponse;
import com.smartpresence.dto.response.SecurityFlagReportResponse;
import com.smartpresence.entity.ReportLog;
import com.smartpresence.entity.User;
import com.smartpresence.security.JwtHelper;
import com.smartpresence.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Reports", description = "Report generation and data export (CSV / PDF)")
public class ReportController {

    private final ReportService reportService;
    private final JwtHelper     jwtHelper;

    @GetMapping("/course-attendance")
    @Operation(summary = "Course attendance report", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> courseAttendance(
            @RequestParam Integer courseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal Jwt jwt) {

        User admin = jwtHelper.resolveUser(jwt);
        List<Map<String, Object>> data = reportService.courseAttendanceReport(courseId, from, to);
        safeLogExport(admin.getUserId(), ReportLog.ReportType.COURSE_ATTENDANCE,
                from, to, Map.of("courseId", courseId));
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/student-summary")
    @Operation(summary = "Student summary report", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> studentSummary(
            @RequestParam Integer courseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal Jwt jwt) {

        User admin = jwtHelper.resolveUser(jwt);
        List<Map<String, Object>> data = reportService.studentSummaryReport(courseId, from, to);
        safeLogExport(admin.getUserId(), ReportLog.ReportType.STUDENT_SUMMARY,
                from, to, Map.of("courseId", courseId));
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/security-anomalies")
    @Operation(summary = "Security anomalies report", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<List<SecurityFlagReportResponse>>> securityAnomalies(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal Jwt jwt) {

        User admin = jwtHelper.resolveUser(jwt);
        List<SecurityFlagReportResponse> data = reportService.securityAnomaliesReport(from, to);
        safeLogExport(admin.getUserId(), ReportLog.ReportType.SECURITY_ANOMALIES,
                from, to, Map.of());
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    private void safeLogExport(Integer userId, ReportLog.ReportType reportType,
                               LocalDate from, LocalDate to, Map<String, Object> filters) {
        try {
            reportService.logExport(userId, reportType, from, to, filters, ReportLog.ExportFormat.CSV, 0);
        } catch (Exception ex) {
            log.warn("Report export logging failed for {} by user {}: {}", reportType, userId, ex.getMessage());
        }
    }
}
