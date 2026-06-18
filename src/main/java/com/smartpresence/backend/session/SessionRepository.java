package com.smartpresence.backend.session;

import com.smartpresence.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionRepository extends JpaRepository<AttendanceSession, Long> {

    List<AttendanceSession> findByCreatedByOrderByStartedAtDesc(User lecturer);

    long countByCourseId(Long courseId);
}
