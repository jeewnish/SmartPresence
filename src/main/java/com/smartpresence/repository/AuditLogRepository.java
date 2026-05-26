package com.smartpresence.repository;

import com.smartpresence.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query(
            value = """
                    SELECT al FROM AuditLog al
                    JOIN FETCH al.actor
                    WHERE al.actor.userId = :actorId
                    ORDER BY al.performedAt DESC
                    """,
            countQuery = """
                    SELECT COUNT(al) FROM AuditLog al
                    WHERE al.actor.userId = :actorId
                    """
    )
    Page<AuditLog> findByActorUserIdWithActorOrderByPerformedAtDesc(
            @Param("actorId") Integer actorId, Pageable pageable);

    @Query(
            value = """
                    SELECT al FROM AuditLog al
                    JOIN FETCH al.actor
                    WHERE al.entityType = :entityType AND al.entityId = :entityId
                    ORDER BY al.performedAt DESC
                    """,
            countQuery = """
                    SELECT COUNT(al) FROM AuditLog al
                    WHERE al.entityType = :entityType AND al.entityId = :entityId
                    """
    )
    Page<AuditLog> findByEntityTypeAndEntityIdWithActorOrderByPerformedAtDesc(
            @Param("entityType") String entityType,
            @Param("entityId") Integer entityId,
            Pageable pageable);

    @Query(
            value = """
                    SELECT al FROM AuditLog al
                    JOIN FETCH al.actor
                    ORDER BY al.performedAt DESC
                    """,
            countQuery = "SELECT COUNT(al) FROM AuditLog al"
    )
    Page<AuditLog> findAllWithActorOrderByPerformedAtDesc(Pageable pageable);
}
