package com.smartpresence.backend.attendance;

import com.smartpresence.backend.attendance.dto.*;
import com.smartpresence.backend.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/attendance", "/api/v1/attendance"})
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "BLE-based attendance check-in flow")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserService userService;

    /**
     * Step 3: Request a short-lived challenge after biometric success.
     */
    @PostMapping("/challenge")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Request attendance challenge (Student only)")
    public ResponseEntity<ChallengeResponse> challenge(
            @RequestBody @Valid ChallengeRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        var student = userService.requireByClerkUserId(jwt.getSubject());
        return ResponseEntity.ok(attendanceService.requestChallenge(request, student));
    }

    /**
     * Step 4: Exchange challenge for a short-lived attendance JWT.
     */
    @PostMapping("/token")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Exchange challenge for attendance token (Student only)")
    public ResponseEntity<TokenResponse> token(
            @RequestBody @Valid TokenRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        var student = userService.requireByClerkUserId(jwt.getSubject());
        return ResponseEntity.ok(attendanceService.requestToken(request, student));
    }

    /**
     * Step 5: Submit attendance with BLE token + attendance token.
     * Runs through the full 8-step validation pipeline.
     */
    @PostMapping("/check-in")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit BLE attendance check-in (Student only)")
    public ResponseEntity<CheckInResponse> checkIn(
            @RequestBody @Valid CheckInRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        var student = userService.requireByClerkUserId(jwt.getSubject());
        return ResponseEntity.ok(attendanceService.checkIn(request, student));
    }

    /**
     * Offline sync: batch submit records captured while offline.
     * Uses session-window-based expiry validation instead of server time.
     */
    @PostMapping("/offline-sync")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Batch offline sync of attendance records (Student only)")
    public ResponseEntity<OfflineSyncResponse> offlineSync(
            @RequestBody @Valid OfflineSyncRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        var student = userService.requireByClerkUserId(jwt.getSubject());
        return ResponseEntity.ok(attendanceService.offlineSync(request, student));
    }
}
