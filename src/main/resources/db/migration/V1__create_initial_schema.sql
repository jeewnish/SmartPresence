-- ============================================================
-- V1__create_initial_schema.sql
-- SmartPresence - Initial Database Schema
-- Spring Boot 4.1 + Java 21 + PostgreSQL + Flyway
-- ============================================================

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM (
    'ROLE_STUDENT',
    'ROLE_LECTURER',
    'ROLE_ADMIN'
);

CREATE TYPE platform_type AS ENUM (
    'ANDROID',
    'IOS'
);

CREATE TYPE session_status AS ENUM (
    'ACTIVE',
    'ENDED'
);

CREATE TYPE attendance_status AS ENUM (
    'PRESENT',
    'ABSENT',
    'PENDING'
);

CREATE TYPE verification_method AS ENUM (
    'BLE_BIOMETRIC',
    'MANUAL',
    'OFFLINE_SYNC'
);

CREATE TYPE checkin_result AS ENUM (
    'SUCCESS',
    'INVALID_TOKEN',
    'TOKEN_EXPIRED',
    'LOW_RSSI',
    'INVALID_DEVICE',
    'ALREADY_PRESENT',
    'INVALID_SESSION',
    'BIOMETRIC_FAILED'
);

-- ============================================================
-- TABLE: users
-- Central identity table linked to Clerk for auth.
-- Stores both Students and Lecturers.
-- ============================================================

CREATE TABLE users (
    id            BIGSERIAL       PRIMARY KEY,
    clerk_user_id VARCHAR(255)    NOT NULL UNIQUE,
    email         VARCHAR(255)    NOT NULL UNIQUE,
    first_name    VARCHAR(100)    NOT NULL,
    last_name     VARCHAR(100)    NOT NULL,
    role          user_role       NOT NULL DEFAULT 'ROLE_STUDENT',
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_user_id ON users (clerk_user_id);
CREATE INDEX idx_users_email         ON users (email);
CREATE INDEX idx_users_role          ON users (role);

-- ============================================================
-- TABLE: device_registrations
-- Each user can have one or more registered trusted devices.
-- 1 User → N Device Registrations
-- ============================================================

CREATE TABLE device_registrations (
    id            BIGSERIAL       PRIMARY KEY,
    user_id       BIGINT          NOT NULL,
    device_id     VARCHAR(255)    NOT NULL UNIQUE,
    device_name   VARCHAR(255)    NOT NULL,
    platform      platform_type   NOT NULL,
    is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
    registered_at TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    last_seen_at  TIMESTAMPTZ,

    CONSTRAINT fk_device_registrations_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_device_registrations_user_id   ON device_registrations (user_id);
CREATE INDEX idx_device_registrations_device_id ON device_registrations (device_id);
CREATE INDEX idx_device_registrations_is_active ON device_registrations (is_active);

-- ============================================================
-- TABLE: courses
-- Courses are created and owned by a Lecturer.
-- 1 Lecturer (User) → N Courses
-- ============================================================

CREATE TABLE courses (
    id          BIGSERIAL       PRIMARY KEY,
    course_code VARCHAR(50)     NOT NULL UNIQUE,
    course_name VARCHAR(255)    NOT NULL,
    lecturer_id BIGINT          NOT NULL,
    semester    VARCHAR(50)     NOT NULL,

    CONSTRAINT fk_courses_lecturer
        FOREIGN KEY (lecturer_id) REFERENCES users (id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_courses_lecturer_id ON courses (lecturer_id);
CREATE INDEX idx_courses_course_code ON courses (course_code);

-- ============================================================
-- TABLE: enrollments
-- Join table linking Students to Courses (N:M relationship).
-- ============================================================

CREATE TABLE enrollments (
    id          BIGSERIAL   PRIMARY KEY,
    student_id  BIGINT      NOT NULL,
    course_id   BIGINT      NOT NULL,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_enrollments_student
        FOREIGN KEY (student_id) REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_enrollments_course
        FOREIGN KEY (course_id) REFERENCES courses (id)
        ON DELETE CASCADE,

    -- A student can only be enrolled once per course
    CONSTRAINT uq_enrollments_student_course
        UNIQUE (student_id, course_id)
);

CREATE INDEX idx_enrollments_student_id ON enrollments (student_id);
CREATE INDEX idx_enrollments_course_id  ON enrollments (course_id);

-- ============================================================
-- TABLE: attendance_sessions
-- A Lecturer starts a session for a specific course.
-- 1 Course → N Sessions
-- session_secret is used to generate/validate BLE tokens.
-- ============================================================

CREATE TABLE attendance_sessions (
    id             BIGSERIAL       PRIMARY KEY,
    course_id      BIGINT          NOT NULL,
    session_secret VARCHAR(255)    NOT NULL,
    status         session_status  NOT NULL DEFAULT 'ACTIVE',
    started_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    ended_at       TIMESTAMPTZ,
    created_by     BIGINT          NOT NULL,

    CONSTRAINT fk_attendance_sessions_course
        FOREIGN KEY (course_id) REFERENCES courses (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_attendance_sessions_lecturer
        FOREIGN KEY (created_by) REFERENCES users (id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_attendance_sessions_course_id  ON attendance_sessions (course_id);
CREATE INDEX idx_attendance_sessions_created_by ON attendance_sessions (created_by);
CREATE INDEX idx_attendance_sessions_status     ON attendance_sessions (status);

-- ============================================================
-- TABLE: attendance_records
-- Final attendance result per student per session.
-- 1 Session → N Attendance Records
-- ============================================================

CREATE TABLE attendance_records (
    id                  BIGSERIAL           PRIMARY KEY,
    student_id          BIGINT              NOT NULL,
    session_id          BIGINT              NOT NULL,
    attendance_time     TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    verification_method verification_method NOT NULL,
    status              attendance_status   NOT NULL DEFAULT 'PENDING',

    CONSTRAINT fk_attendance_records_student
        FOREIGN KEY (student_id) REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_attendance_records_session
        FOREIGN KEY (session_id) REFERENCES attendance_sessions (id)
        ON DELETE RESTRICT,

    -- A student can only have one attendance record per session
    CONSTRAINT uq_attendance_records_student_session
        UNIQUE (student_id, session_id)
);

CREATE INDEX idx_attendance_records_student_id ON attendance_records (student_id);
CREATE INDEX idx_attendance_records_session_id ON attendance_records (session_id);
CREATE INDEX idx_attendance_records_status     ON attendance_records (status);

-- ============================================================
-- TABLE: ble_checkin_events
-- Full audit log of every check-in attempt (success or fail).
-- Every attempt is recorded, even when validation fails.
-- Linked to: student, device, session.
-- attendance_token_id references an attendance_record (optional,
--   only populated on SUCCESS).
-- ============================================================

CREATE TABLE ble_checkin_events (
    id                   BIGSERIAL       PRIMARY KEY,
    student_id           BIGINT          NOT NULL,
    device_id            BIGINT          NOT NULL,
    session_id           BIGINT          NOT NULL,
    token                VARCHAR(50)     NOT NULL,
    rssi                 INTEGER         NOT NULL,
    distance_estimate    DECIMAL(6, 2),
    result               checkin_result  NOT NULL,
    failure_reason       TEXT,
    biometric_verified   BOOLEAN         NOT NULL DEFAULT FALSE,
    attendance_token_id  BIGINT,
    created_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ble_checkin_events_student
        FOREIGN KEY (student_id) REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_ble_checkin_events_device
        FOREIGN KEY (device_id) REFERENCES device_registrations (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_ble_checkin_events_session
        FOREIGN KEY (session_id) REFERENCES attendance_sessions (id)
        ON DELETE RESTRICT,

    -- Links a successful check-in event to its attendance record
    CONSTRAINT fk_ble_checkin_events_attendance_record
        FOREIGN KEY (attendance_token_id) REFERENCES attendance_records (id)
        ON DELETE SET NULL
);

CREATE INDEX idx_ble_checkin_events_student_id  ON ble_checkin_events (student_id);
CREATE INDEX idx_ble_checkin_events_device_id   ON ble_checkin_events (device_id);
CREATE INDEX idx_ble_checkin_events_session_id  ON ble_checkin_events (session_id);
CREATE INDEX idx_ble_checkin_events_result      ON ble_checkin_events (result);
CREATE INDEX idx_ble_checkin_events_created_at  ON ble_checkin_events (created_at);

-- ============================================================
-- TABLE: attendance_challenges
-- Short-lived cryptographic challenge issued to a student's
-- device before submitting attendance. Prevents replay attacks.
-- TTL = 60 seconds (enforced in application layer via expires_at)
-- ============================================================

CREATE TABLE attendance_challenges (
    id         BIGSERIAL    PRIMARY KEY,
    student_id BIGINT       NOT NULL,
    device_id  BIGINT       NOT NULL,
    challenge  VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ  NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_attendance_challenges_student
        FOREIGN KEY (student_id) REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_attendance_challenges_device
        FOREIGN KEY (device_id) REFERENCES device_registrations (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_attendance_challenges_student_id ON attendance_challenges (student_id);
CREATE INDEX idx_attendance_challenges_device_id  ON attendance_challenges (device_id);
CREATE INDEX idx_attendance_challenges_challenge  ON attendance_challenges (challenge);
CREATE INDEX idx_attendance_challenges_expires_at ON attendance_challenges (expires_at);
CREATE INDEX idx_attendance_challenges_used       ON attendance_challenges (used);

-- ============================================================
-- UPDATED_AT TRIGGER
-- Automatically updates the updated_at column on users table.
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();
