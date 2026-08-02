package com.smartpresence.backend.session;

import com.smartpresence.backend.attendance.AttendanceRepository;
import com.smartpresence.backend.course.Course;
import com.smartpresence.backend.course.CourseRepository;
import com.smartpresence.backend.course.LecturerCourseRepository;
import com.smartpresence.backend.enrollment.EnrollmentRepository;
import com.smartpresence.backend.session.dto.StartSessionRequest;
import com.smartpresence.backend.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {
    @Mock SessionRepository sessionRepository;
    @Mock CourseRepository courseRepository;
    @Mock EnrollmentRepository enrollmentRepository;
    @Mock AttendanceRepository attendanceRepository;
    @Mock LecturerCourseRepository lecturerCourseRepository;
    @InjectMocks SessionService service;

    @Test
    void unassignedLecturerCannotStartSessionEvenWhenLegacyCourseOwner() {
        var lecturer = User.builder().id(10L).build();
        var course = Course.builder().id(20L).lecturer(lecturer).build();
        when(courseRepository.findById(20L)).thenReturn(Optional.of(course));

        assertThatThrownBy(() -> service.startSession(new StartSessionRequest(20L), lecturer))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("not assigned");
        verify(sessionRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
