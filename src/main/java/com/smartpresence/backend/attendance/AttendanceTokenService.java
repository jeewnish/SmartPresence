package com.smartpresence.backend.attendance;

import com.smartpresence.backend.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * Issues and validates short-lived attendance JWTs.
 *
 * These are separate from Clerk JWTs — signed with ATTENDANCE_TOKEN_SECRET.
 * Payload contains: studentId, deviceId (string), sessionId, challengeId, jti (for replay prevention).
 * TTL: 60 seconds by default.
 */
@Service
@RequiredArgsConstructor
public class AttendanceTokenService {

    private final AppProperties appProperties;

    public String generateToken(Long studentId, String deviceId, Long sessionId, Long challengeId) {
        String jti = UUID.randomUUID().toString();
        Date now = new Date();
        int ttlMs = appProperties.getToken().getTtlSeconds() * 1000;
        Date expiry = new Date(now.getTime() + ttlMs);

        return Jwts.builder()
            .id(jti)
            .claim("studentId", studentId)
            .claim("deviceId", deviceId)
            .claim("sessionId", sessionId)
            .claim("challengeId", challengeId)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(getSigningKey())
            .compact();
    }

    /**
     * Parses and validates the token. Throws JwtException on any error (expired, tampered, etc.).
     */
    public Claims validateToken(String token) throws JwtException {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private SecretKey getSigningKey() {
        String secret = appProperties.getToken().getSecret();
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
