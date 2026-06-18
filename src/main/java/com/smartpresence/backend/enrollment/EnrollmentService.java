package com.smartpresence.backend.enrollment;

import com.smartpresence.backend.course.CourseRepository;
import com.smartpresence.backend.enrollment.dto.EnrollRequest;
import com.smartpresence.backend.enrollment.dto.EnrollmentResponse;
import com.smartpresence.backend.exception.ResourceNotFoundException;
import com.smartpresence.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public EnrollmentResponse enroll(EnrollRequest request, User student) {
        var course = courseRepository.findById(request.courseId())
            .orElseThrow(() -> new ResourceNotFoundException("Course", request.courseId()));

        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), request.courseId())) {
            // Return existing enrollment (idempotent)
            return enrollmentRepository.findByStudent(student).stream()
                .filter(e -> e.getCourse().getId().equals(request.courseId()))
                .findFirst()
                .map(EnrollmentResponse::from)
                .orElseThrow();
        }

        Enrollment enrollment = Enrollment.builder()
            .student(student)
            .course(course)
            .build();
        return EnrollmentResponse.from(enrollmentRepository.save(enrollment));
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getMyEnrollments(User student) {
        return enrollmentRepository.findByStudent(student)
            .stream()
            .map(EnrollmentResponse::from)
            .toList();
    }
}
