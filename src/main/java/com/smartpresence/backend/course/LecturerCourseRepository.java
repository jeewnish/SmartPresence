package com.smartpresence.backend.course;

import com.smartpresence.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LecturerCourseRepository extends JpaRepository<LecturerCourse, Long> {
    List<LecturerCourse> findByLecturerOrderByCourseSemesterAscCourseCourseCodeAsc(User lecturer);
    boolean existsByLecturerIdAndCourseId(Long lecturerId, Long courseId);
    Optional<LecturerCourse> findByLecturerIdAndCourseId(Long lecturerId, Long courseId);
}
