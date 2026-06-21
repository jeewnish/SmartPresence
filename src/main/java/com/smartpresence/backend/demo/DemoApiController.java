package com.smartpresence.backend.demo;

import com.smartpresence.backend.session.SessionService;
import com.smartpresence.backend.session.dto.SessionResponse;
import com.smartpresence.backend.session.dto.StartSessionRequest;
import com.smartpresence.backend.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DemoApiController {

    private final DemoApiService demoApiService;
    private final SessionService sessionService;
    private final UserService userService;

    @GetMapping("/students/me/courses")
    @PreAuthorize("hasRole('STUDENT')")
    public DemoApiService.StudentCoursesResponse studentCourses(
            @AuthenticationPrincipal Jwt jwt) {
        return demoApiService.studentCourses(userService.requireByClerkUserId(jwt.getSubject()));
    }

    @GetMapping("/students/me/attendance")
    @PreAuthorize("hasRole('STUDENT')")
    public DemoApiService.StudentAttendanceResponse studentAttendance(
            @AuthenticationPrincipal Jwt jwt) {
        return demoApiService.studentAttendance(userService.requireByClerkUserId(jwt.getSubject()));
    }

    @GetMapping("/lecturers/me/courses")
    @PreAuthorize("hasRole('LECTURER')")
    public DemoApiService.LecturerCoursesResponse lecturerCourses(
            @AuthenticationPrincipal Jwt jwt) {
        return demoApiService.lecturerCourses(userService.requireByClerkUserId(jwt.getSubject()));
    }

    @GetMapping("/sessions/active")
    public DemoApiService.ActiveSessionResponse activeSession(@RequestParam Long courseId) {
        return demoApiService.activeSession(courseId);
    }

    @PostMapping("/sessions")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<SessionResponse> startSession(
            @RequestBody @Valid StartSessionRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        var lecturer = userService.requireByClerkUserId(jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(sessionService.startSession(request, lecturer));
    }

    @PatchMapping("/sessions/{sessionId}/end")
    @PreAuthorize("hasRole('LECTURER')")
    public SessionResponse endSession(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal Jwt jwt) {
        return sessionService.endSession(
            sessionId,
            userService.requireByClerkUserId(jwt.getSubject()));
    }

    @GetMapping("/sessions/{sessionId}/attendance")
    @PreAuthorize("hasRole('LECTURER')")
    public DemoApiService.SessionAttendanceResponse sessionAttendance(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal Jwt jwt) {
        return demoApiService.sessionAttendance(
            sessionId,
            userService.requireByClerkUserId(jwt.getSubject()));
    }

    @GetMapping("/sessions/{sessionId}/checkin-events/me")
    @PreAuthorize("hasRole('STUDENT')")
    public DemoApiService.CheckinEventsResponse checkinEvents(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal Jwt jwt) {
        return demoApiService.checkinEvents(
            sessionId,
            userService.requireByClerkUserId(jwt.getSubject()));
    }
}
