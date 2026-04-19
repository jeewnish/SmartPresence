package com.smartpresence.controller;

import com.smartpresence.ble.broadcast.BleBroadcastService;
import com.smartpresence.ble.BleTokenService;
import com.smartpresence.dto.response.ApiResponse;
import com.smartpresence.dto.response.BleSessionPayload;
import com.smartpresence.entity.BleBroadcastEvent;
import com.smartpresence.entity.Session;
import com.smartpresence.entity.User;
import com.smartpresence.repository.SessionRepository;
import com.smartpresence.security.JwtHelper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ble")
@RequiredArgsConstructor
@Tag(name = "BLE Sessions", description = "BLE token lifecycle for Lecturer App and Student App")
public class BleSessionController {

    private final BleBroadcastService broadcastService;
    private final BleTokenService     tokenService;
    private final SessionRepository   sessionRepository;
    private final JwtHelper           jwtHelper;

    @GetMapping("/session/{sessionId}/token")
    @PreAuthorize("hasAnyRole('LECTURER','ADMIN')")
    @Operation(summary = "Get current BLE token for an active session", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<BleSessionPayload>> getCurrentToken(
            @PathVariable Integer sessionId) {

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        if (session.getStatus() != Session.SessionStatus.ACTIVE) {
            return ResponseEntity.ok(ApiResponse.error("Session is not active"));
        }

        BleSessionPayload payload = BleSessionPayload.builder()
                .sessionId(session.getSessionId())
                .courseCode(session.getCourse().getCourseCode())
                .courseName(session.getCourse().getCourseName())
                .venueCode(session.getVenue() != null ? session.getVenue().getVenueCode() : null)
                .beaconMac(session.getVenue() != null ? session.getVenue().getBeaconMac() : null)
                .bleToken(session.getBleToken())
                .tokenExpiresAt(session.getBleTokenExpiresAt())
                .sessionActive(true)
                .rotationCount(session.getTokenRotationCount())
                .build();

        return ResponseEntity.ok(ApiResponse.ok(payload));
    }

    @PostMapping("/session/{sessionId}/rotate-token")
    @PreAuthorize("hasAnyRole('LECTURER','ADMIN')")
    @Operation(summary = "Manually rotate the BLE token", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<BleSessionPayload>> rotateToken(
            @PathVariable Integer sessionId,
            @AuthenticationPrincipal Jwt jwt) {

        User actor = jwtHelper.resolveUser(jwt);
        broadcastService.rotateToken(sessionId, actor);

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        BleSessionPayload payload = BleSessionPayload.builder()
                .sessionId(session.getSessionId())
                .courseCode(session.getCourse().getCourseCode())
                .bleToken(session.getBleToken())
                .tokenExpiresAt(session.getBleTokenExpiresAt())
                .sessionActive(true)
                .rotationCount(session.getTokenRotationCount())
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Token rotated", payload));
    }

    @GetMapping("/session/lookup")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Look up session details from a BLE token (Student App pre-check)", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<BleSessionPayload>> lookupByToken(
            @RequestParam String bleToken) {

        return tokenService.validateToken(bleToken)
                .map(session -> {
                    BleSessionPayload payload = BleSessionPayload.builder()
                            .sessionId(session.getSessionId())
                            .courseCode(session.getCourse().getCourseCode())
                            .courseName(session.getCourse().getCourseName())
                            .venueCode(session.getVenue() != null
                                    ? session.getVenue().getVenueCode() : null)
                            .beaconMac(session.getVenue() != null
                                    ? session.getVenue().getBeaconMac() : null)
                            .bleToken(bleToken)
                            .tokenExpiresAt(session.getBleTokenExpiresAt())
                            .sessionActive(true)
                            .rotationCount(session.getTokenRotationCount())
                            .build();
                    return ResponseEntity.ok(ApiResponse.ok(payload));
                })
                .orElseGet(() ->
                        ResponseEntity.ok(ApiResponse.error("Token invalid or session not active")));
    }

    @GetMapping("/session/{sessionId}/events")
    @PreAuthorize("hasAnyRole('ADMIN','LECTURER')")
    @Operation(summary = "BLE broadcast event log for a session", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<List<BleBroadcastEvent>>> getEventLog(
            @PathVariable Integer sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(broadcastService.getEventLog(sessionId)));
    }

    @GetMapping("/session/{sessionId}/token-status")
    @PreAuthorize("hasAnyRole('LECTURER','ADMIN')")
    @Operation(summary = "Is the current BLE token near expiry?", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<Boolean>> isNearExpiry(@PathVariable Integer sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(tokenService.isNearExpiry(sessionId)));
    }
}
