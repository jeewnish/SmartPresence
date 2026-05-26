package com.smartpresence.dto.response;

import com.smartpresence.entity.AuditLog;
import com.smartpresence.entity.User;

import java.time.OffsetDateTime;
import java.util.Map;

public record AuditLogEntryResponse(
        Long logId,
        ActorSummary actor,
        String action,
        String entityType,
        Integer entityId,
        Map<String, Object> oldValue,
        Map<String, Object> newValue,
        OffsetDateTime performedAt
) {

    public static AuditLogEntryResponse from(AuditLog log) {
        return new AuditLogEntryResponse(
                log.getLogId(),
                ActorSummary.from(log.getActor()),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getOldValue(),
                log.getNewValue(),
                log.getPerformedAt()
        );
    }

    public record ActorSummary(
            Integer userId,
            String firstName,
            String lastName,
            String email
    ) {
        public static ActorSummary from(User user) {
            if (user == null) {
                return null;
            }

            return new ActorSummary(
                    user.getUserId(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail()
            );
        }
    }
}
