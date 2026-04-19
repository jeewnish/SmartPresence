package com.smartpresence.service;

import com.smartpresence.dto.request.RegisterRequest;
import com.smartpresence.entity.*;
import com.smartpresence.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Manages users in both Keycloak and the local database.
 *
 * Flow for new user registration:
 *  1. Admin calls POST /users/register (or bulk CSV import).
 *  2. This service creates the user in Keycloak via the Admin REST API.
 *  3. Keycloak assigns the correct realm role (SMARTPRESENCE_STUDENT etc.).
 *  4. A local User row is created in the SmartPresence DB (without password —
 *     Keycloak owns authentication, we only store profile data).
 *  5. Keycloak sends a welcome email with a "Set Password" link.
 *
 * Flow for student login (mobile app):
 *  1. Student App calls Keycloak's token endpoint directly (not this backend).
 *  2. Keycloak issues an access token.
 *  3. Student App sends every subsequent request with Bearer <token>.
 *  4. This backend validates the token against Keycloak's JWKS endpoint.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KeycloakAdminService {

    private final UserRepository             userRepository;
    private final BiometricProfileRepository biometricRepo;

    @Value("${KEYCLOAK_ADMIN_URL:http://localhost:8180}")
    private String keycloakUrl;

    @Value("${KEYCLOAK_REALM:smartpresence}")
    private String realm;

    @Value("${KEYCLOAK_ADMIN_CLIENT_ID:smartpresence-admin-cli}")
    private String adminClientId;

    @Value("${KEYCLOAK_ADMIN_CLIENT_SECRET:}")
    private String adminClientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    // ── Create user in Keycloak + local DB ────────────────────────────────────

    @Transactional
    public User registerUser(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + req.getEmail());
        }

        // 1. Get an admin access token from Keycloak
        String adminToken = getAdminToken();

        // 2. Create user in Keycloak realm
        String keycloakUserId = createKeycloakUser(req, adminToken);

        // 3. Assign the correct realm role
        String roleName = "SMARTPRESENCE_" + req.getRole().name();
        assignRealmRole(keycloakUserId, roleName, adminToken);

        // 4. Trigger "set password" email (Keycloak sends it automatically)
        sendRequiredActionsEmail(keycloakUserId, adminToken);

        // 5. Persist local profile (no password — Keycloak owns auth)
        User user = User.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .passwordHash("OAUTH2_MANAGED")  // sentinel — never used for auth
                .role(req.getRole())
                .indexNumber(req.getIndexNumber())
                .enrollmentYear(req.getEnrollmentYear())
                .isActive(true)
                .build();
        userRepository.save(user);

        // 6. Create empty biometric profile for students and lecturers
        if (user.getRole() != UserRole.ADMIN) {
            biometricRepo.save(BiometricProfile.builder()
                    .user(user)
                    .fingerprintEnrolled(false)
                    .faceidEnrolled(false)
                    .preferredMethod(BiometricProfile.BiometricMethod.NONE)
                    .build());
        }

        log.info("User registered — email={} role={} keycloakId={}",
                user.getEmail(), user.getRole(), keycloakUserId);

        return user;
    }

    /** Deactivate a user in both Keycloak and the local DB. */
    @Transactional
    public void suspendUser(Integer userId, Integer actorId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Disable in Keycloak
        String adminToken = getAdminToken();
        disableKeycloakUser(user.getEmail(), adminToken);

        // Disable locally
        user.setIsActive(false);
        userRepository.save(user);

        log.info("User suspended — email={} by actorId={}", user.getEmail(), actorId);
    }

    // ── Keycloak Admin REST API helpers ───────────────────────────────────────

    /** Obtain a short-lived admin access token using client_credentials. */
    private String getAdminToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String body = "grant_type=client_credentials"
                + "&client_id=" + adminClientId
                + "&client_secret=" + adminClientSecret;

        ResponseEntity<Map> response = restTemplate.postForEntity(
                keycloakUrl + "/realms/" + realm + "/protocol/openid-connect/token",
                new HttpEntity<>(body, headers),
                Map.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new IllegalStateException("Failed to obtain Keycloak admin token");
        }

        return (String) response.getBody().get("access_token");
    }

    /** POST to Keycloak Admin API to create the user. Returns the new Keycloak user ID. */
    private String createKeycloakUser(RegisterRequest req, String adminToken) {
        HttpHeaders headers = bearerHeaders(adminToken);

        Map<String, Object> payload = Map.of(
                "username",   req.getEmail(),
                "email",      req.getEmail(),
                "firstName",  req.getFirstName(),
                "lastName",   req.getLastName(),
                "enabled",    true,
                "requiredActions", List.of("UPDATE_PASSWORD"),
                "attributes", Map.of(
                        "indexNumber", req.getIndexNumber() != null
                                ? List.of(req.getIndexNumber()) : List.of()
                )
        );

        ResponseEntity<Void> response = restTemplate.postForEntity(
                keycloakUrl + "/admin/realms/" + realm + "/users",
                new HttpEntity<>(payload, headers),
                Void.class);

        if (response.getStatusCode() != HttpStatus.CREATED) {
            throw new IllegalStateException(
                    "Keycloak user creation failed: " + response.getStatusCode());
        }

        // Keycloak returns the new user ID in the Location header
        String location = response.getHeaders().getFirst("Location");
        if (location == null) throw new IllegalStateException("No Location header from Keycloak");
        return location.substring(location.lastIndexOf('/') + 1);
    }

    /** Assign a realm role to the newly created Keycloak user. */
    private void assignRealmRole(String keycloakUserId, String roleName, String adminToken) {
        HttpHeaders headers = bearerHeaders(adminToken);

        // First get the role representation from Keycloak
        ResponseEntity<Map> roleResp = restTemplate.exchange(
                keycloakUrl + "/admin/realms/" + realm + "/roles/" + roleName,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class);

        if (!roleResp.getStatusCode().is2xxSuccessful() || roleResp.getBody() == null) {
            log.warn("Role {} not found in Keycloak realm — skipping assignment", roleName);
            return;
        }

        // POST the role to the user's role mappings
        restTemplate.postForEntity(
                keycloakUrl + "/admin/realms/" + realm
                        + "/users/" + keycloakUserId + "/role-mappings/realm",
                new HttpEntity<>(List.of(roleResp.getBody()), headers),
                Void.class);
    }

    /** Trigger Keycloak to send the "set password" email. */
    private void sendRequiredActionsEmail(String keycloakUserId, String adminToken) {
        HttpHeaders headers = bearerHeaders(adminToken);
        try {
            restTemplate.put(
                    keycloakUrl + "/admin/realms/" + realm
                            + "/users/" + keycloakUserId
                            + "/execute-actions-email",
                    new HttpEntity<>(List.of("UPDATE_PASSWORD"), headers));
        } catch (Exception e) {
            // Email sending is best-effort — don't fail registration
            log.warn("Could not send required-actions email for user {}: {}", keycloakUserId, e.getMessage());
        }
    }

    /** Disable a user in Keycloak by email lookup. */
    private void disableKeycloakUser(String email, String adminToken) {
        HttpHeaders headers = bearerHeaders(adminToken);
        try {
            ResponseEntity<List> users = restTemplate.exchange(
                    keycloakUrl + "/admin/realms/" + realm + "/users?email=" + email,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    List.class);

            if (users.getBody() != null && !users.getBody().isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> user = (Map<String, Object>) users.getBody().get(0);
                String userId = (String) user.get("id");
                user.put("enabled", false);

                restTemplate.exchange(
                        keycloakUrl + "/admin/realms/" + realm + "/users/" + userId,
                        HttpMethod.PUT,
                        new HttpEntity<>(user, headers),
                        Void.class);
            }
        } catch (Exception e) {
            log.warn("Could not disable Keycloak user {}: {}", email, e.getMessage());
        }
    }

    private HttpHeaders bearerHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);
        return headers;
    }
}
