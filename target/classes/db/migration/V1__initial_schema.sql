-- =============================================================
--  SmartPresence — Flyway Migration V1
--  PostgreSQL Schema — Full Database Setup
-- =============================================================

-- ---------------------------------------------------------------
-- Custom ENUM types (PostgreSQL native enums)
-- ---------------------------------------------------------------
CREATE TYPE user_role           AS ENUM ('STUDENT', 'LECTURER', 'ADMIN');
CREATE TYPE os_type             AS ENUM ('ANDROID', 'IOS');
CREATE TYPE biometric_method    AS ENUM ('FINGERPRINT', 'FACEID', 'NONE');
CREATE TYPE enrolment_status    AS ENUM ('ACTIVE', 'DROPPED', 'COMPLETED');
CREATE TYPE session_status      AS ENUM ('SCHEDULED', 'ACTIVE', 'ENDED', 'FORCE_ENDED');
CREATE TYPE attendance_status   AS ENUM ('PRESENT', 'LATE', 'MANUAL_OVERRIDE', 'ABSENT');
CREATE TYPE checkin_outcome     AS ENUM ('SUCCESS', 'FAILED_BLE', 'FAILED_BIOMETRIC', 'FAILED_DEVICE', 'FAILED_ALL');
CREATE TYPE flag_type           AS ENUM (
    'DEVICE_MISMATCH',
    'MULTIPLE_DEVICE_ATTEMPT',
    'WEAK_BLE_SIGNAL',
    'BIOMETRIC_FAILURE',
    'REPLAY_TOKEN',
    'OUT_OF_RANGE',
    'RAPID_CHECKIN',
    'ACCOUNT_SHARING_SUSPECT',
    'OTHER'
);
CREATE TYPE flag_severity       AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE setting_group       AS ENUM ('GENERAL', 'SECURITY', 'NOTIFICATIONS', 'BLE');
CREATE TYPE notification_type   AS ENUM (
    'ATTENDANCE_ALERT',
    'SECURITY_FLAG',
    'SESSION_STARTED',
    'SESSION_ENDED',
    'LOW_ATTENDANCE_WARNING',
    'MANUAL_OVERRIDE_APPLIED',
    'SYSTEM_HEALTH',
    'ANNOUNCEMENT'
);
CREATE TYPE report_type         AS ENUM (
    'COURSE_ATTENDANCE',
    'SECURITY_ANOMALIES',
    'STUDENT_SUMMARY',
    'DEPARTMENT_OVERVIEW'
);
CREATE TYPE export_format       AS ENUM ('CSV', 'PDF');


-- =============================================================
-- SECTION 1 — INSTITUTIONAL STRUCTURE
-- =============================================================

CREATE TABLE departments (
    department_id   SERIAL          PRIMARY KEY,
    department_code VARCHAR(10)     NOT NULL UNIQUE,
    department_name VARCHAR(100)    NOT NULL,
    faculty         VARCHAR(100)    NOT NULL DEFAULT 'Faculty of Computing',
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE departments IS 'University departments / faculties';


CREATE TABLE courses (
    course_id       SERIAL          PRIMARY KEY,
    course_code     VARCHAR(15)     NOT NULL UNIQUE,
    course_name     VARCHAR(150)    NOT NULL,
    department_id   INTEGER         NOT NULL REFERENCES departments(department_id),
    credit_hours    SMALLINT        NOT NULL DEFAULT 3,
    level           SMALLINT        NOT NULL DEFAULT 4,
    semester        SMALLINT        NOT NULL DEFAULT 1 CHECK (semester IN (1, 2)),
    academic_year   SMALLINT        NOT NULL,
    description     TEXT,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE courses IS 'Academic courses offered by the university';


CREATE TABLE venues (
    venue_id        SERIAL          PRIMARY KEY,
    venue_code      VARCHAR(20)     NOT NULL UNIQUE,
    venue_name      VARCHAR(100)    NOT NULL,
    building        VARCHAR(80),
    floor           SMALLINT,
    capacity        SMALLINT,
    beacon_mac      VARCHAR(17)     UNIQUE,
    beacon_uuid     UUID            UNIQUE,
    rssi_threshold  SMALLINT        NOT NULL DEFAULT -70,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE venues IS 'Physical rooms with optional BLE beacon metadata';


-- =============================================================
-- SECTION 2 — USER MANAGEMENT
-- =============================================================

CREATE TABLE users (
    user_id         SERIAL          PRIMARY KEY,
    index_number    VARCHAR(20)     UNIQUE,
    first_name      VARCHAR(60)     NOT NULL,
    last_name       VARCHAR(60)     NOT NULL,
    email           VARCHAR(120)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    role            user_role       NOT NULL,
    department_id   INTEGER         REFERENCES departments(department_id),
    enrollment_year SMALLINT,
    profile_photo_url VARCHAR(512),
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE users IS 'All system users: students, lecturers, admins';
CREATE INDEX idx_users_role         ON users(role);
CREATE INDEX idx_users_dept_role    ON users(department_id, role);
CREATE INDEX idx_users_enroll_year  ON users(enrollment_year);


CREATE TABLE device_registrations (
    device_id           SERIAL          PRIMARY KEY,
    user_id             INTEGER         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    device_fingerprint  VARCHAR(255)    NOT NULL UNIQUE,
    device_model        VARCHAR(100),
    os_type             os_type         NOT NULL,
    os_version          VARCHAR(20),
    app_version         VARCHAR(20),
    is_primary          BOOLEAN         NOT NULL DEFAULT TRUE,
    registered_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    last_seen_at        TIMESTAMPTZ,
    is_revoked          BOOLEAN         NOT NULL DEFAULT FALSE,
    revoke_reason       VARCHAR(255)
);
COMMENT ON TABLE device_registrations IS 'One-time device binding for anti-sharing enforcement';
CREATE INDEX idx_device_user        ON device_registrations(user_id, is_primary);
CREATE INDEX idx_device_fingerprint ON device_registrations(device_fingerprint, is_revoked);


CREATE TABLE biometric_profiles (
    biometric_id            SERIAL      PRIMARY KEY,
    user_id                 INTEGER     NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    fingerprint_enrolled    BOOLEAN     NOT NULL DEFAULT FALSE,
    faceid_enrolled         BOOLEAN     NOT NULL DEFAULT FALSE,
    preferred_method        biometric_method NOT NULL DEFAULT 'NONE',
    enrolled_at             TIMESTAMPTZ,
    last_verified_at        TIMESTAMPTZ
);
COMMENT ON TABLE biometric_profiles IS 'OS biometric setup state — no raw biometric data stored';


-- =============================================================
-- SECTION 3 — ENROLMENT & ASSIGNMENT
-- =============================================================

CREATE TABLE enrolments (
    enrolment_id    SERIAL              PRIMARY KEY,
    student_id      INTEGER             NOT NULL REFERENCES users(user_id),
    course_id       INTEGER             NOT NULL REFERENCES courses(course_id),
    enrolled_at     TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    status          enrolment_status    NOT NULL DEFAULT 'ACTIVE',
    UNIQUE (student_id, course_id)
);
COMMENT ON TABLE enrolments IS 'Student enrolments in courses';
CREATE INDEX idx_enrolment_course ON enrolments(course_id);


CREATE TABLE course_assignments (
    assignment_id   SERIAL      PRIMARY KEY,
    lecturer_id     INTEGER     NOT NULL REFERENCES users(user_id),
    course_id       INTEGER     NOT NULL REFERENCES courses(course_id),
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by     INTEGER     NOT NULL REFERENCES users(user_id),
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    UNIQUE (lecturer_id, course_id)
);
COMMENT ON TABLE course_assignments IS 'Lecturer-to-course assignment with admin provenance';


-- =============================================================
-- SECTION 4 — SESSION MANAGEMENT
-- =============================================================

CREATE TABLE sessions (
    session_id                  SERIAL          PRIMARY KEY,
    course_id                   INTEGER         NOT NULL REFERENCES courses(course_id),
    lecturer_id                 INTEGER         NOT NULL REFERENCES users(user_id),
    venue_id                    INTEGER         REFERENCES venues(venue_id),
    ble_token                   VARCHAR(64)     NOT NULL UNIQUE,
    ble_token_expires_at        TIMESTAMPTZ     NOT NULL,
    status                      session_status  NOT NULL DEFAULT 'ACTIVE',
    started_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    ended_at                    TIMESTAMPTZ,
    scheduled_duration_minutes  SMALLINT        NOT NULL DEFAULT 60,
    force_ended_by              INTEGER         REFERENCES users(user_id),
    force_ended_at              TIMESTAMPTZ,
    force_ended_reason          VARCHAR(255),
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE sessions IS 'Each BLE attendance session started by a lecturer';
CREATE INDEX idx_session_course     ON sessions(course_id, status);
CREATE INDEX idx_session_lecturer   ON sessions(lecturer_id, status);
CREATE INDEX idx_session_active     ON sessions(status, started_at);
CREATE INDEX idx_session_date       ON sessions(started_at, course_id, status);
CREATE INDEX idx_session_ble_token  ON sessions(ble_token, status, ble_token_expires_at);


-- =============================================================
-- SECTION 5 — ATTENDANCE RECORDS
-- =============================================================

CREATE TABLE attendance_records (
    record_id           BIGSERIAL           PRIMARY KEY,
    session_id          INTEGER             NOT NULL REFERENCES sessions(session_id),
    student_id          INTEGER             NOT NULL REFERENCES users(user_id),
    device_id           INTEGER             NOT NULL REFERENCES device_registrations(device_id),
    ble_verified        BOOLEAN             NOT NULL DEFAULT FALSE,
    biometric_verified  BOOLEAN             NOT NULL DEFAULT FALSE,
    device_verified     BOOLEAN             NOT NULL DEFAULT FALSE,
    rssi_value          SMALLINT,
    ble_token_used      VARCHAR(64),
    status              attendance_status   NOT NULL DEFAULT 'PRESENT',
    checked_in_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    is_manual_override  BOOLEAN             NOT NULL DEFAULT FALSE,
    overridden_by       INTEGER             REFERENCES users(user_id),
    override_reason     VARCHAR(255),
    overridden_at       TIMESTAMPTZ,
    UNIQUE (session_id, student_id)
);
COMMENT ON TABLE attendance_records IS 'Authoritative check-in log with 3-layer verification flags';
CREATE INDEX idx_attendance_student ON attendance_records(student_id, checked_in_at);
CREATE INDEX idx_attendance_session ON attendance_records(session_id, status);


CREATE TABLE checkin_attempts (
    attempt_id          BIGSERIAL           PRIMARY KEY,
    session_id          INTEGER             NOT NULL REFERENCES sessions(session_id),
    student_id          INTEGER             NOT NULL REFERENCES users(user_id),
    device_fingerprint  VARCHAR(255)        NOT NULL,
    ble_verified        BOOLEAN             NOT NULL DEFAULT FALSE,
    biometric_verified  BOOLEAN             NOT NULL DEFAULT FALSE,
    device_verified     BOOLEAN             NOT NULL DEFAULT FALSE,
    rssi_value          SMALLINT,
    ble_token_presented VARCHAR(64),
    outcome             checkin_outcome     NOT NULL,
    failure_reason      VARCHAR(255),
    attempted_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE checkin_attempts IS 'Full log of every check-in attempt including failures';
CREATE INDEX idx_attempt_student ON checkin_attempts(student_id, attempted_at);
CREATE INDEX idx_attempt_session ON checkin_attempts(session_id, outcome);


-- =============================================================
-- SECTION 6 — SECURITY FLAGS
-- =============================================================

CREATE TABLE security_flags (
    flag_id         SERIAL          PRIMARY KEY,
    user_id         INTEGER         NOT NULL REFERENCES users(user_id),
    session_id      INTEGER         REFERENCES sessions(session_id),
    device_id       INTEGER         REFERENCES device_registrations(device_id),
    flag_type       flag_type       NOT NULL,
    severity        flag_severity   NOT NULL DEFAULT 'MEDIUM',
    description     TEXT,
    resolved        BOOLEAN         NOT NULL DEFAULT FALSE,
    resolved_by     INTEGER         REFERENCES users(user_id),
    resolved_at     TIMESTAMPTZ,
    resolution_note VARCHAR(500),
    flagged_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE security_flags IS 'Security anomaly events triggered during check-in attempts';
CREATE INDEX idx_flags_unresolved ON security_flags(resolved, severity, flagged_at);
CREATE INDEX idx_flags_user       ON security_flags(user_id, flagged_at);


-- =============================================================
-- SECTION 7 — SYSTEM SETTINGS
-- =============================================================

CREATE TABLE system_settings (
    setting_id      SERIAL          PRIMARY KEY,
    setting_key     VARCHAR(80)     NOT NULL UNIQUE,
    setting_value   TEXT            NOT NULL,
    setting_group   setting_group   NOT NULL DEFAULT 'GENERAL',
    description     VARCHAR(300),
    last_updated_by INTEGER         REFERENCES users(user_id),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE system_settings IS 'Admin-configurable system parameters';

INSERT INTO system_settings (setting_key, setting_value, setting_group, description) VALUES
('ble_rssi_threshold_strict',   '-65',  'BLE',           'Strict room perimeter RSSI threshold (dBm)'),
('ble_rssi_threshold_relaxed',  '-80',  'BLE',           'Relaxed hallway access RSSI threshold (dBm)'),
('ble_token_lifetime_seconds',  '600',  'BLE',           'BLE session token validity duration in seconds'),
('attendance_late_minutes',     '15',   'GENERAL',       'Grace period in minutes before marking attendance as late'),
('min_attendance_pct_alert',    '50',   'NOTIFICATIONS', 'Alert when course attendance % drops below this value'),
('biometric_required',          'true', 'SECURITY',      'Require biometric verification for every check-in'),
('device_binding_required',     'true', 'SECURITY',      'Require registered device for check-in'),
('max_failed_attempts_flag',    '3',    'SECURITY',      'Failed check-in attempts before raising a security flag'),
('notify_lecturer_on_flag',     'true', 'NOTIFICATIONS', 'Push notification to lecturer on new security flag'),
('beacon_api_key',              'sp-beacon-key-change-in-prod', 'SECURITY', 'Static API key for physical beacon heartbeat endpoint');


-- =============================================================
-- SECTION 8 — NOTIFICATIONS
-- =============================================================

CREATE TABLE notifications (
    notification_id     SERIAL              PRIMARY KEY,
    recipient_id        INTEGER             NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    sender_id           INTEGER             REFERENCES users(user_id),
    notification_type   notification_type   NOT NULL,
    title               VARCHAR(150)        NOT NULL,
    body                TEXT                NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id   INTEGER,
    is_read             BOOLEAN             NOT NULL DEFAULT FALSE,
    read_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE notifications IS 'In-app notifications powering the Alerts Feed';
CREATE INDEX idx_notification_recipient ON notifications(recipient_id, is_read, created_at);


-- =============================================================
-- SECTION 9 — AUDIT & COMPLIANCE
-- =============================================================

CREATE TABLE audit_logs (
    log_id          BIGSERIAL   PRIMARY KEY,
    actor_id        INTEGER     NOT NULL REFERENCES users(user_id),
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       INTEGER,
    old_value       JSONB,
    new_value       JSONB,
    ip_address      INET,
    user_agent      VARCHAR(255),
    performed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE audit_logs IS 'Immutable audit trail for all admin and lecturer actions';
CREATE INDEX idx_audit_actor  ON audit_logs(actor_id, performed_at);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);


CREATE TABLE report_logs (
    report_log_id   SERIAL          PRIMARY KEY,
    generated_by    INTEGER         NOT NULL REFERENCES users(user_id),
    report_type     report_type     NOT NULL,
    date_range_start DATE           NOT NULL,
    date_range_end   DATE           NOT NULL,
    filters_json    JSONB,
    export_format   export_format   NOT NULL,
    generated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    file_size_kb    INTEGER
);
COMMENT ON TABLE report_logs IS 'Tracks every report export for compliance';
CREATE INDEX idx_report_actor ON report_logs(generated_by, generated_at);


-- =============================================================
-- SECTION 10 — VIEWS
-- =============================================================

CREATE OR REPLACE VIEW vw_dashboard_kpis AS
SELECT
    (SELECT COUNT(*) FROM users WHERE role = 'STUDENT' AND is_active = TRUE)
        AS total_active_students,

    (SELECT ROUND(AVG(sub.pct)::NUMERIC, 1)
     FROM (
         SELECT
             s.session_id,
             COUNT(DISTINCT ar.student_id) * 100.0
             / NULLIF(COUNT(DISTINCT e.student_id), 0) AS pct
         FROM sessions s
         JOIN enrolments e ON e.course_id = s.course_id AND e.status = 'ACTIVE'
         LEFT JOIN attendance_records ar ON ar.session_id = s.session_id
         WHERE s.started_at::DATE = CURRENT_DATE
           AND s.status IN ('ACTIVE', 'ENDED', 'FORCE_ENDED')
         GROUP BY s.session_id
     ) sub
    ) AS today_avg_attendance_pct,

    (SELECT COUNT(*) FROM sessions     WHERE status = 'ACTIVE')   AS active_sessions_now,
    (SELECT COUNT(*) FROM security_flags WHERE resolved = FALSE)   AS open_security_flags;


CREATE OR REPLACE VIEW vw_active_sessions AS
SELECT
    s.session_id,
    c.course_code,
    c.course_name,
    u.first_name || ' ' || u.last_name     AS lecturer_name,
    v.venue_name,
    v.venue_code,
    s.started_at,
    s.scheduled_duration_minutes,
    EXTRACT(EPOCH FROM (NOW() - s.started_at))::INT / 60   AS elapsed_minutes,
    s.scheduled_duration_minutes
        - EXTRACT(EPOCH FROM (NOW() - s.started_at))::INT / 60  AS remaining_minutes,
    COUNT(ar.record_id)                    AS students_checked_in
FROM sessions s
JOIN courses c   ON c.course_id  = s.course_id
JOIN users   u   ON u.user_id    = s.lecturer_id
LEFT JOIN venues v  ON v.venue_id  = s.venue_id
LEFT JOIN attendance_records ar ON ar.session_id = s.session_id
WHERE s.status = 'ACTIVE'
GROUP BY s.session_id, c.course_code, c.course_name,
         u.first_name, u.last_name, v.venue_name, v.venue_code;


CREATE OR REPLACE VIEW vw_daily_attendance_rate AS
SELECT
    s.course_id,
    c.course_code,
    c.course_name,
    s.started_at::DATE                                          AS session_date,
    COUNT(DISTINCT e.student_id)                                AS total_enrolled,
    COUNT(DISTINCT ar.student_id)                               AS students_present,
    ROUND(
        COUNT(DISTINCT ar.student_id) * 100.0
        / NULLIF(COUNT(DISTINCT e.student_id), 0), 1
    )                                                           AS attendance_pct
FROM sessions s
JOIN courses    c  ON c.course_id  = s.course_id
JOIN enrolments e  ON e.course_id  = s.course_id AND e.status = 'ACTIVE'
LEFT JOIN attendance_records ar
       ON ar.session_id = s.session_id
      AND ar.status IN ('PRESENT', 'LATE', 'MANUAL_OVERRIDE')
WHERE s.status IN ('ACTIVE', 'ENDED', 'FORCE_ENDED')
GROUP BY s.course_id, c.course_code, c.course_name, s.started_at::DATE;


CREATE OR REPLACE VIEW vw_student_attendance_summary AS
SELECT
    u.user_id                                   AS student_id,
    u.first_name || ' ' || u.last_name          AS student_name,
    u.index_number,
    c.course_id,
    c.course_code,
    c.course_name,
    COUNT(DISTINCT s.session_id)                AS total_sessions,
    COUNT(DISTINCT ar.record_id)                AS sessions_attended,
    ROUND(
        COUNT(DISTINCT ar.record_id) * 100.0
        / NULLIF(COUNT(DISTINCT s.session_id), 0), 1
    )                                           AS attendance_pct
FROM users u
JOIN enrolments e  ON e.student_id = u.user_id  AND e.status = 'ACTIVE'
JOIN courses    c  ON c.course_id  = e.course_id
JOIN sessions   s  ON s.course_id  = c.course_id
                  AND s.status IN ('ENDED', 'FORCE_ENDED')
LEFT JOIN attendance_records ar
       ON ar.session_id = s.session_id AND ar.student_id = u.user_id
WHERE u.role = 'STUDENT'
GROUP BY u.user_id, u.first_name, u.last_name, u.index_number, c.course_id, c.course_code, c.course_name;


CREATE OR REPLACE VIEW vw_security_flags_open AS
SELECT
    sf.flag_id,
    sf.flag_type,
    sf.severity,
    u.first_name || ' ' || u.last_name  AS student_name,
    u.index_number,
    c.course_code,
    sf.description,
    sf.flagged_at
FROM security_flags sf
JOIN users      u  ON u.user_id    = sf.user_id
LEFT JOIN sessions s  ON s.session_id = sf.session_id
LEFT JOIN courses  c  ON c.course_id  = s.course_id
WHERE sf.resolved = FALSE
ORDER BY
    CASE sf.severity
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH'     THEN 2
        WHEN 'MEDIUM'   THEN 3
        ELSE 4
    END,
    sf.flagged_at DESC;


-- =============================================================
-- SECTION 11 — UPDATED_AT TRIGGER (auto-update timestamps)
-- =============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_venues_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
