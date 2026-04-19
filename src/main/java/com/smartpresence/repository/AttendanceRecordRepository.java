package com.smartpresence.repository;

import com.smartpresence.entity.AttendanceRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    Optional<AttendanceRecord> findBySessionSessionIdAndStudentUserId(
            Integer sessionId, Integer studentId);

    List<AttendanceRecord> findBySessionSessionId(Integer sessionId);

    Page<AttendanceRecord> findByStudentUserIdOrderByCheckedInAtDesc(
            Integer studentId, Pageable pageable);

    long countBySessionSessionId(Integer sessionId);

    @Query("""
        SELECT COUNT(ar) FROM AttendanceRecord ar
        WHERE ar.session.sessionId = :sessionId
          AND ar.status IN ('PRESENT', 'LATE', 'MANUAL_OVERRIDE')
        """)
    long countPresentBySession(@Param("sessionId") Integer sessionId);

    @Query("""
        SELECT ar FROM AttendanceRecord ar
        JOIN FETCH ar.student
        JOIN FETCH ar.device
        WHERE ar.session.sessionId = :sessionId
        ORDER BY ar.checkedInAt DESC
        """)
    List<AttendanceRecord> findBySessionWithDetails(@Param("sessionId") Integer sessionId);

    @Query("""
        SELECT
            s.course.courseId,
            s.startedAt,
            COUNT(DISTINCT e.student.userId),
            COUNT(DISTINCT ar.student.userId)
        FROM Session s
        JOIN Enrolment e ON e.course.courseId = s.course.courseId AND e.status = 'ACTIVE'
        LEFT JOIN AttendanceRecord ar ON ar.session.sessionId = s.sessionId
        WHERE s.startedAt >= :from AND s.startedAt < :to
          AND s.status IN ('ENDED', 'FORCE_ENDED')
        GROUP BY s.course.courseId, s.startedAt
        """)
    List<Object[]> findDailyRateBetween(@Param("from") java.time.OffsetDateTime from,
                                         @Param("to")   java.time.OffsetDateTime to);
}
