package com.smartpresence.dto.response;

import lombok.*;
import java.time.OffsetDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AlertResponse {
    private Integer        flagId;
    private String         flagType;
    private String         severity;
    private String         studentName;
    private String         indexNumber;
    private String         courseCode;
    private String         description;
    private OffsetDateTime flaggedAt;
}
