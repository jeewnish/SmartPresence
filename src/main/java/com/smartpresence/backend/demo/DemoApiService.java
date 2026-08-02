package com.smartpresence.backend.demo;

import com.smartpresence.backend.attendance.AttendanceRepository;
import com.smartpresence.backend.attendance.AttendanceStatus;
import com.smartpresence.backend.attendance.VerificationMethod;
import com.smartpresence.backend.ble.BleCheckinRepository;
import com.smartpresence.backend.ble.CheckinResult;
import com.smartpresence.backend.course.CourseRepository;
import com.smartpresence.backend.course.LecturerCourse;
import com.smartpresence.backend.course.LecturerCourseRepository;
import com.smartpresence.backend.config.AcademicProperties;
import com.smartpresence.backend.enrollment.EnrollmentRepository;
import com.smartpresence.backend.exception.ResourceNotFoundException;
import com.smartpresence.backend.session.SessionRepository;
import com.smartpresence.backend.session.SessionStatus;
import com.smartpresence.backend.user.User;
import com.smartpresence.backend.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DemoApiService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final AttendanceRepository attendanceRepository;
    private final SessionRepository sessionRepository;
    private final BleCheckinRepository bleCheckinRepository;
    private final LecturerCourseRepository lecturerCourseRepository;
    private final AcademicProperties academicProperties;

    @Transactional(readOnly = true)
    public StudentCoursesResponse studentCourses(User student) {
        if (student.getRole() != UserRole.ROLE_STUDENT || student.getDepartment() == null) {
            throw new IllegalArgumentException(
                "Student account has no department. Set a valid universityId during onboarding."
            );
        }

        var courses = courseRepository
            .findByDepartmentAndSemesterOrderByCourseCodeAsc(student.getDepartment(), academicProperties.getActiveSemester())
            .stream()
            .map(CourseItem::from)
            .toList();

        return new StudentCoursesResponse(
            student.getId(),
            List.of(new SemesterCourses(academicProperties.getActiveSemester(), courses)));
    }

    @Transactional(readOnly = true)
    public StudentAttendanceResponse studentAttendance(User student) {
        var records = attendanceRepository.findByStudentIdOrderByAttendanceTimeDesc(student.getId())
            .stream()
            .map(record -> new AttendanceHistoryItem(
                record.getId(),
                record.getStatus(),
                record.getAttendanceTime(),
                record.getVerificationMethod(),
                new SessionItem(
                    record.getSession().getId(),
                    record.getSession().getStatus(),
                    record.getSession().getStartedAt(),
                    record.getSession().getEndedAt()),
                new CourseItem(
                    record.getSession().getCourse().getId(),
                    record.getSession().getCourse().getCourseCode(),
                    record.getSession().getCourse().getCourseName(),
                    record.getSession().getCourse().getSemester(),
                    record.getSession().getCourse().getLecturer().getFirstName() + " "
                        + record.getSession().getCourse().getLecturer().getLastName())))
            .toList();
        return new StudentAttendanceResponse(student.getId(), records);
    }

    @Transactional(readOnly = true)
    public LecturerCoursesResponse lecturerCourses(User lecturer) {
        return new LecturerCoursesResponse(
            lecturer.getId(),
            lecturerCourseRepository.findByLecturerOrderByCourseSemesterAscCourseCourseCodeAsc(lecturer)
                .stream()
                .map(LecturerCourse::getCourse)
                .map(CourseItem::from)
                .toList());
    }

    @Transactional(readOnly = true)
    public ActiveSessionResponse activeSession(Long courseId) {
        return sessionRepository
            .findFirstByCourseIdAndStatusOrderByStartedAtDesc(courseId, SessionStatus.ACTIVE)
            .map(session -> new ActiveSessionResponse(
                session.getId(),
                session.getCourse().getId(),
                session.getCourse().getCourseCode(),
                session.getCourse().getCourseName(),
                SessionStatus.ACTIVE.name(),
                session.getStartedAt()))
            .orElseGet(() -> new ActiveSessionResponse(
                null, courseId, null, null, "NO_ACTIVE_SESSION", null));
    }

    @Transactional(readOnly = true)
    public SessionAttendanceResponse sessionAttendance(Long sessionId, User lecturer) {
        var session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("AttendanceSession", sessionId));
        if (!session.getCreatedBy().getId().equals(lecturer.getId())) {
            throw new IllegalArgumentException("You do not have access to this session");
        }

        var recordsByStudent = attendanceRepository.findBySessionId(sessionId).stream()
            .collect(java.util.stream.Collectors.toMap(
                record -> record.getStudent().getId(),
                record -> record));

        var students = enrollmentRepository.findByCourseId(session.getCourse().getId()).stream()
            .map(enrollment -> {
                var student = enrollment.getStudent();
                var record = recordsByStudent.get(student.getId());
                return new SessionStudentItem(
                    student.getId(),
                    student.getClerkUserId(),
                    student.getFirstName(),
                    student.getLastName(),
                    record == null ? AttendanceStatus.ABSENT : record.getStatus(),
                    record == null ? null : record.getAttendanceTime(),
                    record == null ? null : record.getVerificationMethod());
            })
            .sorted(java.util.Comparator
                .comparing(SessionStudentItem::lastName)
                .thenComparing(SessionStudentItem::firstName))
            .toList();

        return new SessionAttendanceResponse(
            session.getId(),
            session.getCourse().getCourseCode(),
            session.getCourse().getCourseName(),
            session.getStatus(),
            session.getStartedAt(),
            session.getEndedAt(),
            students);
    }

    @Transactional(readOnly = true)
    public CheckinEventsResponse checkinEvents(Long sessionId, User student) {
        if (!sessionRepository.existsById(sessionId)) {
            throw new ResourceNotFoundException("AttendanceSession", sessionId);
        }
        var events = bleCheckinRepository
            .findByStudentIdAndSessionIdOrderByCreatedAtAsc(student.getId(), sessionId)
            .stream()
            .map(event -> new CheckinEventItem(
                event.getId(),
                event.getResult(),
                event.getRssi(),
                event.getDistanceEstimate(),
                event.getFailureReason(),
                event.isBiometricVerified(),
                event.getCreatedAt()))
            .toList();
        return new CheckinEventsResponse(sessionId, events);
    }

    public record StudentCoursesResponse(Long studentId, List<SemesterCourses> courses) {}
    public record SemesterCourses(String semester, List<CourseItem> courses) {}
    public record LecturerCoursesResponse(Long lecturerId, List<CourseItem> courses) {}

    public record CourseItem(
        Long id,
        String courseCode,
        String courseName,
        String semester,
        String lecturerName
    ) {
        static CourseItem from(com.smartpresence.backend.course.Course course) {
            return new CourseItem(
                course.getId(),
                course.getCourseCode(),
                course.getCourseName(),
                course.getSemester(),
                course.getLecturer().getFirstName() + " " + course.getLecturer().getLastName());
        }
    }

    public record StudentAttendanceResponse(
        Long studentId,
        List<AttendanceHistoryItem> records
    ) {}

    public record AttendanceHistoryItem(
        Long recordId,
        AttendanceStatus status,
        OffsetDateTime attendanceTime,
        VerificationMethod verificationMethod,
        SessionItem session,
        CourseItem course
    ) {}

    public record SessionItem(
        Long id,
        SessionStatus status,
        OffsetDateTime startedAt,
        OffsetDateTime endedAt
    ) {}

    public record ActiveSessionResponse(
        Long sessionId,
        Long courseId,
        String courseCode,
        String courseName,
        String status,
        OffsetDateTime startedAt
    ) {}

    public record SessionAttendanceResponse(
        Long sessionId,
        String courseCode,
        String courseName,
        SessionStatus status,
        OffsetDateTime startedAt,
        OffsetDateTime endedAt,
        List<SessionStudentItem> students
    ) {}

    public record SessionStudentItem(
        Long studentId,
        String username,
        String firstName,
        String lastName,
        AttendanceStatus attendanceStatus,
        OffsetDateTime attendanceTime,
        VerificationMethod verificationMethod
    ) {}

    public record CheckinEventsResponse(Long sessionId, List<CheckinEventItem> events) {}

    public record CheckinEventItem(
        Long id,
        CheckinResult result,
        Integer rssi,
        BigDecimal distanceEstimate,
        String failureReason,
        boolean biometricVerified,
        OffsetDateTime createdAt
    ) {}
}
