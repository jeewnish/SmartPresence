package com.smartpresence.backend.user;

import com.smartpresence.backend.user.dto.OnboardRequest;
import com.smartpresence.backend.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "User registration and profile")
public class UserController {

    private final UserService userService;

    /**
     * Called by the mobile app after the first successful Clerk sign-in.
     * Idempotent — safe to call multiple times; returns the existing user if already onboarded.
     */
    @PostMapping("/onboard")
    @Operation(summary = "Onboard a new user (idempotent)")
    public ResponseEntity<UserResponse> onboard(
            @RequestBody @Valid OnboardRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(401).build();
        }
        UserResponse response = userService.onboard(request, jwt.getSubject());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get the authenticated user's profile")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getByClerkUserId(jwt.getSubject()));
    }
}
