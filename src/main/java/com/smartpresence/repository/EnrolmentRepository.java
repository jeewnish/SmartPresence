package com.smartpresence.repository;

import com.smartpresence.entity.Enrolment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrolmentRepository extends JpaRepository<Enrolment, Integer> {

    List<Enrolment> findByStudentUserIdAndStatus(Integer studentId, Enrolment.EnrolmentStatus status);

    @Query("""
            SELECT e
            FROM Enrolment e
            WHERE e.course.courseId = :courseId
              AND e.status = :status
            """)
    List<Enrolment> findByCourseIdAndStatus(
            @Param("courseId") Integer courseId,
            @Param("status") Enrolment.EnrolmentStatus status);

    @Query("""
            SELECT e
            FROM Enrolment e
            WHERE e.student.userId = :studentId
              AND e.course.courseId = :courseId
            """)
    Optional<Enrolment> findByStudentUserIdAndCourseId(
            @Param("studentId") Integer studentId,
            @Param("courseId") Integer courseId);

    @Query("""
            SELECT (COUNT(e) > 0)
            FROM Enrolment e
            WHERE e.student.userId = :studentId
              AND e.course.courseId = :courseId
            """)
    boolean existsByStudentUserIdAndCourseId(
            @Param("studentId") Integer studentId,
            @Param("courseId") Integer courseId);

    @Query("""
            SELECT COUNT(e)
            FROM Enrolment e
            WHERE e.course.courseId = :courseId
              AND e.status = :status
            """)
    long countByCourseIdAndStatus(
            @Param("courseId") Integer courseId,
            @Param("status") Enrolment.EnrolmentStatus status);
}
