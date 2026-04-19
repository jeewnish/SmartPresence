package com.smartpresence.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class StartSessionRequest {

    @NotNull
    private Integer courseId;

    private Integer venueId;

    @Positive
    private Short durationMinutes;
}
