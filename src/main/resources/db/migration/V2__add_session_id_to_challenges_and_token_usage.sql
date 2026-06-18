-- ============================================================
-- V2__add_session_id_to_challenges_and_token_usage.sql
-- SmartPresence - Schema improvements
--   1. attendance_challenges: add session_id column so the
--      server knows which session the challenge belongs to
--      when issuing the attendance token (avoids extra round-trip).
--   2. attendance_token_usage: prevents replay attacks by
--      recording every used attendance-token JTI.
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Add session_id to attendance_challenges
-- ----------------------------------------------------------------
ALTER TABLE attendance_challenges
    ADD COLUMN session_id BIGINT
    REFERENCES attendance_sessions (id)
    ON DELETE RESTRICT;

CREATE INDEX idx_attendance_challenges_session_id
    ON attendance_challenges (session_id);

-- ----------------------------------------------------------------
-- 2. Attendance token usage — replay-attack prevention
-- ----------------------------------------------------------------
CREATE TABLE attendance_token_usage (
    id         BIGSERIAL    PRIMARY KEY,
    token_jti  VARCHAR(255) NOT NULL UNIQUE,
    student_id BIGINT       NOT NULL,
    session_id BIGINT       NOT NULL,
    used_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_token_usage_student
        FOREIGN KEY (student_id) REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_token_usage_session
        FOREIGN KEY (session_id) REFERENCES attendance_sessions (id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_token_usage_jti        ON attendance_token_usage (token_jti);
CREATE INDEX idx_token_usage_student_id ON attendance_token_usage (student_id);
CREATE INDEX idx_token_usage_session_id ON attendance_token_usage (session_id);
