package com.smartpresence.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Extracts roles from a Keycloak-issued JWT and converts them to
 * Spring Security {@link GrantedAuthority} objects.
 *
 * Keycloak puts realm-level roles in two places inside the JWT:
 *
 *   1. realm_access.roles  — e.g. ["SMARTPRESENCE_ADMIN", "offline_access"]
 *   2. resource_access.<client-id>.roles — client-scoped roles (optional)
 *
 * This converter reads both and prefixes each with "ROLE_" so that
 * Spring Security's {@code hasRole("ADMIN")} checks work correctly.
 *
 * Example JWT claim:
 * {
 *   "realm_access": {
 *     "roles": ["SMARTPRESENCE_STUDENT", "offline_access"]
 *   },
 *   "resource_access": {
 *     "smartpresence-backend": {
 *       "roles": ["view-attendance"]
 *     }
 *   }
 * }
 */
@Component
public class OAuth2RoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private static final String REALM_ACCESS_CLAIM    = "realm_access";
    private static final String RESOURCE_ACCESS_CLAIM = "resource_access";
    private static final String ROLES_CLAIM           = "roles";
    private static final String CLIENT_ID             = "smartpresence-backend";

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        return Stream.concat(
                realmRoles(jwt).stream(),
                clientRoles(jwt).stream()
        ).collect(Collectors.toSet());
    }

    // ── Realm roles: realm_access.roles ──────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Collection<GrantedAuthority> realmRoles(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaimAsMap(REALM_ACCESS_CLAIM);
        if (realmAccess == null || !realmAccess.containsKey(ROLES_CLAIM)) {
            return Collections.emptyList();
        }

        Collection<String> roles = (Collection<String>) realmAccess.get(ROLES_CLAIM);
        return roles.stream()
                .filter(role -> role.startsWith("SMARTPRESENCE_"))
                .map(role -> new SimpleGrantedAuthority(
                        "ROLE_" + role.replace("SMARTPRESENCE_", "")))
                .collect(Collectors.toList());
    }

    // ── Client roles: resource_access.<client>.roles ──────────────────────────

    @SuppressWarnings("unchecked")
    private Collection<GrantedAuthority> clientRoles(Jwt jwt) {
        Map<String, Object> resourceAccess = jwt.getClaimAsMap(RESOURCE_ACCESS_CLAIM);
        if (resourceAccess == null || !resourceAccess.containsKey(CLIENT_ID)) {
            return Collections.emptyList();
        }

        Map<String, Object> clientAccess = (Map<String, Object>) resourceAccess.get(CLIENT_ID);
        if (clientAccess == null || !clientAccess.containsKey(ROLES_CLAIM)) {
            return Collections.emptyList();
        }

        Collection<String> roles = (Collection<String>) clientAccess.get(ROLES_CLAIM);
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                .collect(Collectors.toList());
    }

    /**
     * Extract the primary SmartPresence role (ADMIN / LECTURER / STUDENT) from the token
     * by running the conversion and returning the first recognised SMARTPRESENCE_ role.
     *
     * BUG FIX: The original implementation always returned Optional.empty() — it was a
     * dead stub. Callers needing the role string can now use this reliably.
     */
    public Optional<String> extractPrimaryRole(Jwt jwt) {
        return convert(jwt).stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.replace("ROLE_", ""))
                .filter(r -> r.equals("ADMIN") || r.equals("LECTURER") || r.equals("STUDENT"))
                .findFirst();
    }
}
