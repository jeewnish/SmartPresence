package com.smartpresence.backend.session;

import com.smartpresence.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SessionRepository extends JpaRepository<AttendanceSession, Long> {

    List<AttendanceSession> findByCreatedByOrderByStartedAtDesc(User lecturer);

    Optional<AttendanceSession> findFirstByCourseIdAndStatusOrderByStartedAtDesc(
        Long courseId, SessionStatus status);

    boolean existsByCourseIdAndStatus(Long courseId, SessionStatus status);

    long countByCourseId(Long courseId);
}
