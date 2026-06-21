package com.smartpresence.backend.course;

import com.smartpresence.backend.course.dto.CourseResponse;
import com.smartpresence.backend.course.dto.CreateCourseRequest;
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
@RequestMapping("/courses")
@RequiredArgsConstructor
@Tag(name = "Course", description = "Course management")
public class CourseController {

    private final CourseService courseService;
    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('LECTURER')")
    @Operation(summary = "Create a new course (Lecturer only)")
    public ResponseEntity<CourseResponse> create(
            @RequestBody @Valid CreateCourseRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        var lecturer = userService.requireByClerkUserId(jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createCourse(request, lecturer));
    }

    @GetMapping
    @Operation(summary = "List all courses")
    public ResponseEntity<List<CourseResponse>> getAll() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course by ID")
    public ResponseEntity<CourseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('LECTURER')")
    @Operation(summary = "Get my courses (Lecturer only)")
    public ResponseEntity<List<CourseResponse>> getMyCourses(@AuthenticationPrincipal Jwt jwt) {
        var lecturer = userService.requireByClerkUserId(jwt.getSubject());
        return ResponseEntity.ok(courseService.getMyCourses(lecturer));
    }
}
