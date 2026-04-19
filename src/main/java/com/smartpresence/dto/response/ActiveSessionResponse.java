package com.smartpresence.dto.response;

import lombok.*;
import java.time.OffsetDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ActiveSessionResponse {
    private Integer         sessionId;
    private String          courseCode;
    private String          courseName;
    private String          lecturerName;
    private String          venueName;
    private String          venueCode;
    private OffsetDateTime  startedAt;
    private long            elapsedMinutes;
    private long            remainingMinutes;
    private long            studentsCheckedIn;
}
