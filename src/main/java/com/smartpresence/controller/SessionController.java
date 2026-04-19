package com.smartpresence.controller;

import com.smartpresence.dto.request.ManualOverrideRequest;
import com.smartpresence.dto.request.StartSessionRequest;
import com.smartpresence.dto.response.ApiResponse;
import com.smartpresence.entity.AttendanceRecord;
import com.smartpresence.entity.Session;
import com.smartpresence.entity.User;
import com.smartpresence.security.JwtHelper;
import com.smartpresence.service.AttendanceService;
import com.smartpresence.service.SessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
@Tag(name = "Sessions", description = "BLE session lifecycle management")
public class SessionController {

    private final SessionService    sessionService;
    private final AttendanceService attendanceService;
    private final JwtHelper         jwtHelper;

    @PostMapping("/start")
    @PreAuthorize("hasRole('LECTURER')")
    @Operation(summary = "Start a BLE attendance session", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<Session>> startSession(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody StartSessionRequest req) {

        User lecturer = jwtHelper.resolveUser(jwt);
        Session session = sessionService.startSession(
                lecturer.getUserId(), req.getCourseId(),
                req.getVenueId(), req.getDurationMinutes());
        return ResponseEntity.ok(ApiResponse.ok("Session started", session));
    }

    @PostMapping("/{sessionId}/end")
    @PreAuthorize("hasRole('LECTURER')")
    @Operation(summary = "End an active session", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<Session>> endSession(
            @PathVariable Integer sessionId,
            @AuthenticationPrincipal Jwt jwt) {

        User lecturer = jwtHelper.resolveUser(jwt);
        Session session = sessionService.endSession(sessionId, lecturer.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("Session ended", session));
    }

    @PostMapping("/{sessionId}/force-end")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: force-end a session", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<Session>> forceEndSession(
            @PathVariable Integer sessionId,
            @RequestParam String reason,
            @AuthenticationPrincipal Jwt jwt) {

        User admin = jwtHelper.resolveUser(jwt);
        Session session = sessionService.forceEndSession(sessionId, admin.getUserId(), reason);
        return ResponseEntity.ok(ApiResponse.ok("Session force-ended", session));
    }

    @PostMapping("/{sessionId}/override")
    @PreAuthorize("hasAnyRole('LECTURER','ADMIN')")
    @Operation(summary = "Manually mark a student present/absent", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<AttendanceRecord>> manualOverride(
            @PathVariable Integer sessionId,
            @Valid @RequestBody ManualOverrideRequest req,
            @AuthenticationPrincipal Jwt jwt) {

        User actor = jwtHelper.resolveUser(jwt);
        AttendanceRecord record = attendanceService.manualOverride(
                sessionId, req.getStudentId(), actor.getUserId(),
                req.getReason(), req.getNewStatus());
        return ResponseEntity.ok(ApiResponse.ok("Override applied", record));
    }

    @GetMapping("/{sessionId}/attendance")
    @PreAuthorize("hasAnyRole('ADMIN','LECTURER')")
    @Operation(summary = "Get all attendance records for a session (live feed)", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<List<AttendanceRecord>>> getSessionAttendance(
            @PathVariable Integer sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(
                attendanceService.getSessionAttendance(sessionId)));
    }

    @GetMapping("/my-active")
    @PreAuthorize("hasRole('LECTURER')")
    @Operation(summary = "Get active sessions for the authenticated lecturer", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<List<Session>>> myActiveSessions(
            @AuthenticationPrincipal Jwt jwt) {
        User lecturer = jwtHelper.resolveUser(jwt);
        return ResponseEntity.ok(ApiResponse.ok(
                sessionService.getLecturerActiveSessions(lecturer.getUserId())));
    }
}
