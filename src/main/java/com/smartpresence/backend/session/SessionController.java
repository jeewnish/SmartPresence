package com.smartpresence.backend.session;

import com.smartpresence.backend.session.dto.RosterResponse;
import com.smartpresence.backend.session.dto.SessionResponse;
import com.smartpresence.backend.session.dto.StartSessionRequest;
import com.smartpresence.backend.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
@Tag(name = "Session", description = "Attendance session management")
public class SessionController {

    private final SessionService sessionService;
    private final UserService userService;

    @PostMapping("/start")
    @PreAuthorize("hasRole('LECTURER')")
    @Operation(summary = "Start an attendance session (Lecturer only)")
    public ResponseEntity<SessionResponse> start(
            @RequestBody @Valid StartSessionRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        var lecturer = userService.requireByClerkUserId(jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionService.startSession(request, lecturer));
    }

    @PostMapping("/{id}/end")
    @PreAuthorize("hasRole('LECTURER')")
    @Operation(summary = "End an attendance session (Lecturer only, must be session creator)")
    public ResponseEntity<SessionResponse> end(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        var lecturer = userService.requireByClerkUserId(jwt.getSubject());
        return ResponseEntity.ok(sessionService.endSession(id, lecturer));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get session details (session secret is hidden for non-lecturers)")
    public ResponseEntity<SessionResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.getSession(id));
    }

    @GetMapping("/active/mine")
    @PreAuthorize("hasRole('LECTURER')")
    @Operation(summary = "Get active sessions created by the authenticated lecturer")
    public ResponseEntity<List<SessionResponse>> activeMine(@AuthenticationPrincipal Jwt jwt) {
        var lecturer = userService.requireByClerkUserId(jwt.getSubject());
        return ResponseEntity.ok(sessionService.getActiveSessions(lecturer));
    }

    @GetMapping("/{id}/roster")
    @PreAuthorize("hasRole('LECTURER')")
    @Operation(summary = "Get attendance roster for a session (Lecturer only, must be session creator)")
    public ResponseEntity<RosterResponse> roster(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        var lecturer = userService.requireByClerkUserId(jwt.getSubject());
        return ResponseEntity.ok(sessionService.getRoster(id, lecturer));
    }
}
