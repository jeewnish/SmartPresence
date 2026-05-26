package com.smartpresence.repository;

import com.smartpresence.entity.SecurityFlag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SecurityFlagRepository extends JpaRepository<SecurityFlag, Integer> {

    @EntityGraph(attributePaths = {"user", "session", "session.course"})
    Page<SecurityFlag> findWithDetailsByResolvedOrderBySeverityDescFlaggedAtDesc(
            boolean resolved, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "session", "session.course"})
    List<SecurityFlag> findWithDetailsByUserUserIdOrderByFlaggedAtDesc(Integer userId);

    @EntityGraph(attributePaths = {"user", "session", "session.course", "resolvedBy"})
    @Query("SELECT sf FROM SecurityFlag sf WHERE sf.flagId = :flagId")
    Optional<SecurityFlag> findWithDetailsByFlagId(@Param("flagId") Integer flagId);

    long countByResolved(boolean resolved);

    Page<SecurityFlag> findByResolvedOrderBySeverityDescFlaggedAtDesc(
            boolean resolved, Pageable pageable);

    List<SecurityFlag> findByUserUserIdOrderByFlaggedAtDesc(Integer userId);

    @Query("""
        SELECT COUNT(sf) FROM SecurityFlag sf
        WHERE sf.user.userId = :studentId
          AND sf.session.sessionId = :sessionId
          AND sf.resolved = false
        """)
    long countOpenFlagsForStudentInSession(
            @Param("studentId")  Integer studentId,
            @Param("sessionId")  Integer sessionId);

    @Query("""
        SELECT COUNT(sf) FROM SecurityFlag sf
        WHERE sf.user.userId = :studentId
          AND sf.session.sessionId = :sessionId
        """)
    long countAttemptsForStudentInSession(
            @Param("studentId")  Integer studentId,
            @Param("sessionId")  Integer sessionId);

    /**
     * Fetch flags in a date range with all lazy associations eagerly loaded so
     * the result can be safely mapped to a DTO outside the persistence context.
     */
    @Query("""
        SELECT sf FROM SecurityFlag sf
        JOIN FETCH sf.user
        LEFT JOIN FETCH sf.session s
        LEFT JOIN FETCH s.course
        WHERE sf.flaggedAt >= :from
          AND sf.flaggedAt < :to
        ORDER BY sf.flaggedAt DESC
        """)
    List<SecurityFlag> findByDateRange(
            @Param("from") OffsetDateTime from,
            @Param("to")   OffsetDateTime to);
}
