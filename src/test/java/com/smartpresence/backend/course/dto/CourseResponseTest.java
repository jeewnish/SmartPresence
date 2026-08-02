package com.smartpresence.backend.course.dto;

import com.smartpresence.backend.course.Course;
import com.smartpresence.backend.user.User;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

class CourseResponseTest {

    @Test
    void includesDatabaseBackedLectureDetails() {
        var lecturer = User.builder().id(1L).firstName("Sharon").lastName("Danapala").build();
        var course = Course.builder()
            .id(13L)
            .courseCode("IS2101")
            .courseName("Object Oriented Programming")
            .lecturer(lecturer)
            .semester("Semester 2")
            .lectureTime(LocalTime.of(22, 0))
            .venue("Hall B")
            .classSize(34)
            .build();

        var response = CourseResponse.from(course);

        assertThat(response.lectureTime()).isEqualTo(LocalTime.of(22, 0));
        assertThat(response.venue()).isEqualTo("Hall B");
        assertThat(response.classSize()).isEqualTo(34);
    }
}
