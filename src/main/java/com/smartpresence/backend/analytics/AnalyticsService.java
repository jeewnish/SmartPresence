package com.smartpresence.backend.analytics;

import com.smartpresence.backend.analytics.dto.*;
import com.smartpresence.backend.attendance.AttendanceRepository;
import com.smartpresence.backend.attendance.AttendanceStatus;
import com.smartpresence.backend.enrollment.EnrollmentRepository;
import com.smartpresence.backend.session.SessionRepository;
import com.smartpresence.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final EnrollmentRepository enrollmentRepository;
    private final SessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;

    @Transactional(readOnly = true)
    public StudentProgressResponse getStudentProgress(User student) {
        List<CourseProgressEntry> entries = enrollmentRepository.findByStudent(student)
            .stream()
            .map(enrollment -> {
                var course = enrollment.getCourse();
                long totalSessions = sessionRepository.countByCourseId(course.getId());
                long attended = attendanceRepository.countByStudentIdAndSessionCourseIdAndStatus(
                    student.getId(), course.getId(), AttendanceStatus.PRESENT);
                double pct = totalSessions > 0
                    ? Math.round((double) attended / totalSessions * 1000.0) / 10.0
                    : 0.0;
                return new CourseProgressEntry(
                    course.getId(), course.getCourseCode(), course.getCourseName(),
                    course.getSemester(), totalSessions, attended, pct
                );
            })
            .toList();

        return new StudentProgressResponse(
            student.getId(),
            student.getFirstName() + " " + student.getLastName(),
            entries
        );
    }

    @Transactional(readOnly = true)
    public LecturerHistoryResponse getLecturerHistory(User lecturer) {
        List<SessionHistoryEntry> entries = sessionRepository
            .findByCreatedByOrderByStartedAtDesc(lecturer)
            .stream()
            .map(session -> {
                var course = session.getCourse();
                long enrolled = enrollmentRepository.countByCourseId(course.getId());
                long present = attendanceRepository.countBySessionIdAndStatus(
                    session.getId(), AttendanceStatus.PRESENT);
                double rate = enrolled > 0
                    ? Math.round((double) present / enrolled * 1000.0) / 10.0
                    : 0.0;
                return new SessionHistoryEntry(
                    session.getId(), course.getId(), course.getCourseCode(),
                    course.getCourseName(), session.getStatus(),
                    session.getStartedAt(), session.getEndedAt(),
                    enrolled, present, rate
                );
            })
            .toList();

        return new LecturerHistoryResponse(
            lecturer.getId(),
            lecturer.getFirstName() + " " + lecturer.getLastName(),
            entries
        );
    }
}
