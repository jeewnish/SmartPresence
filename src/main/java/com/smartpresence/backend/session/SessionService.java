package com.smartpresence.backend.session;

import com.smartpresence.backend.attendance.AttendanceRecord;
import com.smartpresence.backend.attendance.AttendanceRepository;
import com.smartpresence.backend.attendance.AttendanceStatus;
import com.smartpresence.backend.course.Course;
import com.smartpresence.backend.course.CourseRepository;
import com.smartpresence.backend.enrollment.Enrollment;
import com.smartpresence.backend.enrollment.EnrollmentRepository;
import com.smartpresence.backend.exception.ResourceNotFoundException;
import com.smartpresence.backend.session.dto.RosterResponse;
import com.smartpresence.backend.session.dto.SessionResponse;
import com.smartpresence.backend.session.dto.StartSessionRequest;
import com.smartpresence.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRepository attendanceRepository;

    @Transactional
    public SessionResponse startSession(StartSessionRequest request, User lecturer) {
        Course course = courseRepository.findById(request.courseId())
            .orElseThrow(() -> new ResourceNotFoundException("Course", request.courseId()));

        // Ownership check: only the course's lecturer can start a session
        if (!course.getLecturer().getId().equals(lecturer.getId())) {
            throw new IllegalArgumentException("You do not own this course");
        }

        String sessionSecret = UUID.randomUUID().toString().replace("-", "").toUpperCase();

        AttendanceSession session = AttendanceSession.builder()
            .course(course)
            .sessionSecret(sessionSecret)
            .status(SessionStatus.ACTIVE)
            .createdBy(lecturer)
            .build();

        return SessionResponse.from(sessionRepository.save(session));
    }

    @Transactional
    public SessionResponse endSession(Long sessionId, User lecturer) {
        AttendanceSession session = requireSession(sessionId);

        // Ownership: only the creator can end the session
        if (!session.getCreatedBy().getId().equals(lecturer.getId())) {
            throw new IllegalArgumentException("You did not create this session");
        }
        if (session.getStatus() == SessionStatus.ENDED) {
            throw new IllegalArgumentException("Session is already ended");
        }

        session.setStatus(SessionStatus.ENDED);
        session.setEndedAt(OffsetDateTime.now());
        return SessionResponse.from(sessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public SessionResponse getSession(Long sessionId) {
        return SessionResponse.fromSafe(requireSession(sessionId));
    }

    @Transactional(readOnly = true)
    public RosterResponse getRoster(Long sessionId, User lecturer) {
        AttendanceSession session = requireSession(sessionId);

        // Ownership check
        if (!session.getCreatedBy().getId().equals(lecturer.getId())) {
            throw new IllegalArgumentException("You do not have access to this session's roster");
        }

        // Build a map: studentId -> AttendanceRecord
        Map<Long, AttendanceRecord> recordMap = attendanceRepository
            .findBySessionId(sessionId)
            .stream()
            .collect(Collectors.toMap(r -> r.getStudent().getId(), r -> r));

        // Get all enrollments for this course
        Long courseId = session.getCourse().getId();
        List<Enrollment> courseEnrollments = enrollmentRepository.findByCourseId(courseId);

        List<RosterResponse.RosterEntry> entries = courseEnrollments.stream()
            .map(e -> {
                AttendanceRecord record = recordMap.get(e.getStudent().getId());
                AttendanceStatus status = record != null ? record.getStatus() : AttendanceStatus.ABSENT;
                return new RosterResponse.RosterEntry(
                    e.getStudent().getId(),
                    e.getStudent().getFirstName(),
                    e.getStudent().getLastName(),
                    e.getStudent().getEmail(),
                    status
                );
            })
            .toList();

        long presentCount = entries.stream()
            .filter(e -> e.status() == AttendanceStatus.PRESENT)
            .count();

        return new RosterResponse(
            sessionId,
            session.getCourse().getId(),
            session.getCourse().getCourseCode(),
            entries.size(),
            presentCount,
            entries
        );
    }


    private AttendanceSession requireSession(Long sessionId) {
        return sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("AttendanceSession", sessionId));
    }
}
