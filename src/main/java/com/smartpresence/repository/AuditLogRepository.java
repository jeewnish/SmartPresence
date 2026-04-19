package com.smartpresence.repository;

import com.smartpresence.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByActorUserIdOrderByPerformedAtDesc(Integer actorId, Pageable pageable);

    Page<AuditLog> findByEntityTypeAndEntityIdOrderByPerformedAtDesc(
            String entityType, Integer entityId, Pageable pageable);

    Page<AuditLog> findAllByOrderByPerformedAtDesc(Pageable pageable);
}
