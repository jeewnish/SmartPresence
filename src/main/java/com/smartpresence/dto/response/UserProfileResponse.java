package com.smartpresence.dto.response;

import lombok.*;
import java.time.Instant;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProfileResponse {
    private Integer  userId;
    private String   email;
    private String   fullName;
    private String   role;
    private String   indexNumber;
    private Short    enrollmentYear;
    private Boolean  isActive;
    private String   keycloakSubject;  // Keycloak's sub claim — unique user ID in Keycloak
    private Instant  tokenExpiresAt;
}
