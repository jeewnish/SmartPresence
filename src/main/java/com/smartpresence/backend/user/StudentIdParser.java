package com.smartpresence.backend.user;

import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class StudentIdParser {

    private static final Pattern STUDENT_ID =
        Pattern.compile("^(\\d{2})(FIS|FSE|FDS)(\\d{4})$", Pattern.CASE_INSENSITIVE);

    public ParsedStudentId parse(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("universityId is required for student accounts");
        }

        String normalized = studentId.trim().toLowerCase(Locale.ROOT);
        Matcher matcher = STUDENT_ID.matcher(normalized);
        if (!matcher.matches()) {
            throw new IllegalArgumentException(
                "Student universityId must match YYFISNNNN, YYFSENNNN, or YYFDSNNNN"
            );
        }

        AcademicDepartment department = switch (matcher.group(2).toUpperCase(Locale.ROOT)) {
            case "FIS" -> AcademicDepartment.CIS;
            case "FSE" -> AcademicDepartment.SE;
            case "FDS" -> AcademicDepartment.DS;
            default -> throw new IllegalStateException("Unsupported department code");
        };

        return new ParsedStudentId(normalized, matcher.group(1), department, matcher.group(3));
    }

    public record ParsedStudentId(
        String normalizedId,
        String admissionYear,
        AcademicDepartment department,
        String studentNumber
    ) {}
}
