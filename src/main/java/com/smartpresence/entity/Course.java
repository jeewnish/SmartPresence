package com.smartpresence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "courses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Integer courseId;

    @Column(name = "course_code", nullable = false, unique = true, length = 15)
    private String courseCode;

    @Column(name = "course_name", nullable = false, length = 150)
    private String courseName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "credit_hours", nullable = false)
    private Short creditHours = 3;

    @Column(name = "level", nullable = false)
    private Short level = 4;

    @Column(name = "semester", nullable = false)
    private Short semester = 1;

    @Column(name = "academic_year", nullable = false)
    private Short academicYear;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY)
    private List<Enrolment> enrolments;

    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY)
    private List<CourseAssignment> assignments;

    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY)
    private List<Session> sessions;
}
