-- Persist parsed student identity fields and seed the complete Semester II catalog.

ALTER TABLE users
    ADD COLUMN admission_year VARCHAR(2),
    ADD COLUMN student_number VARCHAR(4);

UPDATE users
SET admission_year = substring(university_id FROM 1 FOR 2),
    student_number = substring(university_id FROM 6 FOR 4)
WHERE university_id ~* '^[0-9]{2}(fis|fse|fds)[0-9]{4}$';

ALTER TABLE users
    ADD CONSTRAINT chk_users_admission_year
        CHECK (admission_year IS NULL OR admission_year ~ '^[0-9]{2}$'),
    ADD CONSTRAINT chk_users_student_number
        CHECK (student_number IS NULL OR student_number ~ '^[0-9]{4}$'),
    ADD CONSTRAINT chk_users_student_identity_parts
        CHECK (
            role <> 'ROLE_STUDENT'
            OR (
                university_id ~* '^[0-9]{2}(fis|fse|fds)[0-9]{4}$'
                AND admission_year = substring(university_id FROM 1 FOR 2)
                AND student_number = substring(university_id FROM 6 FOR 4)
                AND department = department_from_university_id(university_id)
            )
        );

CREATE OR REPLACE FUNCTION set_user_department()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.university_id := lower(NEW.university_id);
    NEW.department := department_from_university_id(NEW.university_id);

    IF NEW.university_id ~* '^[0-9]{2}(fis|fse|fds)[0-9]{4}$' THEN
        NEW.admission_year := substring(NEW.university_id FROM 1 FOR 2);
        NEW.student_number := substring(NEW.university_id FROM 6 FOR 4);
    ELSE
        NEW.admission_year := NULL;
        NEW.student_number := NULL;
    END IF;

    RETURN NEW;
END;
$$;

WITH seed_lecturer AS (
    SELECT id
    FROM users
    WHERE role = 'ROLE_LECTURER'
    ORDER BY id
    LIMIT 1
), catalog(course_code, course_name, department) AS (
    VALUES
        ('SE2101', 'Algorithms, Data Structures, and Complexity', 'SE'),
        ('SE2102', 'Database Management Systems', 'SE'),
        ('SE2103', 'Operating Systems Basics', 'SE'),
        ('SE2104', 'Object Oriented Programming', 'SE'),
        ('SE2105', 'Requirement Specification and Documentation', 'SE'),
        ('SE2106', 'Software Process Implementation', 'SE'),
        ('SE2107', 'Analysis Fundamentals', 'SE'),
        ('SE2108', 'Advanced Mathematics', 'SE'),
        ('SE2109', 'Communication Skills II', 'SE'),
        ('SE-EGP-1201', 'General English II', 'SE'),
        ('IS2101', 'Object Oriented Programming', 'CIS'),
        ('IS2102', 'Object Oriented Programming Practicum', 'CIS'),
        ('IS2103', 'Emerging IS Technologies', 'CIS'),
        ('IS2104', 'Database Systems', 'CIS'),
        ('IS2105', 'Database Management Systems Practicum', 'CIS'),
        ('IS2106', 'System Analysis & Design', 'CIS'),
        ('IS2107', 'Social & Professional Issues', 'CIS'),
        ('IS2108', 'Human Computer Interaction', 'CIS'),
        ('IS2109', 'Information Assurance & Security', 'CIS'),
        ('IS2110', 'Software Project Initiation & Planning', 'CIS'),
        ('IS2111', 'Advanced Mathematics', 'CIS'),
        ('IS2112', 'Communication Skills II', 'CIS'),
        ('IS-EGP-1201', 'General English II', 'CIS'),
        ('DS2101', 'Operating Systems', 'DS'),
        ('DS2102', 'Data Structures', 'DS'),
        ('DS2103', 'Linear Algebra', 'DS'),
        ('DS2104', 'Object Oriented Programming', 'DS'),
        ('DS2105', 'Capstone Project in Data Science I', 'DS'),
        ('DS2106', 'Analysis of Algorithms', 'DS'),
        ('DS2107', 'System Analysis and Design', 'DS'),
        ('DS2108', 'Data Pre-Processing', 'DS'),
        ('DS2109', 'Communication Skills II', 'DS'),
        ('DS-EGP-1201', 'General English II', 'DS')
)
INSERT INTO courses (course_code, course_name, lecturer_id, semester, department)
SELECT catalog.course_code, catalog.course_name, seed_lecturer.id, 'Semester 2', catalog.department
FROM catalog
CROSS JOIN seed_lecturer
ON CONFLICT (course_code) DO UPDATE
SET course_name = EXCLUDED.course_name,
    semester = EXCLUDED.semester,
    department = EXCLUDED.department;

-- Keep historical enrollments. New/updated students only gain their Semester II catalog.
CREATE OR REPLACE FUNCTION enroll_student_in_department_courses(p_student_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO enrollments (student_id, course_id)
    SELECT u.id, c.id
    FROM users u
    JOIN courses c
      ON c.department = u.department
     AND c.semester = 'Semester 2'
    WHERE u.id = p_student_id
      AND u.role = 'ROLE_STUDENT'
      AND u.department IS NOT NULL
    ON CONFLICT (student_id, course_id) DO NOTHING;
END;
$$;

SELECT enroll_student_in_department_courses(id)
FROM users
WHERE role = 'ROLE_STUDENT';
