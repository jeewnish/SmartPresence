package com.smartpresence.service;

import com.smartpresence.entity.BiometricProfile;
import com.smartpresence.entity.DeviceRegistration;
import com.smartpresence.entity.User;
import com.smartpresence.repository.BiometricProfileRepository;
import com.smartpresence.repository.DeviceRegistrationRepository;
import com.smartpresence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

/**
 * Manages device bindings and biometric setup state.
 * Extracted from the old AuthService — no password logic needed here.
 */
@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRegistrationRepository deviceRepo;
    private final BiometricProfileRepository   biometricRepo;
    private final UserRepository               userRepository;

    // ── Device registration (one-time binding) ────────────────────────────────

    @Transactional
    public DeviceRegistration registerDevice(Integer userId,
                                              String deviceFingerprint,
                                              String model,
                                              DeviceRegistration.OsType osType,
                                              String osVersion,
                                              String appVersion) {
        if (deviceRepo.existsByUserUserIdAndIsPrimaryTrue(userId)) {
            throw new IllegalStateException(
                    "A device is already registered to this account.");
        }
        if (deviceRepo.existsByDeviceFingerprint(deviceFingerprint)) {
            throw new IllegalStateException(
                    "This device fingerprint is already bound to another account.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        return deviceRepo.save(DeviceRegistration.builder()
                .user(user)
                .deviceFingerprint(deviceFingerprint)
                .deviceModel(model)
                .osType(osType)
                .osVersion(osVersion)
                .appVersion(appVersion)
                .isPrimary(true)
                .isRevoked(false)
                .build());
    }

    @Transactional
    public void revokeDevice(Integer deviceId, String reason, Integer actorId) {
        DeviceRegistration device = deviceRepo.findById(deviceId)
                .orElseThrow(() -> new IllegalArgumentException("Device not found: " + deviceId));
        device.setIsRevoked(true);
        device.setRevokeReason(reason);
        deviceRepo.save(device);
    }

    // ── Biometric setup ───────────────────────────────────────────────────────

    @Transactional
    public BiometricProfile updateBiometricStatus(Integer userId,
                                                   boolean fingerprintEnrolled,
                                                   boolean faceidEnrolled,
                                                   BiometricProfile.BiometricMethod method) {
        BiometricProfile profile = biometricRepo.findByUserUserId(userId)
                .orElseGet(() -> {
                    User u = userRepository.findById(userId).orElseThrow();
                    return BiometricProfile.builder()
                            .user(u)
                            .preferredMethod(BiometricProfile.BiometricMethod.NONE)
                            .build();
                });

        profile.setFingerprintEnrolled(fingerprintEnrolled);
        profile.setFaceidEnrolled(faceidEnrolled);
        profile.setPreferredMethod(method);
        if (profile.getEnrolledAt() == null) {
            profile.setEnrolledAt(OffsetDateTime.now());
        }
        return biometricRepo.save(profile);
    }
}
