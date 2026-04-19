package com.smartpresence.service;

import com.smartpresence.entity.*;
import com.smartpresence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

/**
 * Report generation service — powers the Reports page.
 * Queries run against normalised tables (not the views) for flexibility.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final AttendanceRecordRepository attendanceRepo;
    private final SessionRepository          sessionRepository;
    private final SecurityFlagRepository     flagRepository;
    private final UserRepository             userRepository;
    private final ReportLogRepository        reportLogRepository;
    private final AuditLogRepository         auditLogRepository;

    /**
     * Course Attendance report — all sessions for a course in a date range
     * with per-session attendance rate.
     */
    public List<Map<String, Object>> courseAttendanceReport(
            Integer courseId, LocalDate from, LocalDate to) {

        OffsetDateTime start = from.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime end   = to.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);

        return sessionRepository
                .findAll().stream()
                .filter(s -> s.getCourse().getCourseId().equals(courseId)
                          && s.getStartedAt().isAfter(start)
                          && s.getStartedAt().isBefore(end)
                          && s.getStatus() != Session.SessionStatus.ACTIVE)
                .map(s -> {
                    long present = attendanceRepo.countPresentBySession(s.getSessionId());
                    return Map.<String, Object>of(
                            "sessionId",    s.getSessionId(),
                            "date",         s.getStartedAt().toLocalDate(),
                            "venue",        s.getVenue() != null ? s.getVenue().getVenueCode() : "N/A",
                            "studentsPresent", present,
                            "startedAt",    s.getStartedAt(),
                            "endedAt",      s.getEndedAt()
                    );
                })
                .toList();
    }

    /**
     * Security Anomalies report — all flags in a date range, optionally filtered
     * by course/department.
     */
    public List<SecurityFlag> securityAnomaliesReport(LocalDate from, LocalDate to) {
        OffsetDateTime start = from.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime end   = to.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);

        return flagRepository.findAll().stream()
                .filter(f -> f.getFlaggedAt().isAfter(start)
                          && f.getFlaggedAt().isBefore(end))
                .toList();
    }

    /**
     * Student Summary report — per-student attendance stats for a given course.
     */
    public List<Map<String, Object>> studentSummaryReport(Integer courseId,
                                                           LocalDate from, LocalDate to) {
        OffsetDateTime start = from.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime end   = to.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);

        long totalSessions = sessionRepository.findAll().stream()
                .filter(s -> s.getCourse().getCourseId().equals(courseId)
                          && s.getStartedAt().isAfter(start)
                          && s.getStartedAt().isBefore(end)
                          && s.getStatus() != Session.SessionStatus.ACTIVE)
                .count();

        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.STUDENT)
                .map(u -> {
                    long attended = attendanceRepo
                            .findByStudentUserIdOrderByCheckedInAtDesc(
                                    u.getUserId(), org.springframework.data.domain.Pageable.unpaged())
                            .stream()
                            .filter(ar -> ar.getSession().getCourse().getCourseId().equals(courseId)
                                       && ar.getCheckedInAt().isAfter(start)
                                       && ar.getCheckedInAt().isBefore(end))
                            .count();

                    double pct = totalSessions > 0
                            ? Math.round(attended * 1000.0 / totalSessions) / 10.0
                            : 0.0;

                    return Map.<String, Object>of(
                            "studentId",      u.getUserId(),
                            "indexNumber",    u.getIndexNumber() != null ? u.getIndexNumber() : "",
                            "studentName",    u.getFullName(),
                            "sessionsAttended", attended,
                            "totalSessions",  totalSessions,
                            "attendancePct",  pct
                    );
                })
                .toList();
    }

    /** Log every report export for audit compliance */
    @Transactional
    public void logExport(Integer generatedById, ReportLog.ReportType type,
                          LocalDate from, LocalDate to,
                          Map<String, Object> filters, ReportLog.ExportFormat format,
                          int fileSizeKb) {
        User actor = userRepository.findById(generatedById)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        reportLogRepository.save(ReportLog.builder()
                .generatedBy(actor)
                .reportType(type)
                .dateRangeStart(from)
                .dateRangeEnd(to)
                .filtersJson(filters)
                .exportFormat(format)
                .fileSizeKb(fileSizeKb)
                .build());

        auditLogRepository.save(AuditLog.builder()
                .actor(actor)
                .action("EXPORT_REPORT")
                .entityType("report")
                .newValue(Map.of("type", type.name(), "format", format.name(),
                                 "from", from.toString(), "to", to.toString()))
                .build());
    }
}
