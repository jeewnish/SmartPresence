package com.smartpresence.backend;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.sql.DriverManager;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
class FlywayMigrationIT {
    private static final List<String> CIS_COURSES = List.of(
        "IS-EGP-1201", "IS2101", "IS2102", "IS2103", "IS2104", "IS2105", "IS2106",
        "IS2107", "IS2108", "IS2109", "IS2110", "IS2111", "IS2112");
    private static final List<String> SE_COURSES = List.of(
        "SE-EGP-1201", "SE2101", "SE2102", "SE2103", "SE2104", "SE2105", "SE2106",
        "SE2107", "SE2108", "SE2109");
    private static final List<String> DS_COURSES = List.of(
        "DS-EGP-1201", "DS2101", "DS2102", "DS2103", "DS2104", "DS2105", "DS2106",
        "DS2107", "DS2108", "DS2109");

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("smartpresence")
        .withUsername("test")
        .withPassword("test");

    @Test
    void emptyDatabaseMigratesThroughV8WithExpectedCatalogAndAssignment() throws Exception {
        Flyway flyway = Flyway.configure()
            .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
            .locations("classpath:db/migration")
            .load();

        assertThat(flyway.migrate().migrationsExecuted).isEqualTo(8);

        try (var connection = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
             var statement = connection.createStatement()) {
            try (var rows = statement.executeQuery(
                "SELECT version FROM flyway_schema_history WHERE success ORDER BY installed_rank")) {
                var versions = new ArrayList<String>();
                while (rows.next()) versions.add(rows.getString(1));
                assertThat(versions).isEqualTo(List.of("1", "2", "3", "4", "5", "6", "7", "8"));
            }

            assertThat(courseCodes(connection, "CIS")).isEqualTo(CIS_COURSES);
            assertThat(courseCodes(connection, "SE")).isEqualTo(SE_COURSES);
            assertThat(courseCodes(connection, "DS")).isEqualTo(DS_COURSES);

            assertStudent(connection, "25fis0536", "CIS", "25", "0536", CIS_COURSES);
            assertStudent(connection, "23fis0444", "CIS", "23", "0444", CIS_COURSES);
            assertStudent(connection, "21fse0322", "SE", "21", "0322", SE_COURSES);

            assertThat(lecturerCourses(connection, "22foc0029")).containsExactly("IS2101");

            int enrollmentCount = scalarInt(connection, "SELECT count(*) FROM enrollments");
            statement.execute("SELECT enroll_student_in_department_courses(id) FROM users WHERE role = 'ROLE_STUDENT'");
            statement.execute("SELECT enroll_student_in_department_courses(id) FROM users WHERE role = 'ROLE_STUDENT'");
            assertThat(scalarInt(connection, "SELECT count(*) FROM enrollments")).isEqualTo(enrollmentCount);
        }
    }

    private static List<String> courseCodes(Connection connection, String department) throws Exception {
        return strings(connection, """
            SELECT course_code FROM courses
            WHERE semester = 'Semester 2' AND department = '%s'
            ORDER BY course_code
            """.formatted(department));
    }

    private static List<String> lecturerCourses(Connection connection, String universityId) throws Exception {
        return strings(connection, """
            SELECT c.course_code
            FROM lecturer_courses lc
            JOIN users u ON u.id = lc.lecturer_id
            JOIN courses c ON c.id = lc.course_id
            WHERE u.university_id = '%s'
            ORDER BY c.course_code
            """.formatted(universityId));
    }

    private static void assertStudent(Connection connection, String universityId, String department,
                                      String admissionYear, String studentNumber,
                                      List<String> expectedCourses) throws Exception {
        assertThat(strings(connection, """
            SELECT department || ':' || admission_year || ':' || student_number
            FROM users WHERE university_id = '%s'
            """.formatted(universityId)))
            .containsExactly(department + ":" + admissionYear + ":" + studentNumber);

        assertThat(strings(connection, """
            SELECT c.course_code
            FROM enrollments e
            JOIN users u ON u.id = e.student_id
            JOIN courses c ON c.id = e.course_id
            WHERE u.university_id = '%s' AND c.semester = 'Semester 2'
            ORDER BY c.course_code
            """.formatted(universityId)))
            .isEqualTo(expectedCourses);

        assertThat(scalarInt(connection, """
            SELECT count(*)
            FROM enrollments e
            JOIN users u ON u.id = e.student_id
            JOIN courses c ON c.id = e.course_id
            WHERE u.university_id = '%s'
              AND c.semester = 'Semester 2'
              AND c.department IS DISTINCT FROM u.department
            """.formatted(universityId)))
            .isZero();
    }

    private static List<String> strings(Connection connection, String sql) throws Exception {
        var values = new ArrayList<String>();
        try (var statement = connection.createStatement(); var rows = statement.executeQuery(sql)) {
            while (rows.next()) values.add(rows.getString(1));
        }
        return values;
    }

    private static int scalarInt(Connection connection, String sql) throws Exception {
        try (var statement = connection.createStatement(); var rows = statement.executeQuery(sql)) {
            assertThat(rows.next()).isTrue();
            return rows.getInt(1);
        }
    }
}
