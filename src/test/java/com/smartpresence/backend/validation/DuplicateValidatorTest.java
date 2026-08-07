package com.smartpresence.backend.validation;

import com.smartpresence.backend.attendance.AttendanceRepository;
import com.smartpresence.backend.ble.CheckinResult;
import com.smartpresence.backend.course.Course;
import com.smartpresence.backend.session.AttendanceSession;
import com.smartpresence.backend.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DuplicateValidatorTest {
    @Mock AttendanceRepository attendanceRepository;

    @Test
    void rejectsTheSameStudentTwiceWithinOneSession() {
        var student = User.builder().id(7L).build();
        var context = context(101L, student);
        when(attendanceRepository.existsByStudentIdAndSessionId(7L, 101L)).thenReturn(true);

        assertThatThrownBy(() -> new DuplicateValidator(attendanceRepository).validate(context))
            .isInstanceOfSatisfying(ValidationException.class,
                error -> org.assertj.core.api.Assertions.assertThat(error.getResult())
                    .isEqualTo(CheckinResult.ALREADY_PRESENT));
    }

    @Test
    void allowsTheSameStudentInADifferentSessionOfTheSameCourse() {
        var student = User.builder().id(7L).build();
        when(attendanceRepository.existsByStudentIdAndSessionId(7L, 101L)).thenReturn(true);
        when(attendanceRepository.existsByStudentIdAndSessionId(7L, 102L)).thenReturn(false);
        var validator = new DuplicateValidator(attendanceRepository);
        var course = Course.builder().id(40L).build();
        var firstContext = context(101L, student);
        firstContext.setSession(AttendanceSession.builder().id(101L).course(course).build());
        var secondContext = context(102L, student);
        secondContext.setSession(AttendanceSession.builder().id(102L).course(course).build());

        assertThatThrownBy(() -> validator.validate(firstContext))
            .isInstanceOf(ValidationException.class);
        assertThatCode(() -> validator.validate(secondContext)).doesNotThrowAnyException();
    }

    private ValidationContext context(Long sessionId, User student) {
        return new ValidationContext(sessionId, 1L, "token", -50, "device", "attendance-token", student, false);
    }
}
