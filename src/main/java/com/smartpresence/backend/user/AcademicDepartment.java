package com.smartpresence.backend.user;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public enum AcademicDepartment {
    CIS,
    SE,
    DS;

    private static final Pattern STUDENT_ID =
        Pattern.compile("^\\d{2}(FIS|FSE|FDS)\\d{4}$", Pattern.CASE_INSENSITIVE);

    public static AcademicDepartment fromUniversityId(String universityId) {
        if (universityId == null || universityId.isBlank()) {
            return null;
        }

        Matcher matcher = STUDENT_ID.matcher(universityId.trim());
        if (!matcher.matches()) {
            throw new IllegalArgumentException(
                "Student universityId must match YYFISNNNN, YYFSENNNN, or YYFDSNNNN"
            );
        }

        return switch (matcher.group(1).toUpperCase(Locale.ROOT)) {
            case "FIS" -> CIS;
            case "FSE" -> SE;
            case "FDS" -> DS;
            default -> throw new IllegalStateException("Unsupported department code");
        };
    }

    public static AcademicDepartment fromCourseCode(String courseCode) {
        if (courseCode == null) {
            return null;
        }
        String normalized = courseCode.trim().toUpperCase(Locale.ROOT);
        if (normalized.startsWith("IS")) {
            return CIS;
        }
        if (normalized.startsWith("SE")) {
            return SE;
        }
        if (normalized.startsWith("DS")) {
            return DS;
        }
        return null;
    }
}
