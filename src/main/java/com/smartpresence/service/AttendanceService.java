package com.smartpresence.service;

import com.smartpresence.ble.validator.BleCheckinValidator;
import com.smartpresence.dto.request.CheckinRequest;
import com.smartpresence.dto.response.CheckinResponse;
import com.smartpresence.entity.*;
import com.smartpresence.repository.*;
import com.smartpresence.websocket.LiveSessionPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Core three-layer check-in pipeline.
 *
 * Layer 1 — BLE Proximity   : token valid + RSSI >= venue threshold
 * Layer 2 — Biometric       : OS-level result sent by the app
 * Layer 3 — Device Binding  : fingerprint matches registered primary device
 *
 * On success → writes AttendanceRecord + pushes LiveSessionPublisher event.
 * On failure → writes CheckinAttempt + raises SecurityFlag if threshold exceeded.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final SessionRepository              sessionRepository;
    private final AttendanceRecordRepository     attendanceRepo;
    private final CheckinAttemptRepository       attemptRepo;
    private final DeviceRegistrationRepository   deviceRepo;
    private final SecurityFlagRepository         flagRepo;
    private final UserRepository                 userRepository;
    private final AuditLogRepository             auditLogRepository;
    private final BleCheckinValidator            bleValidator;
    private final LiveSessionPublisher           livePublisher;

    @Value("${app.attendance.late-grace-minutes}")
    private int lateGraceMinutes;

    // ── Main check-in pipeline ────────────────────────────────────────────────

    @Transactional
    public CheckinResponse processCheckin(Integer studentId, CheckinRequest req) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        // Locate active session from BLE token
        Session session = sessionRepository
                .findValidActiveSession(req.getBleToken())
                .orElse(null);

        if (session == null) {
            persistFailedAttempt(student, null, req,
                    CheckinAttempt.CheckinOutcome.FAILED_BLE, "Invalid or expired BLE token");
            raiseFlag(student, null, null,
                    SecurityFlag.FlagType.REPLAY_TOKEN, SecurityFlag.FlagSeverity.HIGH,
                    "Stale or invalid BLE token presented");
            return CheckinResponse.failed("Invalid session token. Ensure you are inside the room.");
        }

        // Layer 1: BLE proximity
        BleCheckinValidator.ValidationResult bleResult = bleValidator.validate(
                session, req.getBleToken(), req.getRssiDbm(),
                req.getRssiSamples(), req.getTxPowerDbm(), student);

        if (!bleResult.passed()) {
            persistFailedAttempt(student, session, req,
                    CheckinAttempt.CheckinOutcome.FAILED_BLE, bleResult.detail());
            SecurityFlag.FlagType ft =
                    bleResult.failReason() == BleCheckinValidator.FailReason.RSSI_TOO_LOW
                            ? SecurityFlag.FlagType.OUT_OF_RANGE
                            : SecurityFlag.FlagType.REPLAY_TOKEN;
            raiseFlag(student, session, null, ft, SecurityFlag.FlagSeverity.MEDIUM,
                    bleResult.detail());
            return CheckinResponse.failed(bleResult.detail());
        }

        // Layer 2: Biometric
        if (!req.isBiometricPassed()) {
            persistFailedAttempt(student, session, req,
                    CheckinAttempt.CheckinOutcome.FAILED_BIOMETRIC, "Biometric prompt failed");
            checkAndRaiseBiometricFlag(student, session);
            return CheckinResponse.failed("Biometric verification failed. Please try again.");
        }

        // Layer 3: Device binding
        DeviceRegistration registeredDevice = deviceRepo
                .findByDeviceFingerprintAndIsRevokedFalse(req.getDeviceFingerprint())
                .orElse(null);

        if (registeredDevice == null
                || !registeredDevice.getUser().getUserId().equals(studentId)) {
            persistFailedAttempt(student, session, req,
                    CheckinAttempt.CheckinOutcome.FAILED_DEVICE,
                    "Unregistered or mismatched device");
            SecurityFlag.FlagType ft = registeredDevice != null
                    ? SecurityFlag.FlagType.DEVICE_MISMATCH
                    : SecurityFlag.FlagType.MULTIPLE_DEVICE_ATTEMPT;
            SecurityFlag flag = raiseFlag(student, session, registeredDevice, ft,
                    SecurityFlag.FlagSeverity.HIGH,
                    "Check-in from unregistered device: " + req.getDeviceFingerprint());
            // Push alert to admin dashboard
            livePublisher.publishNewFlag(flag.getFlagId(), flag.getFlagType().name(),
                    flag.getSeverity().name(), student.getFullName(),
                    session.getCourse().getCourseCode());
            return CheckinResponse.failed("Device not recognised. Use your registered device.");
        }

        // Duplicate check
        if (attendanceRepo.findBySessionSessionIdAndStudentUserId(
                session.getSessionId(), studentId).isPresent()) {
            return CheckinResponse.failed("Already checked in for this session.");
        }

        // All layers passed — write attendance record
        AttendanceRecord.AttendanceStatus status = determineStatus(session);

        AttendanceRecord record = AttendanceRecord.builder()
                .session(session).student(student).device(registeredDevice)
                .bleVerified(true).biometricVerified(true).deviceVerified(true)
                .rssiValue(req.getRssiDbm())
                .bleTokenUsed(req.getBleToken())
                .status(status).isManualOverride(false)
                .build();
        attendanceRepo.save(record);

        registeredDevice.setLastSeenAt(OffsetDateTime.now());
        deviceRepo.save(registeredDevice);

        // Push real-time check-in event to live activity stream
        livePublisher.publishCheckin(record);

        log.info("CHECK-IN OK student={} session={} status={} rssi={}",
                studentId, session.getSessionId(), status, req.getRssiDbm());

        return CheckinResponse.success(status.name(),
                session.getCourse().getCourseName(),
                session.getVenue() != null ? session.getVenue().getVenueName() : "Unknown");
    }

    // ── Manual override ───────────────────────────────────────────────────────

    @Transactional
    public AttendanceRecord manualOverride(Integer sessionId, Integer studentId,
                                           Integer actorId, String reason,
                                           AttendanceRecord.AttendanceStatus newStatus) {

        Session  session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        User     student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        User     actor   = userRepository.findById(actorId)
                .orElseThrow(() -> new IllegalArgumentException("Actor not found"));

        AttendanceRecord record = attendanceRepo
                .findBySessionSessionIdAndStudentUserId(sessionId, studentId)
                .orElseGet(() -> AttendanceRecord.builder()
                        .session(session).student(student)
                        .bleVerified(false).biometricVerified(false).deviceVerified(false)
                        .build());

        AttendanceRecord.AttendanceStatus old = record.getStatus();
        record.setStatus(newStatus);
        record.setIsManualOverride(true);
        record.setOverriddenBy(actor);
        record.setOverrideReason(reason);
        record.setOverriddenAt(OffsetDateTime.now());
        AttendanceRecord saved = attendanceRepo.save(record);

        auditLogRepository.save(AuditLog.builder()
                .actor(actor).action("MANUAL_ATTENDANCE_OVERRIDE")
                .entityType("attendance_record").entityId(saved.getRecordId().intValue())
                .oldValue(Map.of("status", old != null ? old.name() : "none"))
                .newValue(Map.of("status", newStatus.name(), "reason", reason))
                .build());

        // Push the override to the live stream too
        livePublisher.publishCheckin(saved);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecord> getSessionAttendance(Integer sessionId) {
        return attendanceRepo.findBySessionWithDetails(sessionId);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private AttendanceRecord.AttendanceStatus determineStatus(Session session) {
        long elapsed = java.time.Duration.between(
                session.getStartedAt(), OffsetDateTime.now()).toMinutes();
        return elapsed > lateGraceMinutes
                ? AttendanceRecord.AttendanceStatus.LATE
                : AttendanceRecord.AttendanceStatus.PRESENT;
    }

    private void persistFailedAttempt(User student, Session session,
                                       CheckinRequest req,
                                       CheckinAttempt.CheckinOutcome outcome,
                                       String reason) {
        attemptRepo.save(CheckinAttempt.builder()
                .session(session).student(student)
                .deviceFingerprint(req.getDeviceFingerprint())
                .bleVerified(false).biometricVerified(req.isBiometricPassed())
                .deviceVerified(false).rssiValue(req.getRssiDbm())
                .bleTokenPresented(req.getBleToken())
                .outcome(outcome).failureReason(reason).build());
    }

    private SecurityFlag raiseFlag(User student, Session session,
                                    DeviceRegistration device,
                                    SecurityFlag.FlagType type,
                                    SecurityFlag.FlagSeverity severity,
                                    String description) {
        return flagRepo.save(SecurityFlag.builder()
                .user(student).session(session).device(device)
                .flagType(type).severity(severity)
                .description(description).resolved(false).build());
    }

    private void checkAndRaiseBiometricFlag(User student, Session session) {
        long recent = attemptRepo.countByStudentUserIdAndSessionSessionIdAndAttemptedAtAfter(
                student.getUserId(), session.getSessionId(),
                OffsetDateTime.now().minusMinutes(5));
        if (recent >= 3) {
            raiseFlag(student, session, null,
                    SecurityFlag.FlagType.BIOMETRIC_FAILURE, SecurityFlag.FlagSeverity.MEDIUM,
                    recent + " biometric failures in the last 5 minutes");
        }
    }
}
