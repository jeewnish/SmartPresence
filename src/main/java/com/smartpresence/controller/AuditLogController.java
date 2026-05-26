package com.smartpresence.controller;

import com.smartpresence.dto.response.ApiResponse;
import com.smartpresence.dto.response.AuditLogEntryResponse;
import com.smartpresence.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Audit Logs", description = "Read-only immutable audit trail — Settings > System Logs tab")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @Operation(summary = "Get all audit logs (paginated, newest first)")
    public ResponseEntity<ApiResponse<Page<AuditLogEntryResponse>>> getAll(
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                auditLogRepository.findAllWithActorOrderByPerformedAtDesc(pageable)
                        .map(AuditLogEntryResponse::from)));
    }

    @GetMapping("/actor/{actorId}")
    @Operation(summary = "Get audit logs filtered by actor (admin/lecturer who made the change)")
    public ResponseEntity<ApiResponse<Page<AuditLogEntryResponse>>> getByActor(
            @PathVariable Integer actorId,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                auditLogRepository.findByActorUserIdWithActorOrderByPerformedAtDesc(actorId, pageable)
                        .map(AuditLogEntryResponse::from)));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    @Operation(summary = "Get audit history for a specific record (e.g. session, user, setting)")
    public ResponseEntity<ApiResponse<Page<AuditLogEntryResponse>>> getByEntity(
            @PathVariable String  entityType,
            @PathVariable Integer entityId,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                auditLogRepository.findByEntityTypeAndEntityIdWithActorOrderByPerformedAtDesc(
                                entityType, entityId, pageable)
                        .map(AuditLogEntryResponse::from)));
    }
}
