package com.smartpresence.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class VenueUpsertRequest {

    @NotBlank @Size(max = 20)
    private String venueCode;

    @NotBlank @Size(max = 100)
    private String venueName;

    @Size(max = 80)
    private String building;

    @Min(-10) @Max(200)
    private Short floor;

    @Min(1) @Max(1000)
    private Short capacity;

    @NotNull @Min(-120) @Max(-20)
    private Short rssiThreshold;

    private Boolean isActive;
}
