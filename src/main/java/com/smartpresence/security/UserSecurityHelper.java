package com.smartpresence.security;

import com.smartpresence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Helper bean used in {@code @PreAuthorize} expressions.
 * Allows a user to access their own profile without needing ADMIN role.
 *
 * Usage:
 *   {@code @PreAuthorize("hasRole('ADMIN') or @userSecurityHelper.isSelf(authentication, #userId)")}
 */
@Component("userSecurityHelper")
@RequiredArgsConstructor
public class UserSecurityHelper {

    private final UserRepository userRepository;

    /**
     * Returns true if the authenticated user's email matches the userId being accessed.
     */
    public boolean isSelf(Authentication authentication, Integer userId) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            return false;
        }

        String email = jwt.getClaimAsString("preferred_username");
        if (email == null) email = jwt.getClaimAsString("email");

        String finalEmail = email;
        return userRepository.findById(userId)
                .map(u -> u.getEmail().equalsIgnoreCase(finalEmail))
                .orElse(false);
    }

    /**
     * Extract the authenticated user's email from the JWT.
     */
    public static String emailFromJwt(Jwt jwt) {
        String email = jwt.getClaimAsString("preferred_username");
        return email != null ? email : jwt.getClaimAsString("email");
    }
}
