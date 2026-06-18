package com.smartpresence.backend.enrollment.dto;

import com.smartpresence.backend.enrollment.Enrollment;

import java.time.OffsetDateTime;

public record EnrollmentResponse(
    Long id,
    Long studentId,
    Long courseId,
    String courseCode,
    String courseName,
    String semester,
    OffsetDateTime enrolledAt
) {
    public static EnrollmentResponse from(Enrollment e) {
        return new EnrollmentResponse(
            e.getId(),
            e.getStudent().getId(),
            e.getCourse().getId(),
            e.getCourse().getCourseCode(),
            e.getCourse().getCourseName(),
            e.getCourse().getSemester(),
            e.getEnrolledAt()
        );
    }
}
