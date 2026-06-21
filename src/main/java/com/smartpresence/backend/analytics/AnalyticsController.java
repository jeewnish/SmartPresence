package com.smartpresence.backend.analytics;

import com.smartpresence.backend.analytics.dto.LecturerHistoryResponse;
import com.smartpresence.backend.analytics.dto.StudentProgressResponse;
import com.smartpresence.backend.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Attendance analytics and reporting")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserService userService;

    @GetMapping("/students/me/progress")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my attendance progress per course (Student only)")
    public ResponseEntity<StudentProgressResponse> studentProgress(@AuthenticationPrincipal Jwt jwt) {
        var student = userService.requireByClerkUserId(jwt.getSubject());
        return ResponseEntity.ok(analyticsService.getStudentProgress(student));
    }

    @GetMapping("/lecturers/history")
    @PreAuthorize("hasRole('LECTURER')")
    @Operation(summary = "Get session history with attendance rates (Lecturer only)")
    public ResponseEntity<LecturerHistoryResponse> lecturerHistory(@AuthenticationPrincipal Jwt jwt) {
        var lecturer = userService.requireByClerkUserId(jwt.getSubject());
        return ResponseEntity.ok(analyticsService.getLecturerHistory(lecturer));
    }
}
