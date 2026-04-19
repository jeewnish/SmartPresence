package com.smartpresence.repository;

import com.smartpresence.entity.CheckinAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface CheckinAttemptRepository extends JpaRepository<CheckinAttempt, Long> {

    List<CheckinAttempt> findBySessionSessionIdOrderByAttemptedAtDesc(Integer sessionId);

    long countByStudentUserIdAndSessionSessionId(Integer studentId, Integer sessionId);

    long countByStudentUserIdAndSessionSessionIdAndOutcomeNot(
            Integer studentId, Integer sessionId, CheckinAttempt.CheckinOutcome outcome);

    /** Count failed attempts in the last N minutes — used for rapid-checkin detection */
    long countByStudentUserIdAndSessionSessionIdAndAttemptedAtAfter(
            Integer studentId, Integer sessionId, OffsetDateTime since);
}
