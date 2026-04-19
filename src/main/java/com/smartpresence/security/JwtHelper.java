package com.smartpresence.security;

import com.smartpresence.entity.User;
import com.smartpresence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Resolves the local SmartPresence {@link User} entity from a Keycloak
 * {@link Jwt} token. Used by all controllers that need actor identity.
 *
 * Keycloak puts the email in "preferred_username" for username/password logins,
 * and in "email" for other grant types — this helper checks both.
 */
@Component
@RequiredArgsConstructor
public class JwtHelper {

    private final UserRepository userRepository;

    /** Extract email from a Keycloak JWT (checks preferred_username then email). */
    public static String email(Jwt jwt) {
        String email = jwt.getClaimAsString("preferred_username");
        return (email != null) ? email : jwt.getClaimAsString("email");
    }

    /** Resolve the local User entity from a JWT. Throws if not found. */
    public User resolveUser(Jwt jwt) {
        return userRepository.findByEmail(email(jwt))
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user not found in SmartPresence DB: " + email(jwt)));
    }
}
