package com.smartpresence.controller;

import com.smartpresence.dto.response.ApiResponse;
import com.smartpresence.dto.response.UserProfileResponse;
import com.smartpresence.entity.User;
import com.smartpresence.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

/**
 * Auth endpoints.
 *
 * Login is handled entirely by Keycloak — the mobile apps call
 * Keycloak's token endpoint directly. This controller only provides
 * a /me endpoint so clients can fetch their profile after login.
 *
 * Token endpoint (called by mobile apps, NOT by this backend):
 *   POST http://keycloak:8180/realms/smartpresence/protocol/openid-connect/token
 *   Body: grant_type=password&client_id=smartpresence-app&username=...&password=...
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Profile endpoint — login is handled by Keycloak")
public class AuthController {

    private final UserRepository userRepository;

    /**
     * Returns the currently authenticated user's profile.
     * The frontend calls this immediately after obtaining a token from Keycloak.
     *
     * The JWT's "preferred_username" claim (= email in Keycloak) is used to
     * look up the local User row which holds SmartPresence-specific data
     * (index number, department, enrollment year, etc.).
     */
    @GetMapping("/me")
    @Operation(
        summary = "Get my profile",
        description = "Returns the authenticated user's SmartPresence profile. Call this after login.",
        security = @SecurityRequirement(name = "oauth2")
    )
    public ResponseEntity<ApiResponse<UserProfileResponse>> me(
            @AuthenticationPrincipal Jwt jwt) {

        String preferredUsername = jwt.getClaimAsString("preferred_username");
        final String email = preferredUsername != null
                ? preferredUsername
                : jwt.getClaimAsString("email");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException(
                        "User exists in Keycloak but not in SmartPresence DB: " + email));

        UserProfileResponse profile = UserProfileResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .indexNumber(user.getIndexNumber())
                .enrollmentYear(user.getEnrollmentYear())
                .isActive(user.getIsActive())
                // Pass through useful Keycloak claims
                .keycloakSubject(jwt.getSubject())
                .tokenExpiresAt(jwt.getExpiresAt())
                .build();

        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    /**
     * Returns the Keycloak token endpoint URL so mobile apps know where to
     * authenticate. They call this URL directly, not through this backend.
     */
    @GetMapping("/token-endpoint")
    @Operation(summary = "Get Keycloak token endpoint URL (for mobile app config)")
    public ResponseEntity<ApiResponse<String>> tokenEndpoint(
            @AuthenticationPrincipal Jwt jwt) {
        // Returns from the well-known config — clients can use this to dynamically
        // discover the token URL instead of hardcoding it
        String issuer = jwt != null ? jwt.getIssuer().toString() : "unknown";
        return ResponseEntity.ok(ApiResponse.ok(
                issuer + "/protocol/openid-connect/token"));
    }
}
