package com.smartpresence.backend.session;

import com.smartpresence.backend.attendance.AttendanceRepository;
import com.smartpresence.backend.course.Course;
import com.smartpresence.backend.course.CourseRepository;
import com.smartpresence.backend.course.LecturerCourseRepository;
import com.smartpresence.backend.enrollment.EnrollmentRepository;
import com.smartpresence.backend.session.dto.StartSessionRequest;
import com.smartpresence.backend.user.User;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.List;
import java.time.OffsetDateTime;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
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
    void sessionStatusUsesThePostgresNamedEnumJdbcType() throws Exception {
        var annotation = AttendanceSession.class.getDeclaredField("status")
            .getAnnotation(JdbcTypeCode.class);

        assertThat(annotation).isNotNull();
        assertThat(annotation.value()).isEqualTo(SqlTypes.NAMED_ENUM);
    }

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

    @Test
    void returnsAllOwnedActiveSessionsNewestFirstWithSecrets() {
        var lecturer = User.builder().id(10L).build();
        var firstCourse = Course.builder().id(20L).courseCode("C1").courseName("One").build();
        var secondCourse = Course.builder().id(21L).courseCode("C2").courseName("Two").build();
        var newer = AttendanceSession.builder().id(31L).course(secondCourse).createdBy(lecturer)
            .sessionSecret("secret-2").status(SessionStatus.ACTIVE).startedAt(OffsetDateTime.now()).build();
        var older = AttendanceSession.builder().id(30L).course(firstCourse).createdBy(lecturer)
            .sessionSecret("secret-1").status(SessionStatus.ACTIVE)
            .startedAt(OffsetDateTime.now().minusMinutes(1)).build();
        when(sessionRepository.findByCreatedByAndStatusOrderByStartedAtDesc(
            lecturer, SessionStatus.ACTIVE)).thenReturn(List.of(newer, older));

        var result = service.getActiveSessions(lecturer);

        assertThat(result).extracting(response -> response.id()).containsExactly(31L, 30L);
        assertThat(result).extracting(response -> response.sessionSecret())
            .containsExactly("secret-2", "secret-1");
    }

    @Test
    void returnsEmptyActiveSessionListForLecturerWithoutSessions() {
        var lecturer = User.builder().id(10L).build();
        when(sessionRepository.findByCreatedByAndStatusOrderByStartedAtDesc(
            lecturer, SessionStatus.ACTIVE)).thenReturn(List.of());

        assertThat(service.getActiveSessions(lecturer)).isEmpty();
    }

    @Test
    void returnsOneOwnedActiveSession() {
        var lecturer = User.builder().id(10L).build();
        var course = Course.builder().id(20L).courseCode("C1").courseName("One").build();
        var session = AttendanceSession.builder().id(30L).course(course).createdBy(lecturer)
            .sessionSecret("secret-1").status(SessionStatus.ACTIVE).build();
        when(sessionRepository.findByCreatedByAndStatusOrderByStartedAtDesc(
            lecturer, SessionStatus.ACTIVE)).thenReturn(List.of(session));

        assertThat(service.getActiveSessions(lecturer))
            .singleElement().satisfies(response -> {
                assertThat(response.id()).isEqualTo(30L);
                assertThat(response.sessionSecret()).isEqualTo("secret-1");
            });
    }

    @Test
    void startingSecondCourseDoesNotCheckForGlobalLecturerSession() {
        var lecturer = User.builder().id(10L).build();
        var course = Course.builder().id(21L).courseCode("C2").courseName("Two").build();
        when(courseRepository.findById(21L)).thenReturn(Optional.of(course));
        when(lecturerCourseRepository.existsByLecturerIdAndCourseId(10L, 21L)).thenReturn(true);
        when(sessionRepository.existsByCourseIdAndStatus(21L, SessionStatus.ACTIVE)).thenReturn(false);
        when(sessionRepository.save(org.mockito.ArgumentMatchers.any())).thenAnswer(invocation -> {
            var session = invocation.getArgument(0, AttendanceSession.class);
            session.setId(31L);
            return session;
        });

        assertThat(service.startSession(new StartSessionRequest(21L), lecturer).id()).isEqualTo(31L);
        verify(sessionRepository).existsByCourseIdAndStatus(21L, SessionStatus.ACTIVE);
    }
}
