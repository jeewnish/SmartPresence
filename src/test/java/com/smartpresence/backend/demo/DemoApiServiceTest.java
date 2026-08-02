package com.smartpresence.backend.demo;

import com.smartpresence.backend.attendance.AttendanceRepository;
import com.smartpresence.backend.ble.BleCheckinRepository;
import com.smartpresence.backend.course.Course;
import com.smartpresence.backend.course.CourseRepository;
import com.smartpresence.backend.course.LecturerCourseRepository;
import com.smartpresence.backend.config.AcademicProperties;
import com.smartpresence.backend.enrollment.EnrollmentRepository;
import com.smartpresence.backend.session.SessionRepository;
import com.smartpresence.backend.user.AcademicDepartment;
import com.smartpresence.backend.user.User;
import com.smartpresence.backend.user.UserRole;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DemoApiServiceTest {

    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private CourseRepository courseRepository;
    @Mock private AttendanceRepository attendanceRepository;
    @Mock private SessionRepository sessionRepository;
    @Mock private BleCheckinRepository bleCheckinRepository;
    @Mock private LecturerCourseRepository lecturerCourseRepository;
    @Spy private AcademicProperties academicProperties = new AcademicProperties();
    @InjectMocks private DemoApiService service;

    @Test
    void attendanceCoursesComeOnlyFromAuthenticatedStudentsDepartmentAndSemesterTwo() {
        var student = User.builder()
            .id(10L)
            .role(UserRole.ROLE_STUDENT)
            .department(AcademicDepartment.SE)
            .build();
        var lecturer = User.builder().id(1L).firstName("Sharon").lastName("Danapala").build();
        var course = Course.builder()
            .id(20L)
            .courseCode("SE2101")
            .courseName("Algorithms, Data Structures, and Complexity")
            .semester("Semester 2")
            .department(AcademicDepartment.SE)
            .lecturer(lecturer)
            .build();
        when(courseRepository.findByDepartmentAndSemesterOrderByCourseCodeAsc(
            AcademicDepartment.SE, "Semester 2"
        )).thenReturn(List.of(course));

        var response = service.studentCourses(student);

        assertThat(response.studentId()).isEqualTo(10L);
        assertThat(response.courses()).hasSize(1);
        assertThat(response.courses().getFirst().semester()).isEqualTo("Semester 2");
        assertThat(response.courses().getFirst().courses())
            .extracting(DemoApiService.CourseItem::courseCode)
            .containsExactly("SE2101");
        verify(courseRepository).findByDepartmentAndSemesterOrderByCourseCodeAsc(
            AcademicDepartment.SE, "Semester 2"
        );
    }

    @Test
    void rejectsStudentWithoutDepartment() {
        var student = User.builder().id(10L).role(UserRole.ROLE_STUDENT).build();

        assertThatThrownBy(() -> service.studentCourses(student))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("no department");
    }

    @Test
    void returnsExpectedCatalogSizeForEachDepartment() {
        assertCatalogSize(AcademicDepartment.CIS, "IS", 13);
        assertCatalogSize(AcademicDepartment.SE, "SE", 10);
        assertCatalogSize(AcademicDepartment.DS, "DS", 10);
    }

    private void assertCatalogSize(AcademicDepartment department, String prefix, int size) {
        var lecturer = User.builder().id(1L).firstName("Sharon").lastName("Danapala").build();
        var courses = java.util.stream.IntStream.range(0, size)
            .mapToObj(index -> Course.builder()
                .id((long) index + 1)
                .courseCode(prefix + index)
                .courseName("Course " + index)
                .semester("Semester 2")
                .department(department)
                .lecturer(lecturer)
                .build())
            .toList();
        when(courseRepository.findByDepartmentAndSemesterOrderByCourseCodeAsc(
            department, "Semester 2"
        )).thenReturn(courses);

        var student = User.builder()
            .id(10L)
            .role(UserRole.ROLE_STUDENT)
            .department(department)
            .build();

        assertThat(service.studentCourses(student).courses().getFirst().courses()).hasSize(size);
    }
}
