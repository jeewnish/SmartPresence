package com.smartpresence.ble;

import com.smartpresence.entity.Session;
import com.smartpresence.repository.SessionRepository;
import com.smartpresence.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Arrays;
import java.util.Optional;

/**
 * Owns the full lifecycle of BLE session tokens.
 *
 * Token anatomy:
 *   <4-byte sessionId><4-byte timestamp><4-byte HMAC-SHA256 tag>
 *   encoded as Base64URL without padding.
 *
 * This keeps the BLE advertisement payload compact enough to fit well
 * inside the 31-byte advertising limit while still carrying a tamper-
 * evident session identifier and issue timestamp.
 *
 * Security properties:
 *  - 32-bit truncated HMAC over sessionId + timestamp → tamper detection
 *  - Hard expiry stored in DB → replay attacks are rejected after expiry
 *  - One valid token per session at a time → rolling rotation invalidates old tokens
 *  - Token length fixed at 16 chars after Base64URL encoding
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BleTokenService {

    private final SessionRepository      sessionRepository;
    private final SystemSettingService   settingService;

    @Value("${app.ble.token-signing-secret}")
    private String tokenSigningSecret;

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
        Optional<ParsedToken> parsed = parse(rawToken);
        if (parsed.isEmpty()) {
            log.warn("BLE token format invalid or tampered");
            return Optional.empty();
        }

        ParsedToken token = parsed.get();

        if (OffsetDateTime.now().toEpochSecond() < token.issuedAtEpochSecond()) {
            log.warn("BLE token timestamp is in the future");
            return Optional.empty();
        }

        return sessionRepository.findById(token.sessionId())
                .filter(s -> s.getStatus() == Session.SessionStatus.ACTIVE)
                .filter(s -> s.getBleToken().equals(rawToken))
                .filter(s -> OffsetDateTime.now().isBefore(s.getBleTokenExpiresAt()));
    }

    // ── Token info ───────────────────────────────────────────────────────────

    /** Extract session ID from a raw token without a DB hit. */
    public Optional<Integer> extractSessionId(String rawToken) {
        return parse(rawToken).map(ParsedToken::sessionId);
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
        long issuedAtEpochSecond = OffsetDateTime.now(ZoneOffset.UTC).toEpochSecond();
        String token = encodeToken(sessionId, issuedAtEpochSecond);
        OffsetDateTime expiresAt = OffsetDateTime.now().plusSeconds(lifetimeSecs);

        return new BleTokenPair(token, expiresAt);
    }

    private String encodeToken(int sessionId, long issuedAtEpochSecond) {
        ByteBuffer payload = ByteBuffer.allocate(8).order(ByteOrder.BIG_ENDIAN)
                .putInt(sessionId)
                .putInt(Math.toIntExact(issuedAtEpochSecond));

        byte[] mac = sign(payload.array());

        ByteBuffer tokenBytes = ByteBuffer.allocate(12).order(ByteOrder.BIG_ENDIAN)
                .putInt(sessionId)
                .putInt(Math.toIntExact(issuedAtEpochSecond))
                .put(mac, 0, 4);

        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes.array());
    }

    private Optional<ParsedToken> parse(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return Optional.empty();
        }

        byte[] decoded;
        try {
            decoded = Base64.getUrlDecoder().decode(rawToken);
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }

        if (decoded.length != 12) {
            return Optional.empty();
        }

        ByteBuffer buffer = ByteBuffer.wrap(decoded).order(ByteOrder.BIG_ENDIAN);
        int sessionId = buffer.getInt();
        int issuedAtEpochSecond = buffer.getInt();
        byte[] mac = new byte[4];
        buffer.get(mac);

        byte[] expectedMac = Arrays.copyOf(
                sign(ByteBuffer.allocate(8).order(ByteOrder.BIG_ENDIAN)
                        .putInt(sessionId)
                        .putInt(issuedAtEpochSecond)
                        .array()),
                4);

        if (!MessageDigest.isEqual(mac, expectedMac)) {
            return Optional.empty();
        }

        return Optional.of(new ParsedToken(sessionId, Integer.toUnsignedLong(issuedAtEpochSecond)));
    }

    private byte[] sign(byte[] payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(tokenSigningSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return mac.doFinal(payload);
        } catch (NoSuchAlgorithmException | InvalidKeyException ex) {
            throw new IllegalStateException("Unable to sign BLE token", ex);
        }
    }

    // ── Record ───────────────────────────────────────────────────────────────

    public record BleTokenPair(String token, OffsetDateTime expiresAt) {}

    private record ParsedToken(int sessionId, long issuedAtEpochSecond) {}
}
