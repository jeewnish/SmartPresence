package com.smartpresence.backend.config;

import com.smartpresence.backend.security.ApiGatewayPrincipalFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;

/** Security for staging Lambda, where API Gateway performs Clerk JWT validation. */
@Configuration
@Profile("lambda")
@EnableMethodSecurity
@RequiredArgsConstructor
public class LambdaSecurityConfig {

    private final ApiGatewayPrincipalFilter apiGatewayPrincipalFilter;

    @Bean
    public SecurityFilterChain lambdaFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/v3/api-docs",
                    "/actuator/health"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(apiGatewayPrincipalFilter, AnonymousAuthenticationFilter.class);

        return http.build();
    }
}
