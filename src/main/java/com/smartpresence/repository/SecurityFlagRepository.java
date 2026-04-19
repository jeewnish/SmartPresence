package com.smartpresence.repository;

import com.smartpresence.entity.SecurityFlag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityFlagRepository extends JpaRepository<SecurityFlag, Integer> {

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
}
