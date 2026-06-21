package com.smartpresence.backend.course;

import com.smartpresence.backend.user.User;
import com.smartpresence.backend.user.AcademicDepartment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByLecturer(User lecturer);

    List<Course> findByLecturerOrderBySemesterAscCourseCodeAsc(User lecturer);

    List<Course> findBySemesterOrderByDepartmentAscCourseCodeAsc(String semester);

    List<Course> findByDepartmentAndSemesterOrderByCourseCodeAsc(
        AcademicDepartment department,
        String semester
    );

    boolean existsByCourseCode(String courseCode);
}
