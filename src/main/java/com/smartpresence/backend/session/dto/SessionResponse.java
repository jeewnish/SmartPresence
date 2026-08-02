package com.smartpresence.backend.session.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.smartpresence.backend.session.AttendanceSession;
import com.smartpresence.backend.session.SessionStatus;

import java.time.OffsetDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record SessionResponse(
    Long id,
    Long courseId,
    String courseCode,
    String courseName,
    /** Returned to the lecturer to broadcast via BLE. NOT exposed to students. */
    String sessionSecret,
    SessionStatus status,
    OffsetDateTime startedAt,
    OffsetDateTime endedAt,
    Long createdById
) {
    public static SessionResponse from(AttendanceSession s) {
        return new SessionResponse(
            s.getId(),
            s.getCourse().getId(),
            s.getCourse().getCourseCode(),
            s.getCourse().getCourseName(),
            s.getSessionSecret(),
            s.getStatus(),
            s.getStartedAt(),
            s.getEndedAt(),
            s.getCreatedBy().getId()
        );
    }

    /** Student-safe view — omits the session secret. */
    public static SessionResponse fromSafe(AttendanceSession s) {
        return new SessionResponse(
            s.getId(),
            s.getCourse().getId(),
            s.getCourse().getCourseCode(),
            s.getCourse().getCourseName(),
            null,
            s.getStatus(),
            s.getStartedAt(),
            s.getEndedAt(),
            s.getCreatedBy().getId()
        );
    }
}
