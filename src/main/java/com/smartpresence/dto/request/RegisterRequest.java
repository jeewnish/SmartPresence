package com.smartpresence.dto.request;

import com.smartpresence.entity.UserRole;
import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterRequest {

    @NotBlank @Size(max = 60)
    private String firstName;

    @NotBlank @Size(max = 60)
    private String lastName;

    @NotBlank @Email @Size(max = 120)
    private String email;

    @NotBlank @Size(min = 8, max = 64)
    private String password;

    @NotNull
    private UserRole role;

    /** Students only */
    @Size(max = 20)
    private String indexNumber;

    /** Students only */
    private Short enrollmentYear;
}
