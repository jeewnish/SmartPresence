package com.smartpresence.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CourseUpsertRequest {

    @NotBlank @Size(max = 15)
    private String courseCode;

    @NotBlank @Size(max = 150)
    private String courseName;

    @NotNull
    private Integer departmentId;

    @NotNull @Min(1) @Max(12)
    private Short creditHours;

    @NotNull @Min(1) @Max(10)
    private Short level;

    @NotNull @Min(1) @Max(2)
    private Short semester;

    @NotNull @Min(2000) @Max(2100)
    private Short academicYear;

    private String description;

    private Boolean isActive;
}
