package com.smartpresence.controller;

import com.smartpresence.dto.request.RegisterRequest;
import com.smartpresence.dto.response.ApiResponse;
import com.smartpresence.entity.User;
import com.smartpresence.entity.UserRole;
import com.smartpresence.repository.UserRepository;
import com.smartpresence.service.KeycloakAdminService;
import com.smartpresence.service.UserService;
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

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User directory — students, lecturers, admins")
public class UserController {

    private final UserService          userService;
    private final KeycloakAdminService keycloakAdminService;
    private final UserRepository       userRepository;

    /**
     * Register a new user.
     * Creates the account in Keycloak first, then a local profile row.
     * Keycloak sends a "Set Password" email to the new user automatically.
     */
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Register a new user (creates in Keycloak + local DB)",
        security = @SecurityRequirement(name = "oauth2")
    )
    public ResponseEntity<ApiResponse<User>> register(
            @Valid @RequestBody RegisterRequest req) {
        User user = keycloakAdminService.registerUser(req);
        return ResponseEntity.ok(ApiResponse.ok("User registered. Password email sent.", user));
    }

    /** Unified data grid with tab-switching via the role param */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Search/filter users (Students | Lecturers | Admins tab)",
        security = @SecurityRequirement(name = "oauth2")
    )
    public ResponseEntity<ApiResponse<Page<User>>> searchUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Integer  departmentId,
            @RequestParam(required = false) Short    enrollmentYear,
            @RequestParam(required = false) Boolean  isActive,
            @RequestParam(required = false) String   search,
            @PageableDefault(size = 20) Pageable     pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                userService.searchUsers(role, departmentId, enrollmentYear,
                        isActive, search, pageable)));
    }

    /** Quick-View Drawer — detailed profile for a single user */
    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','LECTURER') or @userSecurityHelper.isSelf(authentication, #userId)")
    @Operation(
        summary = "Get full user profile for the Quick-View Drawer",
        security = @SecurityRequirement(name = "oauth2")
    )
    public ResponseEntity<ApiResponse<User>> getUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserById(userId)));
    }

    /** Suspend / activate — disables in both Keycloak and local DB */
    @PatchMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Suspend or activate a user account",
        security = @SecurityRequirement(name = "oauth2")
    )
    public ResponseEntity<ApiResponse<User>> setStatus(
            @PathVariable Integer userId,
            @RequestParam boolean active,
            @AuthenticationPrincipal Jwt jwt) {

        User actor = resolveActor(jwt);
        User updated = userService.setAccountStatus(userId, active, actor.getUserId());
        return ResponseEntity.ok(ApiResponse.ok(
                active ? "Account activated" : "Account suspended", updated));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private User resolveActor(Jwt jwt) {
        String email = jwt.getClaimAsString("preferred_username");
        if (email == null) email = jwt.getClaimAsString("email");
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Actor not found in local DB"));
    }
}
