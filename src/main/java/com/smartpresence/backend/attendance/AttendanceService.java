package com.smartpresence.backend.attendance;

import com.smartpresence.backend.attendance.dto.*;
import com.smartpresence.backend.ble.BleCheckinEvent;
import com.smartpresence.backend.ble.BleCheckinRepository;
import com.smartpresence.backend.ble.BleTokenValidator;
import com.smartpresence.backend.ble.CheckinResult;
import com.smartpresence.backend.config.AppProperties;
import com.smartpresence.backend.device.DeviceRepository;
import com.smartpresence.backend.enrollment.EnrollmentRepository;
import com.smartpresence.backend.exception.ResourceNotFoundException;
import com.smartpresence.backend.session.AttendanceSession;
import com.smartpresence.backend.session.SessionRepository;
import com.smartpresence.backend.session.SessionStatus;
import com.smartpresence.backend.user.User;
import com.smartpresence.backend.validation.ValidationContext;
import com.smartpresence.backend.validation.ValidationException;
import com.smartpresence.backend.validation.ValidationPipeline;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final ChallengeRepository challengeRepository;
    private final AttendanceRepository attendanceRepository;
    private final TokenUsageRepository tokenUsageRepository;
    private final BleCheckinRepository bleCheckinRepository;
    private final SessionRepository sessionRepository;
    private final DeviceRepository deviceRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceTokenService attendanceTokenService;
    private final BleTokenValidator bleTokenValidator;
    private final ValidationPipeline validationPipeline;
    private final AppProperties appProperties;

    // ────────────────────────────────────────────────────────────────────────
    // Step 3: Request a challenge
    // ────────────────────────────────────────────────────────────────────────

    @Transactional
    public ChallengeResponse requestChallenge(ChallengeRequest request, User student) {
        // Resolve device
        var device = deviceRepository.findByDeviceIdAndActiveTrue(request.deviceId())
            .orElseThrow(() -> new IllegalArgumentException("Device not found or inactive: " + request.deviceId()));
        if (!device.getUser().getId().equals(student.getId())) {
            throw new IllegalArgumentException("Device does not belong to this account");
        }

        // Resolve session
        AttendanceSession session = sessionRepository.findById(request.sessionId())
            .orElseThrow(() -> new ResourceNotFoundException("Session", request.sessionId()));
        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new IllegalArgumentException("Attendance session is not active");
        }

        // Validate enrollment
        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), session.getCourse().getId())) {
            throw new IllegalArgumentException("You are not enrolled in this course");
        }

        // Create challenge (TTL = 60 seconds)
        int ttl = appProperties.getToken().getTtlSeconds();
        AttendanceChallenge challenge = AttendanceChallenge.builder()
            .student(student)
            .device(device)
            .session(session)
            .challenge(UUID.randomUUID().toString())
            .expiresAt(OffsetDateTime.now().plusSeconds(ttl))
            .used(false)
            .build();

        challengeRepository.save(challenge);
        return new ChallengeResponse(challenge.getChallenge(), ttl);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Step 4: Exchange challenge for attendance token
    // ────────────────────────────────────────────────────────────────────────

    @Transactional
    public TokenResponse requestToken(TokenRequest request, User student) {
        AttendanceChallenge challenge = challengeRepository.findByChallenge(request.challenge())
            .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));

        // Validate ownership
        if (!challenge.getStudent().getId().equals(student.getId())) {
            throw new IllegalArgumentException("Challenge does not belong to this account");
        }
        if (challenge.isUsed()) {
            throw new IllegalArgumentException("Challenge has already been used");
        }
        if (OffsetDateTime.now().isAfter(challenge.getExpiresAt())) {
            throw new IllegalArgumentException("Challenge has expired");
        }

        // Mark challenge as used
        challenge.setUsed(true);
        challengeRepository.save(challenge);

        // Issue attendance token
        // JWT payload: studentId, deviceId (string), sessionId, challengeId
        String token = attendanceTokenService.generateToken(
            student.getId(),
            challenge.getDevice().getDeviceId(),
            challenge.getSession().getId(),
            challenge.getId()
        );

        int ttl = appProperties.getToken().getTtlSeconds();
        return new TokenResponse(token, ttl);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Step 5: Check-in (live BLE)
    // ────────────────────────────────────────────────────────────────────────

    @Transactional
    public CheckInResponse checkIn(CheckInRequest request, User student) {
        return processCheckIn(request, student, false);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Offline sync (batch check-in)
    // ────────────────────────────────────────────────────────────────────────

    @Transactional
    public OfflineSyncResponse offlineSync(OfflineSyncRequest request, User student) {
        List<OfflineSyncResponse.SyncResult> results = new ArrayList<>();
        int successCount = 0;
        int failureCount = 0;

        for (CheckInRequest record : request.records()) {
            try {
                processCheckIn(record, student, true);
                results.add(new OfflineSyncResponse.SyncResult(record.sessionId(), true, null));
                successCount++;
            } catch (ValidationException e) {
                results.add(new OfflineSyncResponse.SyncResult(record.sessionId(), false, e.getResult().name() + ": " + e.getMessage()));
                failureCount++;
            } catch (Exception e) {
                results.add(new OfflineSyncResponse.SyncResult(record.sessionId(), false, "ERROR: " + e.getMessage()));
                failureCount++;
            }
        }

        return new OfflineSyncResponse(request.records().size(), successCount, failureCount, results);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Internal: shared check-in processing
    // ────────────────────────────────────────────────────────────────────────

    private CheckInResponse processCheckIn(CheckInRequest request, User student, boolean offlineSync) {
        ValidationContext ctx = new ValidationContext(
            request.sessionId(),
            request.timestamp(),
            request.token(),
            request.rssi(),
            request.deviceId(),
            request.attendanceToken(),
            student,
            offlineSync
        );

        try {
            validationPipeline.validate(ctx);
        } catch (ValidationException e) {
            // Log the failed attempt even if we don't have a complete context
            logAuditEvent(ctx, e.getResult(), e.getMessage(), false, null);
            throw e;
        }

        log.info("BLE check-in validated: sessionId={} courseId={} timestamp={} token={} secretFingerprint={}",
            ctx.getSessionId(), ctx.getSession().getCourse().getId(), ctx.getTimestamp(), ctx.getBleToken(),
            String.format("%08X", ctx.getSession().getSessionSecret().hashCode()));

        // Mark attendance token JTI as used (replay prevention)
        tokenUsageRepository.save(AttendanceTokenUsage.builder()
            .tokenJti(ctx.getTokenJti())
            .student(student)
            .session(ctx.getSession())
            .build());

        // Create the attendance record
        AttendanceRecord record = AttendanceRecord.builder()
            .student(student)
            .session(ctx.getSession())
            .verificationMethod(offlineSync ? VerificationMethod.OFFLINE_SYNC : VerificationMethod.BLE_BIOMETRIC)
            .status(AttendanceStatus.PRESENT)
            .build();
        record = attendanceRepository.save(record);

        // Log successful audit event
        logAuditEvent(ctx, CheckinResult.SUCCESS, null, true, record);

        // Update device last_seen
        ctx.getDevice().setLastSeenAt(OffsetDateTime.now());
        deviceRepository.save(ctx.getDevice());

        return new CheckInResponse(true, record.getId(), "Attendance recorded successfully");
    }

    private void logAuditEvent(ValidationContext ctx, CheckinResult result,
                                String failureReason, boolean biometricVerified,
                                AttendanceRecord attendanceRecord) {
        try {
            // Compute distance estimate if we have device and session
            BigDecimal distanceEstimate = null;
            if (ctx.getRssi() != null) {
                double dist = bleTokenValidator.estimateDistance(ctx.getRssi());
                distanceEstimate = BigDecimal.valueOf(dist).setScale(2, RoundingMode.HALF_UP);
            }

            BleCheckinEvent.BleCheckinEventBuilder builder = BleCheckinEvent.builder()
                .student(ctx.getStudent())
                .token(ctx.getBleToken() != null ? ctx.getBleToken() : "")
                .rssi(ctx.getRssi() != null ? ctx.getRssi() : 0)
                .distanceEstimate(distanceEstimate)
                .result(result)
                .failureReason(failureReason)
                .biometricVerified(biometricVerified)
                .attendanceRecord(attendanceRecord);

            if (ctx.getDevice() != null) {
                builder.device(ctx.getDevice());
            }
            if (ctx.getSession() != null) {
                builder.session(ctx.getSession());
            }

            // Can only save when we have device and session (FKs are NOT NULL in DB)
            if (ctx.getDevice() != null && ctx.getSession() != null) {
                bleCheckinRepository.save(builder.build());
            }
        } catch (Exception e) {
            log.warn("Failed to persist audit event for student {}: {}", ctx.getStudent().getId(), e.getMessage());
        }
    }
}
