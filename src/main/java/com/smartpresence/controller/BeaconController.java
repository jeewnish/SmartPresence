package com.smartpresence.controller;

import com.smartpresence.ble.beacon.BeaconMonitorService;
import com.smartpresence.dto.request.BeaconHeartbeatRequest;
import com.smartpresence.dto.response.ApiResponse;
import com.smartpresence.dto.response.BeaconStatusPayload;
import com.smartpresence.entity.BeaconHeartbeat;
import com.smartpresence.entity.BeaconStatusLog;
import com.smartpresence.repository.BeaconStatusLogRepository;
import com.smartpresence.repository.SessionRepository;
import com.smartpresence.service.SystemSettingService;
import com.smartpresence.websocket.LiveSessionPublisher;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/beacons")
@RequiredArgsConstructor
@Tag(name = "BLE Beacons", description = "Beacon health monitoring and heartbeat ingestion")
public class BeaconController {

    private final BeaconMonitorService           beaconMonitorService;
    private final BeaconStatusLogRepository      statusLogRepo;
    private final SessionRepository              sessionRepository;
    private final LiveSessionPublisher           livePublisher;
    private final SystemSettingService           settingService;

    /**
     * POSTed by physical beacon hardware every ~30 seconds.
     *
     * Auth: static API key in Authorization header.
     * Header: Authorization: Beacon <beacon_api_key>
     */
    @PostMapping("/heartbeat")
    @Operation(summary = "Beacon hardware heartbeat (called by physical beacon, not the app)")
    public ResponseEntity<ApiResponse<String>> receiveHeartbeat(
            @Valid @RequestBody BeaconHeartbeatRequest req,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // Validate beacon API key
        String apiKey = settingService.getValue("beacon_api_key");
        if (authHeader == null || !authHeader.equals("Beacon " + apiKey)) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Invalid beacon API key"));
        }

        BeaconHeartbeat heartbeat = beaconMonitorService.receiveHeartbeat(req);

        // Push updated status to admin dashboard via WebSocket
        statusLogRepo.findByBeaconMac(req.getBeaconMac())
                .ifPresent(s -> livePublisher.publishBeaconStatus(toPayload(s)));

        return ResponseEntity.ok(ApiResponse.ok("Heartbeat received", "OK"));
    }

    /**
     * Returns current status of all beacons.
     * Powers the System Health Indicator panel on the Admin Dashboard.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get current health status of all BLE beacons")
    public ResponseEntity<ApiResponse<List<BeaconStatusPayload>>> getAllStatuses() {
        List<BeaconStatusPayload> payloads = beaconMonitorService.getAllBeaconStatuses()
                .stream()
                .map(this::toPayload)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(payloads));
    }

    /**
     * Single beacon status + overall system health colour.
     * GREEN  = all beacons ONLINE
     * YELLOW = >=1 beacon DEGRADED or low battery
     * RED    = >=1 beacon OFFLINE
     */
    @GetMapping("/health")
    @PreAuthorize("hasAnyRole('ADMIN','LECTURER')")
    @Operation(summary = "Overall system health indicator: GREEN | YELLOW | RED")
    public ResponseEntity<ApiResponse<String>> systemHealth() {
        List<BeaconStatusLog> all = beaconMonitorService.getAllBeaconStatuses();

        boolean anyOffline   = all.stream().anyMatch(s ->
                s.getCurrentStatus() == BeaconHeartbeat.BeaconStatus.OFFLINE);
        boolean anyDegraded  = all.stream().anyMatch(s ->
                s.getCurrentStatus() == BeaconHeartbeat.BeaconStatus.DEGRADED
                || Boolean.TRUE.equals(s.isBatteryLow()));

        String health = anyOffline ? "RED" : (anyDegraded ? "YELLOW" : "GREEN");
        return ResponseEntity.ok(ApiResponse.ok(health));
    }

    /** Get full heartbeat history for a specific venue */
    @GetMapping("/venue/{venueId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get beacon status for a specific venue")
    public ResponseEntity<ApiResponse<BeaconStatusPayload>> getVenueBeacon(
            @PathVariable Integer venueId) {
        return statusLogRepo.findByVenueVenueId(venueId)
                .map(s -> ResponseEntity.ok(ApiResponse.ok(toPayload(s))))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private BeaconStatusPayload toPayload(BeaconStatusLog s) {
        long activeSessions = sessionRepository.countByStatus(
                com.smartpresence.entity.Session.SessionStatus.ACTIVE);

        return BeaconStatusPayload.builder()
                .venueId(s.getVenue().getVenueId())
                .venueCode(s.getVenue().getVenueCode())
                .venueName(s.getVenue().getVenueName())
                .beaconMac(s.getBeaconMac())
                .status(s.getCurrentStatus().name())
                .batteryPct(s.getBatteryPct())
                .txPowerDbm(s.getTxPowerDbm())
                .lastHeartbeatAt(s.getLastHeartbeatAt())
                .offlineSince(s.getOfflineSince())
                .consecutiveFailures(s.getConsecutiveFailures())
                .batteryLow(s.isBatteryLow())
                .hasActiveSession(activeSessions > 0)
                .systemHealth(s.getCurrentStatus() == BeaconHeartbeat.BeaconStatus.ONLINE
                        ? "GREEN"
                        : s.getCurrentStatus() == BeaconHeartbeat.BeaconStatus.DEGRADED
                        ? "YELLOW" : "RED")
                .build();
    }
}
