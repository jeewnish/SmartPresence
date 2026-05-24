package com.smartpresence.controller;

import com.smartpresence.dto.request.CourseUpsertRequest;
import com.smartpresence.dto.response.ApiResponse;
import com.smartpresence.entity.*;
import com.smartpresence.repository.*;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Course roster and lecturer assignment")
public class CourseController {

    private final CourseRepository           courseRepository;
    private final DepartmentRepository       departmentRepository;
    private final CourseAssignmentRepository assignmentRepository;
    private final UserRepository             userRepository;
    private final AuditLogRepository         auditLogRepository;
    private final JwtHelper                  jwtHelper;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','LECTURER')")
    @Operation(summary = "Course roster grid", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<Page<Course>>> getCourses(
            @RequestParam(required = false) Boolean isActive,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Course> page = (isActive != null)
                ? courseRepository.findByIsActive(isActive, pageable)
                : courseRepository.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.ok(page));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a course", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<Course>> createCourse(
            @Valid @RequestBody CourseUpsertRequest req,
            @AuthenticationPrincipal Jwt jwt) {
        courseRepository.findByCourseCode(req.getCourseCode().trim())
                .ifPresent(existing -> {
                    throw new IllegalStateException("Course code already exists");
                });

        Course course = Course.builder().build();
        applyRequest(course, req);
        Course saved = courseRepository.save(course);
        audit("CREATE_COURSE", saved, jwt);
        return ResponseEntity.ok(ApiResponse.ok("Course created", saved));
    }

    @PutMapping("/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a course", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<Course>> updateCourse(
            @PathVariable Integer courseId,
            @Valid @RequestBody CourseUpsertRequest req,
            @AuthenticationPrincipal Jwt jwt) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        courseRepository.findByCourseCode(req.getCourseCode().trim())
                .filter(existing -> !existing.getCourseId().equals(courseId))
                .ifPresent(existing -> {
                    throw new IllegalStateException("Course code already exists");
                });

        applyRequest(course, req);
        Course saved = courseRepository.save(course);
        audit("UPDATE_COURSE", saved, jwt);
        return ResponseEntity.ok(ApiResponse.ok("Course updated", saved));
    }

    @GetMapping("/my-courses")
    @PreAuthorize("hasRole('LECTURER')")
    @Operation(summary = "Lecturer App — list of assigned courses", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<List<Course>>> myCourses(
            @AuthenticationPrincipal Jwt jwt) {
        User lecturer = jwtHelper.resolveUser(jwt);
        return ResponseEntity.ok(ApiResponse.ok(
                courseRepository.findByLecturer(lecturer.getUserId())));
    }

    @PostMapping("/{courseId}/assign-lecturer")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Quick Assign Modal — assign a lecturer to a course", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<CourseAssignment>> assignLecturer(
            @PathVariable Integer courseId,
            @RequestParam Integer lecturerId,
            @AuthenticationPrincipal Jwt jwt) {

        User admin = jwtHelper.resolveUser(jwt);
        Course course   = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        User   lecturer = userRepository.findById(lecturerId)
                .orElseThrow(() -> new IllegalArgumentException("Lecturer not found"));

        assignmentRepository.findActiveByCourseId(courseId)
                .forEach(a -> { a.setIsActive(false); assignmentRepository.save(a); });

        CourseAssignment assignment = CourseAssignment.builder()
                .course(course).lecturer(lecturer).assignedBy(admin).isActive(true)
                .build();
        CourseAssignment saved = assignmentRepository.save(assignment);

        auditLogRepository.save(AuditLog.builder()
                .actor(admin).action("ASSIGN_LECTURER").entityType("course_assignment")
                .entityId(saved.getAssignmentId())
                .newValue(Map.of("courseId", courseId, "lecturerId", lecturerId))
                .build());

        return ResponseEntity.ok(ApiResponse.ok("Lecturer assigned", saved));
    }

    private void applyRequest(Course course, CourseUpsertRequest req) {
        Department department = departmentRepository.findById(req.getDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        course.setCourseCode(req.getCourseCode().trim());
        course.setCourseName(req.getCourseName().trim());
        course.setDepartment(department);
        course.setCreditHours(req.getCreditHours());
        course.setLevel(req.getLevel());
        course.setSemester(req.getSemester());
        course.setAcademicYear(req.getAcademicYear());
        course.setDescription(blankToNull(req.getDescription()));
        course.setIsActive(req.getIsActive() == null || req.getIsActive());
    }

    private String blankToNull(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        return value.trim();
    }

    private void audit(String action, Course course, Jwt jwt) {
        User actor = jwtHelper.resolveUser(jwt);
        auditLogRepository.save(AuditLog.builder()
                .actor(actor)
                .action(action)
                .entityType("course")
                .entityId(course.getCourseId())
                .newValue(Map.of("courseCode", course.getCourseCode(), "courseName", course.getCourseName()))
                .build());
    }
}
