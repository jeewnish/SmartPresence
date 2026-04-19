package com.smartpresence.service;

import com.smartpresence.dto.response.DashboardKpiResponse;
import com.smartpresence.dto.response.ActiveSessionResponse;
import com.smartpresence.dto.response.AlertResponse;
import com.smartpresence.entity.*;
import com.smartpresence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final UserRepository             userRepository;
    private final SessionRepository          sessionRepository;
    private final AttendanceRecordRepository attendanceRepo;
    private final SecurityFlagRepository     flagRepository;
    private final NotificationRepository     notificationRepository;

    /** Powers the 4 KPI cards at the top of the Admin Dashboard */
    public DashboardKpiResponse getKpis() {
        long totalActiveStudents = userRepository.countByRoleAndIsActive(UserRole.STUDENT, true);
        long activeSessions      = sessionRepository.countByStatus(Session.SessionStatus.ACTIVE);
        long openFlags           = flagRepository.countByResolved(false);

        // Today's average attendance % across all sessions started today
        List<Session> todaySessions = sessionRepository.findAllActiveSessions().stream()
                .filter(s -> s.getStartedAt().toLocalDate()
                        .equals(java.time.LocalDate.now()))
                .toList();

        double avgAttendance = 0.0;
        if (!todaySessions.isEmpty()) {
            avgAttendance = todaySessions.stream()
                    .mapToLong(s -> attendanceRepo.countPresentBySession(s.getSessionId()))
                    .average()
                    .orElse(0.0);
        }

        return DashboardKpiResponse.builder()
                .totalActiveStudents(totalActiveStudents)
                .todayAvgAttendancePct(Math.round(avgAttendance * 10.0) / 10.0)
                .activeSessionsNow(activeSessions)
                .openSecurityFlags(openFlags)
                .build();
    }

    /** Powers the Active Sessions board cards */
    public List<ActiveSessionResponse> getActiveSessions() {
        return sessionRepository.findAllActiveSessions().stream()
                .map(s -> {
                    long checkedIn = attendanceRepo.countPresentBySession(s.getSessionId());
                    long elapsed   = Duration.between(s.getStartedAt(), OffsetDateTime.now()).toMinutes();
                    long remaining = s.getScheduledDurationMinutes() - elapsed;

                    return ActiveSessionResponse.builder()
                            .sessionId(s.getSessionId())
                            .courseCode(s.getCourse().getCourseCode())
                            .courseName(s.getCourse().getCourseName())
                            .lecturerName(s.getLecturer().getFullName())
                            .venueName(s.getVenue() != null ? s.getVenue().getVenueName() : "N/A")
                            .venueCode(s.getVenue() != null ? s.getVenue().getVenueCode() : "N/A")
                            .startedAt(s.getStartedAt())
                            .elapsedMinutes(elapsed)
                            .remainingMinutes(remaining)
                            .studentsCheckedIn(checkedIn)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /** Powers the Alerts Feed — top 20 unresolved security flags */
    public List<AlertResponse> getAlertsFeed() {
        return flagRepository
                .findByResolvedOrderBySeverityDescFlaggedAtDesc(false, PageRequest.of(0, 20))
                .stream()
                .map(f -> AlertResponse.builder()
                        .flagId(f.getFlagId())
                        .flagType(f.getFlagType().name())
                        .severity(f.getSeverity().name())
                        .studentName(f.getUser().getFullName())
                        .indexNumber(f.getUser().getIndexNumber())
                        .courseCode(f.getSession() != null
                                ? f.getSession().getCourse().getCourseCode() : null)
                        .description(f.getDescription())
                        .flaggedAt(f.getFlaggedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
