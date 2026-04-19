package com.smartpresence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "enrolments",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "course_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Enrolment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "enrolment_id")
    private Integer enrolmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "enrolled_at", updatable = false)
    @Builder.Default
    private OffsetDateTime enrolledAt = OffsetDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "enrolment_status")
    @Builder.Default
    private EnrolmentStatus status = EnrolmentStatus.ACTIVE;

    public enum EnrolmentStatus { ACTIVE, DROPPED, COMPLETED }
}
