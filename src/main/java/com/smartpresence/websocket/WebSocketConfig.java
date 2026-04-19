package com.smartpresence.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * STOMP over WebSocket — authenticates the CONNECT frame using Keycloak's JWT.
 *
 * BUG FIX: The original code called NimbusJwtDecoder.withIssuerLocation(issuerUri).build()
 * on every single CONNECT frame. That triggers an HTTP request to Keycloak's OIDC discovery
 * endpoint and a JWKS download on every connection — catastrophic under real load.
 * Fix: inject the auto-configured JwtDecoder bean (created once at startup, caches keys).
 */
@Slf4j
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtAuthenticationConverter jwtAuthenticationConverter;
    // Auto-configured by Spring Boot's OAuth2 resource server — validates against
    // Keycloak's JWKS endpoint once at startup and caches the public keys.
    private final JwtDecoder jwtDecoder;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");

                    if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                        String tokenValue = authHeader.substring(7);
                        try {
                            // Re-use the shared JwtDecoder bean — no network call per CONNECT.
                            Jwt jwt = jwtDecoder.decode(tokenValue);
                            Authentication auth = jwtAuthenticationConverter.convert(jwt);
                            accessor.setUser(auth);
                            log.debug("WebSocket authenticated: {}",
                                    jwt.getClaimAsString("preferred_username"));
                        } catch (Exception e) {
                            log.warn("WebSocket CONNECT rejected — invalid token: {}",
                                    e.getMessage());
                        }
                    }
                }
                return message;
            }
        });
    }
}
