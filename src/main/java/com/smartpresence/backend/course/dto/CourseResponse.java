package com.smartpresence.backend.course.dto;

import com.smartpresence.backend.course.Course;
import com.smartpresence.backend.user.AcademicDepartment;

import java.time.LocalTime;

public record CourseResponse(
    Long id,
    String courseCode,
    String courseName,
    Long lecturerId,
    String lecturerName,
    String semester,
    AcademicDepartment department,
    LocalTime lectureTime,
    String venue,
    Integer classSize
) {
    public static CourseResponse from(Course c) {
        return new CourseResponse(
            c.getId(),
            c.getCourseCode(),
            c.getCourseName(),
            c.getLecturer().getId(),
            c.getLecturer().getFirstName() + " " + c.getLecturer().getLastName(),
            c.getSemester(),
            c.getDepartment(),
            c.getLectureTime(),
            c.getVenue(),
            c.getClassSize()
        );
    }
}
