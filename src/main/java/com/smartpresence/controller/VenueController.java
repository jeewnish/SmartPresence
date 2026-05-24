package com.smartpresence.controller;

import com.smartpresence.dto.request.VenueUpsertRequest;
import com.smartpresence.dto.response.ApiResponse;
import com.smartpresence.entity.AuditLog;
import com.smartpresence.entity.User;
import com.smartpresence.entity.Venue;
import com.smartpresence.repository.AuditLogRepository;
import com.smartpresence.repository.VenueRepository;
import com.smartpresence.security.JwtHelper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/venues")
@RequiredArgsConstructor
@Tag(name = "Venues", description = "Venue and BLE room configuration")
public class VenueController {

    private final VenueRepository venueRepository;
    private final AuditLogRepository auditLogRepository;
    private final JwtHelper jwtHelper;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','LECTURER')")
    @Operation(summary = "Venue roster grid", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<Page<Venue>>> getVenues(
            @RequestParam(required = false) Boolean isActive,
            @PageableDefault(size = 200) Pageable pageable) {
        Page<Venue> page = (isActive != null)
                ? venueRepository.findByIsActive(isActive, pageable)
                : venueRepository.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.ok(page));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a venue", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<Venue>> createVenue(
            @Valid @RequestBody VenueUpsertRequest req,
            @AuthenticationPrincipal Jwt jwt) {
        Venue venue = Venue.builder().build();
        applyRequest(venue, req);
        Venue saved = venueRepository.save(venue);
        audit("CREATE_VENUE", saved, jwt);
        return ResponseEntity.ok(ApiResponse.ok("Venue created", saved));
    }

    @PutMapping("/{venueId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a venue", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<Venue>> updateVenue(
            @PathVariable Integer venueId,
            @Valid @RequestBody VenueUpsertRequest req,
            @AuthenticationPrincipal Jwt jwt) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Venue not found"));
        applyRequest(venue, req);
        Venue saved = venueRepository.save(venue);
        audit("UPDATE_VENUE", saved, jwt);
        return ResponseEntity.ok(ApiResponse.ok("Venue updated", saved));
    }

    private void applyRequest(Venue venue, VenueUpsertRequest req) {
        venue.setVenueCode(req.getVenueCode().trim());
        venue.setVenueName(req.getVenueName().trim());
        venue.setBuilding(blankToNull(req.getBuilding()));
        venue.setFloor(req.getFloor());
        venue.setCapacity(req.getCapacity());
        venue.setBeaconMac(blankToNull(req.getBeaconMac()));
        venue.setBeaconUuid(parseUuid(req.getBeaconUuid()));
        venue.setRssiThreshold(req.getRssiThreshold());
        venue.setIsActive(req.getIsActive() == null || req.getIsActive());
    }

    private UUID parseUuid(String value) {
        String trimmed = blankToNull(value);
        return trimmed == null ? null : UUID.fromString(trimmed);
    }

    private String blankToNull(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        return value.trim();
    }

    private void audit(String action, Venue venue, Jwt jwt) {
        User actor = jwtHelper.resolveUser(jwt);
        auditLogRepository.save(AuditLog.builder()
                .actor(actor)
                .action(action)
                .entityType("venue")
                .entityId(venue.getVenueId())
                .newValue(Map.of("venueCode", venue.getVenueCode(), "venueName", venue.getVenueName()))
                .build());
    }
}
