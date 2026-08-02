package com.smartpresence.backend;

import com.smartpresence.backend.attendance.AttendanceRecord;
import com.smartpresence.backend.attendance.AttendanceRepository;
import com.smartpresence.backend.attendance.AttendanceStatus;
import com.smartpresence.backend.attendance.VerificationMethod;
import com.smartpresence.backend.ble.BleCheckinEvent;
import com.smartpresence.backend.ble.BleCheckinRepository;
import com.smartpresence.backend.ble.CheckinResult;
import com.smartpresence.backend.course.Course;
import com.smartpresence.backend.course.CourseRepository;
import com.smartpresence.backend.device.DeviceRegistration;
import com.smartpresence.backend.device.DeviceRepository;
import com.smartpresence.backend.device.PlatformType;
import com.smartpresence.backend.session.AttendanceSession;
import com.smartpresence.backend.session.SessionRepository;
import com.smartpresence.backend.session.SessionStatus;
import com.smartpresence.backend.user.User;
import com.smartpresence.backend.user.UserRepository;
import com.smartpresence.backend.user.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.OffsetDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
@Transactional
class PostgresEnumPersistenceIT {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired UserRepository userRepository;
    @Autowired CourseRepository courseRepository;
    @Autowired SessionRepository sessionRepository;
    @Autowired DeviceRepository deviceRepository;
    @Autowired AttendanceRepository attendanceRepository;
    @Autowired BleCheckinRepository bleCheckinRepository;

    @Test
    void hibernateBindsEveryPostgresEnumAndActiveSessionQueries() {
        var lecturer = userRepository.saveAndFlush(User.builder()
            .clerkUserId("enum-it-lecturer")
            .email("enum-it-lecturer@smartpresence.test")
            .firstName("Enum")
            .lastName("Lecturer")
            .role(UserRole.ROLE_LECTURER)
            .build());
        var student = userRepository.saveAndFlush(User.builder()
            .clerkUserId("enum-it-student")
            .email("enum-it-student@smartpresence.test")
            .firstName("Enum")
            .lastName("Student")
            .role(UserRole.ROLE_STUDENT)
            .build());
        var course = courseRepository.saveAndFlush(Course.builder()
            .courseCode("ENUM-IT-" + System.nanoTime())
            .courseName("PostgreSQL Enum Integration")
            .lecturer(lecturer)
            .semester("TEST")
            .build());

        var older = sessionRepository.saveAndFlush(AttendanceSession.builder()
            .course(course)
            .createdBy(lecturer)
            .sessionSecret("OLDER-SECRET")
            .status(SessionStatus.ACTIVE)
            .startedAt(OffsetDateTime.now().minusMinutes(1))
            .build());
        var newer = sessionRepository.saveAndFlush(AttendanceSession.builder()
            .course(course)
            .createdBy(lecturer)
            .sessionSecret("NEWER-SECRET")
            .status(SessionStatus.ACTIVE)
            .startedAt(OffsetDateTime.now())
            .build());

        var otherLecturer = userRepository.saveAndFlush(User.builder()
            .clerkUserId("enum-it-other-lecturer")
            .email("enum-it-other-lecturer@smartpresence.test")
            .firstName("Other")
            .lastName("Lecturer")
            .role(UserRole.ROLE_LECTURER)
            .build());
        var otherCourse = courseRepository.saveAndFlush(Course.builder()
            .courseCode("ENUM-OTHER-" + System.nanoTime())
            .courseName("Other Lecturer Course")
            .lecturer(otherLecturer)
            .semester("TEST")
            .build());
        sessionRepository.saveAndFlush(AttendanceSession.builder()
            .course(otherCourse)
            .createdBy(otherLecturer)
            .sessionSecret("OTHER-SECRET")
            .status(SessionStatus.ACTIVE)
            .startedAt(OffsetDateTime.now().plusSeconds(1))
            .build());

        assertThat(sessionRepository.existsByCourseIdAndStatus(course.getId(), SessionStatus.ACTIVE)).isTrue();
        assertThat(sessionRepository.findByCreatedByAndStatusOrderByStartedAtDesc(
            lecturer, SessionStatus.ACTIVE)).extracting(AttendanceSession::getId)
            .containsExactly(newer.getId(), older.getId());

        var device = deviceRepository.saveAndFlush(DeviceRegistration.builder()
            .user(student)
            .deviceId("enum-it-device-" + System.nanoTime())
            .deviceName("Integration Android")
            .platform(PlatformType.ANDROID)
            .build());
        assertThat(deviceRepository.findByDeviceId(device.getDeviceId()))
            .get().extracting(DeviceRegistration::getPlatform).isEqualTo(PlatformType.ANDROID);

        var attendance = attendanceRepository.saveAndFlush(AttendanceRecord.builder()
            .student(student)
            .session(newer)
            .status(AttendanceStatus.PRESENT)
            .verificationMethod(VerificationMethod.BLE_BIOMETRIC)
            .build());
        assertThat(attendanceRepository.findBySessionId(newer.getId()))
            .singleElement()
            .satisfies(record -> {
                assertThat(record.getStatus()).isEqualTo(AttendanceStatus.PRESENT);
                assertThat(record.getVerificationMethod()).isEqualTo(VerificationMethod.BLE_BIOMETRIC);
            });
        assertThat(attendanceRepository.countBySessionIdAndStatus(
            newer.getId(), AttendanceStatus.PRESENT)).isEqualTo(1);
        assertThat(attendanceRepository.countByStudentIdAndSessionCourseIdAndStatus(
            student.getId(), course.getId(), AttendanceStatus.PRESENT)).isEqualTo(1);

        bleCheckinRepository.saveAndFlush(BleCheckinEvent.builder()
            .student(student)
            .device(device)
            .session(newer)
            .token("A1B2")
            .rssi(-55)
            .result(CheckinResult.SUCCESS)
            .attendanceRecord(attendance)
            .build());
        assertThat(bleCheckinRepository.findBySessionIdOrderByCreatedAtDesc(newer.getId()))
            .singleElement()
            .extracting(BleCheckinEvent::getResult).isEqualTo(CheckinResult.SUCCESS);
    }
}
