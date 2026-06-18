package com.smartpresence.backend.user.dto;

import com.smartpresence.backend.user.User;
import com.smartpresence.backend.user.UserRole;

import java.time.OffsetDateTime;

public record UserResponse(
    Long id,
    String clerkUserId,
    String email,
    String firstName,
    String lastName,
    UserRole role,
    OffsetDateTime createdAt
) {
    public static UserResponse from(User u) {
        return new UserResponse(
            u.getId(), u.getClerkUserId(), u.getEmail(),
            u.getFirstName(), u.getLastName(), u.getRole(), u.getCreatedAt()
        );
    }
}
