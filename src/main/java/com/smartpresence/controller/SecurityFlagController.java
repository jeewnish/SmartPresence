package com.smartpresence.controller;

import com.smartpresence.dto.response.ApiResponse;
import com.smartpresence.entity.SecurityFlag;
import com.smartpresence.entity.User;
import com.smartpresence.repository.SecurityFlagRepository;
import com.smartpresence.repository.UserRepository;
import com.smartpresence.security.JwtHelper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/security-flags")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Security Flags", description = "Anomaly management — resolve flags, review student history")
public class SecurityFlagController {

    private final SecurityFlagRepository flagRepository;
    private final UserRepository         userRepository;
    private final JwtHelper              jwtHelper;

    @GetMapping("/open")
    @Operation(summary = "All unresolved flags ordered by severity", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<Page<SecurityFlag>>> getOpen(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                flagRepository.findByResolvedOrderBySeverityDescFlaggedAtDesc(
                        false, PageRequest.of(page, size))));
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "All flags for a specific student", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<List<SecurityFlag>>> getByStudent(
            @PathVariable Integer studentId) {
        return ResponseEntity.ok(ApiResponse.ok(
                flagRepository.findByUserUserIdOrderByFlaggedAtDesc(studentId)));
    }

    @PatchMapping("/{flagId}/resolve")
    @Operation(summary = "Mark a security flag as resolved", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<SecurityFlag>> resolve(
            @PathVariable Integer flagId,
            @RequestParam String note,
            @AuthenticationPrincipal Jwt jwt) {

        User admin = jwtHelper.resolveUser(jwt);
        SecurityFlag flag = flagRepository.findById(flagId)
                .orElseThrow(() -> new IllegalArgumentException("Flag not found: " + flagId));

        flag.setResolved(true);
        flag.setResolvedBy(admin);
        flag.setResolvedAt(OffsetDateTime.now());
        flag.setResolutionNote(note);
        return ResponseEntity.ok(ApiResponse.ok("Flag resolved", flagRepository.save(flag)));
    }
}
