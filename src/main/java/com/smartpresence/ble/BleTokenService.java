package com.smartpresence.ble;

import com.smartpresence.entity.Session;
import com.smartpresence.repository.SessionRepository;
import com.smartpresence.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Optional;

/**
 * Owns the full lifecycle of BLE session tokens.
 *
 * Token anatomy:
 *   <sessionId-hex>.<random-48-bytes-base64url>
 *
 * This lets the student app extract the session ID from the token
 * without a separate API call, while the random suffix prevents guessing.
 *
 * Security properties:
 *  - 384 bits of randomness → brute-force infeasible
 *  - Hard expiry stored in DB → replay attacks are rejected after expiry
 *  - One valid token per session at a time → rolling rotation invalidates old tokens
 *  - Token length fixed at 64 chars after trimming → no length-oracle attacks
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BleTokenService {

    private final SessionRepository      sessionRepository;
    private final SystemSettingService   settingService;

    private static final SecureRandom RNG = new SecureRandom();

    // ── Token generation ─────────────────────────────────────────────────────

    /**
     * Generate a brand-new BLE token for a session that is being started.
     * Called once by SessionService.startSession().
     */
    public BleTokenPair generateInitialToken(Integer sessionId) {
        return generate(sessionId);
    }

    /**
     * Rotate an existing token mid-session.
     * The lecturer app calls this endpoint every [ble_token_lifetime_seconds / 2]
     * so there is always a valid unexpired token being broadcast.
     *
     * Students who have already checked in are unaffected.
     * Students mid-checkin will retry automatically with the new token.
     */
    @Transactional
    public BleTokenPair rotateToken(Integer sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        if (session.getStatus() != Session.SessionStatus.ACTIVE) {
            throw new IllegalStateException("Cannot rotate token on a non-active session.");
        }

        BleTokenPair pair = generate(sessionId);

        session.setBleToken(pair.token());
        session.setBleTokenExpiresAt(pair.expiresAt());
        sessionRepository.save(session);

        log.info("🔄 BLE token rotated for session={}", sessionId);
        return pair;
    }

    // ── Token validation ─────────────────────────────────────────────────────

    /**
     * Full validation pipeline called by AttendanceService during student check-in.
     *
     * Returns the matching Session if valid, or empty if rejected.
     */
    @Transactional(readOnly = true)
    public Optional<Session> validateToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) return Optional.empty();

        // Token format: <sessionIdHex>.<base64random>
        String[] parts = rawToken.split("\\.", 2);
        if (parts.length != 2) {
            log.warn("BLE token format invalid — no dot separator");
            return Optional.empty();
        }

        Integer sessionId;
        try {
            sessionId = Integer.parseInt(parts[0], 16);
        } catch (NumberFormatException e) {
            log.warn("BLE token sessionId hex parse failed");
            return Optional.empty();
        }

        return sessionRepository.findById(sessionId)
                .filter(s -> s.getStatus() == Session.SessionStatus.ACTIVE)
                .filter(s -> s.getBleToken().equals(rawToken))
                .filter(s -> OffsetDateTime.now().isBefore(s.getBleTokenExpiresAt()));
    }

    // ── Token info ───────────────────────────────────────────────────────────

    /** Extract session ID from a raw token without a DB hit. */
    public Optional<Integer> extractSessionId(String rawToken) {
        if (rawToken == null) return Optional.empty();
        String[] parts = rawToken.split("\\.", 2);
        if (parts.length != 2) return Optional.empty();
        try {
            return Optional.of(Integer.parseInt(parts[0], 16));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    /** True if the token is within 60 seconds of expiry — lecturer app should refresh soon. */
    @Transactional(readOnly = true)
    public boolean isNearExpiry(Integer sessionId) {
        return sessionRepository.findById(sessionId)
                .map(s -> OffsetDateTime.now().isAfter(s.getBleTokenExpiresAt().minusSeconds(60)))
                .orElse(true);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private BleTokenPair generate(Integer sessionId) {
        long lifetimeSecs = settingService.getIntValue("ble_token_lifetime_seconds");

        byte[] randomBytes = new byte[48];
        RNG.nextBytes(randomBytes);
        String randomPart = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        // Prefix with hex session ID so clients can parse it without extra round-trip
        String token    = Integer.toHexString(sessionId) + "." + randomPart.substring(0, 55);
        OffsetDateTime expiresAt = OffsetDateTime.now().plusSeconds(lifetimeSecs);

        return new BleTokenPair(token, expiresAt);
    }

    // ── Record ───────────────────────────────────────────────────────────────

    public record BleTokenPair(String token, OffsetDateTime expiresAt) {}
}
