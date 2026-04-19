package com.smartpresence.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.OAuthFlow;
import io.swagger.v3.oas.annotations.security.OAuthFlows;
import io.swagger.v3.oas.annotations.security.OAuthScope;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configures Swagger UI to authenticate via Keycloak.
 *
 * Click "Authorize" in the Swagger UI, then log in with your
 * Keycloak credentials. Swagger will include the Bearer token
 * automatically on every request so you can test protected endpoints.
 */
@Configuration
@SecurityScheme(
        name = "oauth2",
        type = SecuritySchemeType.OAUTH2,
        flows = @OAuthFlows(
                authorizationCode = @OAuthFlow(
                        authorizationUrl = "${KEYCLOAK_ISSUER_URI:http://localhost:8180/realms/smartpresence}/protocol/openid-connect/auth",
                        tokenUrl         = "${KEYCLOAK_ISSUER_URI:http://localhost:8180/realms/smartpresence}/protocol/openid-connect/token",
                        scopes = {
                                @OAuthScope(name = "openid",  description = "OpenID Connect"),
                                @OAuthScope(name = "profile", description = "User profile"),
                                @OAuthScope(name = "email",   description = "Email address"),
                                @OAuthScope(name = "roles",   description = "SmartPresence roles")
                        }
                )
        )
)
public class OpenApiConfig {

    @Value("${KEYCLOAK_ISSUER_URI:http://localhost:8180/realms/smartpresence}")
    private String issuerUri;

    @Bean
    public OpenAPI smartPresenceOpenApi() {
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList("oauth2"))
                .info(new Info()
                        .title("SmartPresence API")
                        .description("""
                            BLE-based Attendance System — IS 4110 Capstone, Group 08
                            Sabaragamuwa University of Sri Lanka

                            **Authentication:** Click **Authorize**, then log in with your
                            Keycloak account. Your role (admin / lecturer / student)
                            determines which endpoints you can access.

                            Keycloak realm: `smartpresence`
                            """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Group 08 — SUSL")
                                .email("Jeewekanayaka99@gmail.com")));
    }
}
