package com.smartpresence.repository;

import com.smartpresence.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {

    List<Course> findByDepartmentDepartmentIdAndIsActive(Integer departmentId, Boolean isActive);

    @Query("""
        SELECT c FROM Course c
        JOIN CourseAssignment ca ON ca.course.courseId = c.courseId
        WHERE ca.lecturer.userId = :lecturerId AND ca.isActive = true
        """)
    List<Course> findByLecturer(@Param("lecturerId") Integer lecturerId);

    Page<Course> findByIsActive(Boolean isActive, Pageable pageable);
}
