package com.smartpresence.backend.enrollment;

import com.smartpresence.backend.course.Course;
import com.smartpresence.backend.course.CourseRepository;
import com.smartpresence.backend.enrollment.dto.EnrollRequest;
import com.smartpresence.backend.user.AcademicDepartment;
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
class EnrollmentServiceTest {

    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private CourseRepository courseRepository;
    @InjectMocks private EnrollmentService service;

    @Test
    void rejectsDirectEnrollmentInAnotherDepartmentsCourse() {
        var student = User.builder().id(10L).department(AcademicDepartment.CIS).build();
        var course = Course.builder().id(20L).department(AcademicDepartment.SE).build();
        when(courseRepository.findById(20L)).thenReturn(Optional.of(course));

        assertThatThrownBy(() -> service.enroll(new EnrollRequest(20L), student))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("their department");
        verify(enrollmentRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
