package com.smartpresence.backend.attendance;

import com.smartpresence.backend.session.AttendanceSession;
import com.smartpresence.backend.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

@Entity
@Table(name = "attendance_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private AttendanceSession session;

    @Column(name = "attendance_time", nullable = false)
    @Builder.Default
    private OffsetDateTime attendanceTime = OffsetDateTime.now();

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "verification_method", nullable = false, columnDefinition = "verification_method")
    private VerificationMethod verificationMethod;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "attendance_status")
    @Builder.Default
    private AttendanceStatus status = AttendanceStatus.PENDING;
}
