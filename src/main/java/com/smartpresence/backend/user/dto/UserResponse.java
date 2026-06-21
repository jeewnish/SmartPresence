package com.smartpresence.backend.user.dto;

import com.smartpresence.backend.user.User;
import com.smartpresence.backend.user.UserRole;
import com.smartpresence.backend.user.AcademicDepartment;

import java.time.OffsetDateTime;

public record UserResponse(
    Long id,
    String clerkUserId,
    String email,
    String firstName,
    String lastName,
    String universityId,
    AcademicDepartment department,
    UserRole role,
    OffsetDateTime createdAt
) {
    public static UserResponse from(User u) {
        return new UserResponse(
            u.getId(), u.getClerkUserId(), u.getEmail(),
            u.getFirstName(), u.getLastName(), u.getUniversityId(),
            u.getDepartment(), u.getRole(), u.getCreatedAt()
        );
    }
}
