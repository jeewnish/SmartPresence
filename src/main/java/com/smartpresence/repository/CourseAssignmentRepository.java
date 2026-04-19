package com.smartpresence.repository;

import com.smartpresence.entity.CourseAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseAssignmentRepository extends JpaRepository<CourseAssignment, Integer> {

    List<CourseAssignment> findByLecturerUserIdAndIsActive(Integer lecturerId, Boolean isActive);

    @Query("SELECT ca FROM CourseAssignment ca WHERE ca.course.courseId = :courseId AND ca.isActive = true")
    List<CourseAssignment> findActiveByCourseId(@Param("courseId") Integer courseId);

    @Query("""
            SELECT ca
            FROM CourseAssignment ca
            WHERE ca.lecturer.userId = :lecturerId
              AND ca.course.courseId = :courseId
              AND ca.isActive = :isActive
            """)
    Optional<CourseAssignment> findByLecturerUserIdAndCourseIdAndIsActive(
            @Param("lecturerId") Integer lecturerId,
            @Param("courseId") Integer courseId,
            @Param("isActive") Boolean isActive);
}
