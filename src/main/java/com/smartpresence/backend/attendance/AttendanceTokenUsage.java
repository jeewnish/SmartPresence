package com.smartpresence.backend.attendance;

import com.smartpresence.backend.session.AttendanceSession;
import com.smartpresence.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

/**
 * Replay-attack prevention: records every JTI (JWT ID) of a consumed attendance token.
 * Before accepting a check-in, the validation pipeline checks that the JTI has not
 * been recorded here. After acceptance, it is inserted here.
 */
@Entity
@Table(name = "attendance_token_usage")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceTokenUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The JTI claim from the attendance JWT. Must be globally unique. */
    @Column(name = "token_jti", nullable = false, unique = true)
    private String tokenJti;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private AttendanceSession session;

    @Column(name = "used_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime usedAt = OffsetDateTime.now();
}
