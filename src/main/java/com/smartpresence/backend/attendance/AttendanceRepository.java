package com.smartpresence.backend.attendance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<AttendanceRecord, Long> {

    List<AttendanceRecord> findBySessionId(Long sessionId);

    List<AttendanceRecord> findByStudentIdOrderByAttendanceTimeDesc(Long studentId);

    boolean existsByStudentIdAndSessionId(Long studentId, Long sessionId);

    long countByStudentIdAndSessionCourseIdAndStatus(Long studentId, Long courseId, AttendanceStatus status);

    long countBySessionIdAndStatus(Long sessionId, AttendanceStatus status);
}
