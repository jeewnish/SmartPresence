-- ============================================================
-- V6__lecturer_courses_add_subject.sql
-- SmartPresence - Lecturer "Add Subject" feature
--
-- Lets a lecturer self-select which subjects from the catalog
-- they teach, independent of courses.lecturer_id (which keeps
-- meaning "default/original owner" and is otherwise no longer
-- load-bearing for authorization).
--
-- Many lecturers can add the same subject — e.g. two lecturers
-- each running their own section of IS4101.
--
-- Department scoping for the "Add Subject" browse screen is
-- handled in the app layer (manual filter), not the DB —
-- lecturer usernames (e.g. 22foc0029) don't encode a department
-- the way student usernames do, so there's nothing to constrain
-- here.
-- ============================================================

CREATE TABLE lecturer_courses (
    id          BIGSERIAL    PRIMARY KEY,
    lecturer_id BIGINT       NOT NULL,
    course_id   BIGINT       NOT NULL,
    added_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_lecturer_courses_lecturer
        FOREIGN KEY (lecturer_id) REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_lecturer_courses_course
        FOREIGN KEY (course_id) REFERENCES courses (id)
        ON DELETE CASCADE,

    -- A lecturer can only add a given subject once
    CONSTRAINT uq_lecturer_courses_lecturer_course
        UNIQUE (lecturer_id, course_id)
);

CREATE INDEX idx_lecturer_courses_lecturer_id ON lecturer_courses (lecturer_id);
CREATE INDEX idx_lecturer_courses_course_id   ON lecturer_courses (course_id);

-- ------------------------------------------------------------
-- Guard: only users with role = 'ROLE_LECTURER' may appear in
-- lecturer_courses.lecturer_id. Mirrors the existing
-- trigger_set_updated_at pattern from V1.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_check_lecturer_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users
        WHERE id = NEW.lecturer_id AND role = 'ROLE_LECTURER'
    ) THEN
        RAISE EXCEPTION 'lecturer_courses.lecturer_id (%) must reference a user with role ROLE_LECTURER', NEW.lecturer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lecturer_courses_check_role
BEFORE INSERT OR UPDATE ON lecturer_courses
FOR EACH ROW
EXECUTE FUNCTION trigger_check_lecturer_role();

-- ------------------------------------------------------------
-- Backfill: every course currently in the catalog already has
-- lecturer_id = 1 (Sharon) baked in from earlier migrations.
-- Carry that forward so her dashboard doesn't lose anything
-- that was already "hers" before this table existed.
-- ------------------------------------------------------------
INSERT INTO lecturer_courses (lecturer_id, course_id)
SELECT lecturer_id, id FROM courses
ON CONFLICT (lecturer_id, course_id) DO NOTHING;

-- ============================================================
-- App-layer usage
--
-- Add a subject:
--   INSERT INTO lecturer_courses (lecturer_id, course_id)
--   VALUES (:me, :course_id)
--   ON CONFLICT (lecturer_id, course_id) DO NOTHING;
--
-- Remove a subject:
--   DELETE FROM lecturer_courses
--   WHERE lecturer_id = :me AND course_id = :course_id;
--
-- "My Subjects" (lecturer dashboard):
--   SELECT c.* FROM courses c
--   JOIN lecturer_courses lc ON lc.course_id = c.id
--   WHERE lc.lecturer_id = :me;
--
-- "Add Subject" browse screen (full catalog, optional
-- department filter applied client-side / via WHERE on
-- course_code prefix, e.g. course_code LIKE 'IS%'):
--   SELECT * FROM courses ORDER BY course_code;
--
-- Only a lecturer who has added a course should be allowed to
-- start an attendance_sessions row for it — enforce that check
-- in the app layer when handling "start session" (i.e. confirm
-- a matching lecturer_courses row exists before the INSERT).
-- ============================================================
