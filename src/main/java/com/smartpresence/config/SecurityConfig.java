package com.smartpresence.config;

import com.smartpresence.security.OAuth2RoleConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration using OAuth2 Resource Server.
 *
 * How it works:
 *  1. The mobile apps (Student App, Lecturer App) obtain tokens from Keycloak
 *     using Resource Owner Password Credentials or Authorization Code + PKCE.
 *  2. Every API request carries a Bearer token in the Authorization header.
 *  3. Spring validates the token signature against Keycloak's JWKS endpoint
 *     automatically — no secret key is stored in this application.
 *  4. {@link OAuth2RoleConverter} extracts realm roles and maps them to
 *     Spring Security authorities (ROLE_ADMIN, ROLE_LECTURER, ROLE_STUDENT).
 *  5. Route guards below enforce role-based access.
 *
 * The old hand-rolled JwtTokenProvider and JwtAuthenticationFilter are
 * completely removed — Spring Boot handles token validation automatically.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final OAuth2RoleConverter roleConverter;

    @Value("${app.beacon.api-key}")
    private String beaconApiKey;

    // ── JWT converter: validates token + extracts roles ───────────────────────

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        // Delegate role extraction to our Keycloak-aware converter
        converter.setJwtGrantedAuthoritiesConverter(roleConverter);
        // Use "preferred_username" (Keycloak's claim) as the principal name
        converter.setPrincipalClaimName("preferred_username");
        return converter;
    }

    // ── Filter chain ──────────────────────────────────────────────────────────

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                // Stateless API — no sessions, no CSRF needed
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s ->
                        s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // ── Public ────────────────────────────────────────────
                        // Swagger UI — open so you can test from the browser
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/webjars/**").permitAll()

                        // WebSocket handshake (SockJS + native)
                        .requestMatchers("/ws/**", "/ws").permitAll()

                        // Beacon heartbeat uses a static API key checked in the controller
                        .requestMatchers(HttpMethod.POST, "/beacons/heartbeat").permitAll()

                        // ── Admin only ────────────────────────────────────────
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/users/**").hasRole("ADMIN")
                        .requestMatchers("/settings/**").hasRole("ADMIN")
                        .requestMatchers("/audit-logs/**").hasRole("ADMIN")
                        .requestMatchers("/reports/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/beacons/**").hasRole("ADMIN")

                        // ── Lecturer ──────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/sessions/start")
                                .hasRole("LECTURER")
                        .requestMatchers(HttpMethod.POST, "/sessions/*/end")
                                .hasRole("LECTURER")
                        .requestMatchers(HttpMethod.POST, "/sessions/*/force-end")
                                .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/sessions/*/override")
                                .hasAnyRole("LECTURER", "ADMIN")

                        // ── Student ───────────────────────────────────────────
                        .requestMatchers("/checkin/**").hasRole("STUDENT")

                        // ── BLE endpoints ─────────────────────────────────────
                        .requestMatchers("/ble/session/lookup")
                                .hasRole("STUDENT")
                        .requestMatchers(
                                "/ble/session/*/token",
                                "/ble/session/*/rotate-token",
                                "/ble/session/*/token-status",
                                "/ble/session/*/events")
                                .hasAnyRole("LECTURER", "ADMIN")

                        // All other requests require a valid token
                        .anyRequest().authenticated()
                )

                // ── Configure as OAuth2 Resource Server ───────────────────────
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())))

                .build();
    }
}
