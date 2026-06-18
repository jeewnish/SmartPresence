package com.smartpresence.backend.course;

import com.smartpresence.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByLecturer(User lecturer);

    boolean existsByCourseCode(String courseCode);
}
