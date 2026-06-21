package com.smartpresence.backend.user.dto;

import com.smartpresence.backend.user.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record OnboardRequest(
    @NotBlank(message = "firstName is required") String firstName,
    @NotBlank(message = "lastName is required") String lastName,
    @NotBlank @Email(message = "A valid email is required") String email,
    String universityId,
    UserRole role
) {}
