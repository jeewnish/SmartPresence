package com.smartpresence.service;

import com.smartpresence.dto.response.SecurityFlagReportResponse;
import com.smartpresence.entity.*;
import com.smartpresence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Report generation service — powers the Reports page.
 * All queries use JOIN FETCH or @EntityGraph so that associations are
 * eagerly loaded inside the transaction. This prevents LazyInitializationException
 * when the controller serialises results (open-in-view is disabled).
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
     * Course Attendance report — all ended sessions for a course in a date range
     * with per-session attendance count.
     */
    public List<Map<String, Object>> courseAttendanceReport(
            Integer courseId, LocalDate from, LocalDate to) {

        OffsetDateTime start = from.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime end   = to.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);

        // findByCourseAndDateRange uses JOIN FETCH and filters status <> ACTIVE
        return sessionRepository.findByCourseAndDateRange(courseId, start, end)
                .stream()
                .map(s -> {
                    long present = attendanceRepo.countPresentBySession(s.getSessionId());
                    Map<String, Object> row = new HashMap<>();
                    row.put("sessionId",       s.getSessionId());
                    row.put("date",            s.getStartedAt().toLocalDate());
                    row.put("venue",           s.getVenue() != null ? s.getVenue().getVenueCode() : "N/A");
                    row.put("studentsPresent", present);
                    row.put("startedAt",       s.getStartedAt());
                    row.put("endedAt",         s.getEndedAt());
                    return row;
                })
                .toList();
    }

    /**
     * Security Anomalies report — all flags in a date range mapped to DTOs.
     * findByDateRange uses JOIN FETCH so all relations are loaded within the transaction.
     */
    public List<SecurityFlagReportResponse> securityAnomaliesReport(LocalDate from, LocalDate to) {
        OffsetDateTime start = from.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime end   = to.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);

        return flagRepository.findByDateRange(start, end)
                .stream()
                .map(SecurityFlagReportResponse::from)
                .toList();
    }

    /**
     * Student Summary report — per-student attendance stats for a given course.
     * Uses findByCourseAndDateRange (JOIN FETCH) for sessions and a targeted
     * count query per student to avoid loading all attendance records.
     */
    public List<Map<String, Object>> studentSummaryReport(Integer courseId,
                                                           LocalDate from, LocalDate to) {
        OffsetDateTime start = from.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime end   = to.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);

        long totalSessions = sessionRepository.findByCourseAndDateRange(courseId, start, end).size();

        return userRepository.findByRoleAndIsActive(UserRole.STUDENT, true)
                .stream()
                .map(u -> {
                    // Count only attendance records for this student in the given course & range
                    long attended = attendanceRepo
                            .findByStudentUserIdOrderByCheckedInAtDesc(
                                    u.getUserId(), org.springframework.data.domain.Pageable.unpaged())
                            .stream()
                            .filter(ar -> ar.getSession() != null
                                       && ar.getSession().getCourse() != null
                                       && ar.getSession().getCourse().getCourseId().equals(courseId)
                                       && ar.getCheckedInAt() != null
                                       && ar.getCheckedInAt().isAfter(start)
                                       && ar.getCheckedInAt().isBefore(end))
                            .count();

                    double pct = totalSessions > 0
                            ? Math.round(attended * 1000.0 / totalSessions) / 10.0
                            : 0.0;

                    Map<String, Object> row = new HashMap<>();
                    row.put("studentId",        u.getUserId());
                    row.put("indexNumber",      u.getIndexNumber() != null ? u.getIndexNumber() : "");
                    row.put("studentName",      u.getFullName() != null ? u.getFullName() : "");
                    row.put("sessionsAttended", attended);
                    row.put("totalSessions",    totalSessions);
                    row.put("attendancePct",    pct);
                    return row;
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
