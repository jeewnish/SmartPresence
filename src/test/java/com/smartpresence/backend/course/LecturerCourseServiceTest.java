package com.smartpresence.backend.course;

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
class LecturerCourseServiceTest {
    @Mock LecturerCourseRepository lecturerCourseRepository;
    @Mock CourseRepository courseRepository;
    @InjectMocks LecturerCourseService service;

    @Test
    void assignsCatalogSubject() {
        var lecturer = User.builder().id(10L).build();
        var course = Course.builder().id(20L).courseCode("IS2101").courseName("Object Oriented Programming")
            .semester("Semester 2").lecturer(lecturer).build();
        when(courseRepository.findById(20L)).thenReturn(Optional.of(course));

        service.assign(20L, lecturer);

        verify(lecturerCourseRepository).save(org.mockito.ArgumentMatchers.argThat(assignment ->
            assignment.getLecturer() == lecturer && assignment.getCourse() == course));
    }

    @Test
    void rejectsDuplicateAssignment() {
        var lecturer = User.builder().id(10L).build();
        var course = Course.builder().id(20L).courseCode("IS2101").build();
        when(courseRepository.findById(20L)).thenReturn(Optional.of(course));
        when(lecturerCourseRepository.existsByLecturerIdAndCourseId(10L, 20L)).thenReturn(true);

        assertThatThrownBy(() -> service.assign(20L, lecturer))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("already assigned");
        verify(lecturerCourseRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
