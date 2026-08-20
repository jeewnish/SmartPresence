package com.smartpresence.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;

/**
 * Builds the same JwtAuthenticationToken used by the container profile from the
 * Clerk subject that API Gateway has already validated and injected.
 *
 * The Lambda alias is invokable only by this API Gateway and the integration
 * overwrites this header, so a client-supplied value cannot reach the app.
 */
@Component
@RequiredArgsConstructor
public class ApiGatewayPrincipalFilter extends OncePerRequestFilter {

    public static final String PRINCIPAL_HEADER = "X-SmartPresence-Principal";

    private final ClerkJwtConverter clerkJwtConverter;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String subject = request.getHeader(PRINCIPAL_HEADER);
        if (subject != null && !subject.isBlank() && SecurityContextHolder.getContext().getAuthentication() == null) {
            Instant now = Instant.now();
            Jwt jwt = Jwt.withTokenValue("api-gateway-validated")
                .header("alg", "none")
                .subject(subject)
                .issuedAt(now)
                .expiresAt(now.plusSeconds(60))
                .build();
            SecurityContextHolder.getContext().setAuthentication(clerkJwtConverter.convert(jwt));
        }
        filterChain.doFilter(request, response);
    }
}
