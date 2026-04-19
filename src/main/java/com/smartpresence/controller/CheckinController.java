package com.smartpresence.controller;

import com.smartpresence.dto.request.CheckinRequest;
import com.smartpresence.dto.response.ApiResponse;
import com.smartpresence.dto.response.CheckinResponse;
import com.smartpresence.entity.DeviceRegistration;
import com.smartpresence.entity.User;
import com.smartpresence.security.JwtHelper;
import com.smartpresence.service.AttendanceService;
import com.smartpresence.service.DeviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/checkin")
@RequiredArgsConstructor
@Tag(name = "Check-in", description = "Student app — device registration and BLE check-in")
public class CheckinController {

    private final AttendanceService attendanceService;
    private final DeviceService     deviceService;
    private final JwtHelper         jwtHelper;

    /**
     * One-time device registration — called on first app launch after login.
     * Permanently binds the student account to this device fingerprint.
     */
    @PostMapping("/register-device")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
        summary = "Bind student account to device (one-time registration)",
        security = @SecurityRequirement(name = "oauth2")
    )
    public ResponseEntity<ApiResponse<Void>> registerDevice(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam @NotBlank String deviceFingerprint,
            @RequestParam @NotBlank String deviceModel,
            @RequestParam DeviceRegistration.OsType osType,
            @RequestParam @NotBlank String osVersion,
            @RequestParam @NotBlank String appVersion) {

        User student = jwtHelper.resolveUser(jwt);
        deviceService.registerDevice(
                student.getUserId(), deviceFingerprint,
                deviceModel, osType, osVersion, appVersion);
        return ResponseEntity.ok(ApiResponse.ok("Device registered successfully", null));
    }

    /**
     * Main check-in endpoint.
     * The student taps "Check-In" after the BLE signal is detected
     * and the biometric prompt completes.
     *
     * Three-layer verification runs inside AttendanceService:
     *  1. BLE token valid + RSSI above threshold
     *  2. Biometric passed (reported by the OS prompt result)
     *  3. Device fingerprint matches registered primary device
     */
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
        summary = "Submit attendance check-in (BLE + biometric + device)",
        security = @SecurityRequirement(name = "oauth2")
    )
    public ResponseEntity<ApiResponse<CheckinResponse>> checkin(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CheckinRequest req) {

        User student = jwtHelper.resolveUser(jwt);
        CheckinResponse response = attendanceService.processCheckin(student.getUserId(), req);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
