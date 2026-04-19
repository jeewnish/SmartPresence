package com.smartpresence.dto.request;

import com.smartpresence.entity.AttendanceRecord;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ManualOverrideRequest {

    @NotNull
    private Integer studentId;

    @NotNull
    private AttendanceRecord.AttendanceStatus newStatus;

    @NotBlank
    private String reason;
}
