package com.smartpresence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;

@Entity
@Table(name = "report_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReportLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_log_id")
    private Integer reportLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by", nullable = false)
    private User generatedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false, columnDefinition = "report_type")
    private ReportType reportType;

    @Column(name = "date_range_start", nullable = false)
    private LocalDate dateRangeStart;

    @Column(name = "date_range_end", nullable = false)
    private LocalDate dateRangeEnd;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "filters_json", columnDefinition = "jsonb")
    private Map<String, Object> filtersJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "export_format", nullable = false, columnDefinition = "export_format")
    private ExportFormat exportFormat;

    @Column(name = "generated_at", updatable = false)
    private OffsetDateTime generatedAt = OffsetDateTime.now();

    @Column(name = "file_size_kb")
    private Integer fileSizeKb;

    public enum ReportType {
        COURSE_ATTENDANCE, SECURITY_ANOMALIES, STUDENT_SUMMARY, DEPARTMENT_OVERVIEW
    }

    public enum ExportFormat { CSV, PDF }
}
