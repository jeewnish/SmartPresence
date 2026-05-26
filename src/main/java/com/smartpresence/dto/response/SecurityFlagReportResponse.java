package com.smartpresence.dto.response;

import com.smartpresence.entity.SecurityFlag;

import java.time.OffsetDateTime;

/**
 * Serialisation-safe DTO for the Security Anomalies report endpoint.
 * <p>
 * {@link SecurityFlag} has several LAZY-loaded relations (user, session, device).
 * Returning the raw entity from the controller causes Jackson to attempt
 * proxy serialisation outside the JPA session, resulting in a 500
 * {@code LazyInitializationException}.  This record reads only the fields
 * that have already been eagerly fetched by the repository query.
 */
public record SecurityFlagReportResponse(
        Integer flagId,
        String  flagType,
        String  severity,
        String  description,
        String  flaggedAt,
        boolean resolved,
        String  resolvedAt,
        String  resolutionNote,
        UserSummary user,
        SessionSummary session
) {

    public static SecurityFlagReportResponse from(SecurityFlag sf) {
        UserSummary userSummary = null;
        if (sf.getUser() != null) {
            var u = sf.getUser();
            userSummary = new UserSummary(
                    u.getUserId(),
                    u.getFirstName(),
                    u.getLastName(),
                    u.getIndexNumber()
            );
        }

        SessionSummary sessionSummary = null;
        if (sf.getSession() != null) {
            var s = sf.getSession();
            sessionSummary = new SessionSummary(
                    s.getSessionId(),
                    s.getCourse() != null ? s.getCourse().getCourseCode() : null,
                    s.getCourse() != null ? s.getCourse().getCourseName() : null
            );
        }

        return new SecurityFlagReportResponse(
                sf.getFlagId(),
                sf.getFlagType() != null ? sf.getFlagType().name() : null,
                sf.getSeverity() != null ? sf.getSeverity().name() : null,
                sf.getDescription(),
                sf.getFlaggedAt() != null ? sf.getFlaggedAt().toString() : null,
                Boolean.TRUE.equals(sf.getResolved()),
                sf.getResolvedAt() != null ? sf.getResolvedAt().toString() : null,
                sf.getResolutionNote(),
                userSummary,
                sessionSummary
        );
    }

    public record UserSummary(
            Integer userId,
            String  firstName,
            String  lastName,
            String  indexNumber
    ) {}

    public record SessionSummary(
            Integer sessionId,
            String  courseCode,
            String  courseName
    ) {}
}
