package com.smartpresence.repository;

import com.smartpresence.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Integer> {

    List<Session> findByStatus(Session.SessionStatus status);

    List<Session> findByLecturerUserIdAndStatus(Integer lecturerId, Session.SessionStatus status);

    Optional<Session> findByBleTokenAndStatus(String bleToken, Session.SessionStatus status);

    @Query("""
        SELECT s FROM Session s
        WHERE s.bleToken = :token
          AND s.status = 'ACTIVE'
          AND s.bleTokenExpiresAt > CURRENT_TIMESTAMP
        """)
    Optional<Session> findValidActiveSession(@Param("token") String token);

    long countByStatus(Session.SessionStatus status);

    @Query("""
        SELECT s FROM Session s
        JOIN FETCH s.course
        JOIN FETCH s.lecturer
        LEFT JOIN FETCH s.venue
        WHERE s.status = 'ACTIVE'
        """)
    List<Session> findAllActiveSessions();

    @Query("""
        SELECT s FROM Session s
        JOIN FETCH s.course
        JOIN FETCH s.lecturer
        LEFT JOIN FETCH s.venue
        WHERE s.course.courseId = :courseId
          AND s.startedAt >= :from
          AND s.startedAt < :to
          AND s.status <> 'ACTIVE'
        """)
    List<Session> findByCourseAndDateRange(
            @Param("courseId") Integer courseId,
            @Param("from")     java.time.OffsetDateTime from,
            @Param("to")       java.time.OffsetDateTime to);

    @Query("""
        SELECT s FROM Session s
        JOIN FETCH s.course
        JOIN FETCH s.lecturer
        LEFT JOIN FETCH s.venue
        WHERE s.startedAt >= :from
          AND s.startedAt < :to
          AND s.status <> 'ACTIVE'
        """)
    List<Session> findAllEndedInDateRange(
            @Param("from") java.time.OffsetDateTime from,
            @Param("to")   java.time.OffsetDateTime to);
}
