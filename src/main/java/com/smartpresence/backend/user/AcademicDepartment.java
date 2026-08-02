package com.smartpresence.backend.user;

import java.util.Locale;

public enum AcademicDepartment {
    CIS,
    SE,
    DS;

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
