package com.smartpresence.backend.security;

import com.smartpresence.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;

/**
 * Converts a validated Clerk JWT into a Spring Security authentication token.
 *
 * After the OAuth2 Resource Server validates the JWT signature against Clerk's JWKS,
 * this converter:
 *   1. Extracts the Clerk user ID from the "sub" claim.
 *   2. Looks up the user in the DB to get their assigned role.
 *   3. Sets the role as a Spring GrantedAuthority so @PreAuthorize works correctly.
 *
 * If the user is not yet in the DB (e.g., before /users/onboard), the authorities list
 * will be empty — the JWT is still valid, but role-protected endpoints will be denied.
 */
@Component
@RequiredArgsConstructor
public class ClerkJwtConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UserRepository userRepository;

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String clerkUserId = jwt.getSubject();

        Collection<GrantedAuthority> authorities;
        try {
            authorities = userRepository.findByClerkUserId(clerkUserId)
                .map(user -> (GrantedAuthority) new SimpleGrantedAuthority(user.getRole().name()))
                .map(List::of)
                .orElse(List.of());
        } catch (Exception e) {
            authorities = List.of();
        }

        // Principal name = clerk_user_id; enables @AuthenticationPrincipal Jwt jwt in controllers
        return new JwtAuthenticationToken(jwt, authorities, clerkUserId);
    }
}
