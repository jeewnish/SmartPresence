package com.smartpresence.backend.enrollment;

import com.smartpresence.backend.enrollment.dto.EnrollRequest;
import com.smartpresence.backend.enrollment.dto.EnrollmentResponse;
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
@RequestMapping("/enrollments")
@RequiredArgsConstructor
@Tag(name = "Enrollment", description = "Course enrollment (students)")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    @Operation(summary = "Enroll in a course (Student only)")
    public ResponseEntity<EnrollmentResponse> enroll(
            @RequestBody @Valid EnrollRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        var student = userService.requireByClerkUserId(jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollmentService.enroll(request, student));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    @Operation(summary = "Get my enrollments (Student only)")
    public ResponseEntity<List<EnrollmentResponse>> getMyEnrollments(@AuthenticationPrincipal Jwt jwt) {
        var student = userService.requireByClerkUserId(jwt.getSubject());
        return ResponseEntity.ok(enrollmentService.getMyEnrollments(student));
    }
}
