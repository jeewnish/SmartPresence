package com.smartpresence.backend.validation;

import com.smartpresence.backend.ble.CheckinResult;
import com.smartpresence.backend.enrollment.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Step 4: Enrollment validation.
 *
 * Checks that the student is enrolled in the session's course.
 * This is re-validated here even though it was checked during challenge issuance
 * ("never trust earlier validation").
 */
@Component
@RequiredArgsConstructor
public class EnrollmentValidator {

    private final EnrollmentRepository enrollmentRepository;

    public void validate(ValidationContext ctx) {
        Long courseId = ctx.getSession().getCourse().getId();
        if (!enrollmentRepository.existsByStudentIdAndCourseId(ctx.getStudent().getId(), courseId)) {
            throw new ValidationException(CheckinResult.INVALID_DEVICE,
                "Student is not enrolled in this course");
        }
    }
}
