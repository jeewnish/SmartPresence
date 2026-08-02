package com.smartpresence.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.academic")
@Data
public class AcademicProperties {
    private String activeSemester = "Semester 2";
}
