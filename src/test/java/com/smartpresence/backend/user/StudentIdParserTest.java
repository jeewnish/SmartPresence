package com.smartpresence.backend.user;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StudentIdParserTest {

    private final StudentIdParser parser = new StudentIdParser();

    @Test
    void parsesAndNormalizesAllSupportedDepartments() {
        assertParsed(" 22FiS0345 ", "22fis0345", "22", AcademicDepartment.CIS, "0345");
        assertParsed("22FSE0123", "22fse0123", "22", AcademicDepartment.SE, "0123");
        assertParsed("23fds0456", "23fds0456", "23", AcademicDepartment.DS, "0456");
    }

    @Test
    void rejectsUnsupportedOrMalformedIds() {
        for (String invalid : new String[] {
            "22CIS0345", "22ABC0345", "2FIS0345", "22FIS345", "22FIS03456",
            "22FIS03A5", "", "   "
        }) {
            assertThatThrownBy(() -> parser.parse(invalid))
                .isInstanceOf(IllegalArgumentException.class);
        }
        assertThatThrownBy(() -> parser.parse(null))
            .isInstanceOf(IllegalArgumentException.class);
    }

    private void assertParsed(
        String input,
        String normalized,
        String year,
        AcademicDepartment department,
        String number
    ) {
        var parsed = parser.parse(input);
        assertThat(parsed.normalizedId()).isEqualTo(normalized);
        assertThat(parsed.admissionYear()).isEqualTo(year);
        assertThat(parsed.department()).isEqualTo(department);
        assertThat(parsed.studentNumber()).isEqualTo(number);
    }
}
