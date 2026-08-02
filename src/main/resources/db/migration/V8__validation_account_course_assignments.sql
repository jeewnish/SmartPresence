-- Forward-only correction for the staging validation lecturer assignment.
-- Stable university/course keys are used so numeric IDs may differ by environment.
DO $$
DECLARE
    validation_lecturer_id BIGINT;
    validation_course_id BIGINT;
BEGIN
    SELECT id INTO validation_lecturer_id
    FROM users
    WHERE university_id = '22foc0029' AND role = 'ROLE_LECTURER';

    IF validation_lecturer_id IS NULL THEN
        RAISE EXCEPTION 'Validation lecturer 22foc0029 does not exist or is not ROLE_LECTURER';
    END IF;

    SELECT id INTO validation_course_id
    FROM courses
    WHERE course_code = 'IS2101';

    IF validation_course_id IS NULL THEN
        RAISE EXCEPTION 'Validation course IS2101 does not exist';
    END IF;

    DELETE FROM lecturer_courses WHERE lecturer_id = validation_lecturer_id;
    INSERT INTO lecturer_courses (lecturer_id, course_id)
    VALUES (validation_lecturer_id, validation_course_id)
    ON CONFLICT (lecturer_id, course_id) DO NOTHING;
END;
$$;
