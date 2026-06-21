-- Account/course setup from accounts.md.
-- Student university IDs use YY + FIS/FSE/FDS + NNNN.

ALTER TABLE users
    ADD COLUMN university_id VARCHAR(9),
    ADD COLUMN department VARCHAR(3);

ALTER TABLE courses
    ADD COLUMN department VARCHAR(3);

ALTER TABLE users
    ADD CONSTRAINT uq_users_university_id UNIQUE (university_id),
    ADD CONSTRAINT chk_users_department
        CHECK (department IS NULL OR department IN ('CIS', 'SE', 'DS')),
    ADD CONSTRAINT chk_users_university_id
        CHECK (
            university_id IS NULL
            OR university_id ~* '^[0-9]{2}(fis|fse|fds|foc)[0-9]{4}$'
        );

ALTER TABLE courses
    ADD CONSTRAINT chk_courses_department
        CHECK (department IS NULL OR department IN ('CIS', 'SE', 'DS'));

CREATE INDEX idx_users_department ON users (department);
CREATE INDEX idx_courses_department_semester
    ON courses (department, semester, course_code);

CREATE OR REPLACE FUNCTION department_from_university_id(p_university_id VARCHAR)
RETURNS VARCHAR
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT CASE lower(substring(p_university_id FROM 3 FOR 3))
        WHEN 'fis' THEN 'CIS'
        WHEN 'fse' THEN 'SE'
        WHEN 'fds' THEN 'DS'
        ELSE NULL
    END;
$$;

CREATE OR REPLACE FUNCTION set_user_department()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.university_id := lower(NEW.university_id);
    NEW.department := department_from_university_id(NEW.university_id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_set_department
BEFORE INSERT OR UPDATE OF university_id ON users
FOR EACH ROW
EXECUTE FUNCTION set_user_department();

-- The original seed used the university ID as a temporary Clerk ID.
UPDATE users
SET university_id = lower(clerk_user_id)
WHERE clerk_user_id ~* '^[0-9]{2}(fis|fse|fds|foc)[0-9]{4}$';

-- Tag the existing catalog by its course-code prefix.
UPDATE courses
SET department = CASE
    WHEN course_code LIKE 'IS%' THEN 'CIS'
    WHEN course_code LIKE 'SE%' THEN 'SE'
    WHEN course_code LIKE 'DS%' THEN 'DS'
    ELSE NULL
END;

INSERT INTO courses (course_code, course_name, lecturer_id, semester, department)
VALUES
    ('IS4101', 'IT Auditing', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'CIS'),
    ('IS4102', 'Web Application Development', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'CIS'),
    ('IS4103', 'Operating Systems', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'CIS'),
    ('IS4104', 'System Administration and Maintenance', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'CIS'),
    ('IS4105', 'IT Procurement Management', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'CIS'),
    ('IS4106', 'Software Architecture', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'CIS'),
    ('IS4107', 'Professionalism & Ethics in Computing', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'CIS'),
    ('IS4108', 'IS Strategies', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'CIS'),
    ('IS4109', 'Agile Software Development', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'CIS'),
    ('IS4110', 'Capstone Project', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'CIS'),
    ('IS-EAP-2201', 'Academic English II', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'CIS'),
    ('SE4101', 'Security Fundamentals', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'SE'),
    ('SE4102', 'Software Verification and Validation', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'SE'),
    ('SE4103', 'Software Configuration Management', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'SE'),
    ('SE4104', 'Software Project Management', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'SE'),
    ('SE4105', 'Human Computer Interaction Design', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'SE'),
    ('SE4106', 'Projects in Web Systems and Technologies', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'SE'),
    ('SE4107', 'Industrial Inspection', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'SE'),
    ('SE4108', 'Risk Management', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'SE'),
    ('SE4109', 'Communication Skills', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'SE'),
    ('SE4110', 'Management Information Systems', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'SE'),
    ('SE-EAP-2201', 'Academic English II', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'SE'),
    ('DS4101', 'Advanced Database Management Systems', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'DS'),
    ('DS4102', 'Scientific Writing & Documentation', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'DS'),
    ('DS4103', 'Software Engineering', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'DS'),
    ('DS4104', 'Data Visualization', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'DS'),
    ('DS4105', 'Capstone Project in Data Science II', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'DS'),
    ('DS4106', 'Applied Data Mining', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'DS'),
    ('DS4107', 'Social and Professional Issues in Computing', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'DS'),
    ('DS4108', 'Business Intelligence', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'DS'),
    ('DS4109', 'Discrete Mathematics', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'DS'),
    ('DS4110', 'Artificial Intelligence', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'DS'),
    ('DS-EAP-2201', 'Academic English II', (SELECT id FROM users WHERE university_id = '22foc0029'), 'Semester 4', 'DS');

CREATE OR REPLACE FUNCTION enroll_student_in_department_courses(p_student_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM enrollments e
    USING users u, courses c
    WHERE e.student_id = u.id
      AND e.course_id = c.id
      AND u.id = p_student_id
      AND (
          c.semester <> 'Semester 4'
          OR c.department IS DISTINCT FROM u.department
      );

    INSERT INTO enrollments (student_id, course_id)
    SELECT u.id, c.id
    FROM users u
    JOIN courses c
      ON c.department = u.department
     AND c.semester = 'Semester 4'
    WHERE u.id = p_student_id
      AND u.role = 'ROLE_STUDENT'
      AND u.department IS NOT NULL
    ON CONFLICT (student_id, course_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION auto_enroll_student_department_courses()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM enroll_student_in_department_courses(NEW.id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_auto_enroll_department_courses
AFTER INSERT OR UPDATE OF university_id, role ON users
FOR EACH ROW
EXECUTE FUNCTION auto_enroll_student_department_courses();

SELECT enroll_student_in_department_courses(id)
FROM users
WHERE role = 'ROLE_STUDENT';
