-- =============================================================
--  SmartPresence - Flyway Migration V8
--  Refresh dashboard sandbox data with "live-like" operational rows
--
--  Goal:
--  1. Keep master data (departments/users/courses/venues) intact
--  2. Rebuild transactional data so dashboard screens look active
--  3. Use relative timestamps (NOW()) for realistic current views
-- =============================================================

-- ---------------------------------------------------------------
-- 1) Clear old transactional data (safe order for FK constraints)
-- ---------------------------------------------------------------
DELETE FROM ble_checkin_events;
DELETE FROM ble_broadcast_events;
DELETE FROM beacon_heartbeats;
DELETE FROM attendance_records;
DELETE FROM checkin_attempts;
DELETE FROM security_flags;
DELETE FROM notifications;
DELETE FROM report_logs;
DELETE FROM audit_logs;
DELETE FROM sessions;


-- ---------------------------------------------------------------
-- 2) Insert realistic recent ENDED sessions (past 10 days)
-- ---------------------------------------------------------------
WITH ranked_courses AS (
    SELECT
        c.course_id,
        c.course_code,
        ca.lecturer_id,
        ROW_NUMBER() OVER (ORDER BY c.course_code) AS rn
    FROM courses c
    JOIN course_assignments ca ON ca.course_id = c.course_id AND ca.is_active = TRUE
    WHERE c.is_active = TRUE
),
course_venue AS (
    SELECT
        rc.course_id,
        rc.course_code,
        rc.lecturer_id,
        CASE
            WHEN rc.rn % 4 = 1 THEN (SELECT venue_id FROM venues WHERE venue_code = 'LH-A' LIMIT 1)
            WHEN rc.rn % 4 = 2 THEN (SELECT venue_id FROM venues WHERE venue_code = 'LH-B' LIMIT 1)
            WHEN rc.rn % 4 = 3 THEN (SELECT venue_id FROM venues WHERE venue_code = 'LAB-401' LIMIT 1)
            ELSE (SELECT venue_id FROM venues WHERE venue_code = 'LH-C' LIMIT 1)
        END AS venue_id
    FROM ranked_courses rc
),
days AS (
    SELECT * FROM (VALUES (1), (2), (3), (4), (5), (6), (7), (8), (9), (10)) AS d(days_ago)
)
INSERT INTO sessions (
    course_id, lecturer_id, venue_id,
    ble_token, ble_token_expires_at,
    status, started_at, ended_at, scheduled_duration_minutes
)
SELECT
    cv.course_id,
    cv.lecturer_id,
    cv.venue_id,
    'TOKEN-' || cv.course_code || '-' || TO_CHAR((NOW() - (d.days_ago || ' days')::interval), 'YYYYMMDD'),
    (NOW() - (d.days_ago || ' days')::interval + interval '10 minutes'),
    'ENDED'::session_status,
    (NOW() - (d.days_ago || ' days')::interval + interval '9 hours'),
    (NOW() - (d.days_ago || ' days')::interval + interval '10 hours'),
    60
FROM course_venue cv
JOIN days d ON TRUE
WHERE cv.venue_id IS NOT NULL;


-- ---------------------------------------------------------------
-- 3) Insert live ACTIVE sessions (for dashboard + live monitor)
-- ---------------------------------------------------------------
WITH live_courses AS (
    SELECT
        c.course_id,
        c.course_code,
        ca.lecturer_id,
        ROW_NUMBER() OVER (ORDER BY c.course_code) AS rn
    FROM courses c
    JOIN course_assignments ca ON ca.course_id = c.course_id AND ca.is_active = TRUE
    WHERE c.is_active = TRUE
)
INSERT INTO sessions (
    course_id, lecturer_id, venue_id,
    ble_token, ble_token_expires_at,
    status, started_at, scheduled_duration_minutes, ws_topic
)
SELECT
    lc.course_id,
    lc.lecturer_id,
    CASE
        WHEN lc.rn = 1 THEN (SELECT venue_id FROM venues WHERE venue_code = 'LH-A' LIMIT 1)
        WHEN lc.rn = 2 THEN (SELECT venue_id FROM venues WHERE venue_code = 'LH-B' LIMIT 1)
        ELSE (SELECT venue_id FROM venues WHERE venue_code = 'LAB-402' LIMIT 1)
    END,
    'LIVE-' || lc.course_code || '-' || TO_CHAR(NOW(), 'HH24MISS'),
    NOW() + interval '8 minutes',
    'ACTIVE'::session_status,
    NOW() - interval '22 minutes',
    60,
    '/topic/session/live-' || lc.course_id
FROM live_courses lc
WHERE lc.rn <= 3;


-- ---------------------------------------------------------------
-- 4) Attendance records for ENDED sessions (varied outcomes)
-- ---------------------------------------------------------------
INSERT INTO attendance_records (
    session_id, student_id, device_id,
    ble_verified, biometric_verified, device_verified,
    rssi_value, ble_token_used, status, checked_in_at
)
SELECT
    s.session_id,
    u.user_id,
    dr.device_id,
    TRUE, TRUE, TRUE,
    (-58 - (u.user_id % 15))::smallint,
    s.ble_token,
    CASE
        WHEN (u.user_id + s.session_id) % 11 = 0 THEN 'ABSENT'::attendance_status
        WHEN (u.user_id + s.session_id) % 7 = 0 THEN 'LATE'::attendance_status
        ELSE 'PRESENT'::attendance_status
    END,
    s.started_at + ((3 + (u.user_id % 9)) || ' minutes')::interval
FROM sessions s
JOIN enrolments e ON e.course_id = s.course_id AND e.status = 'ACTIVE'
JOIN users u ON u.user_id = e.student_id AND u.role = 'STUDENT' AND u.is_active = TRUE
LEFT JOIN device_registrations dr
    ON dr.user_id = u.user_id AND dr.is_primary = TRUE AND dr.is_revoked = FALSE
WHERE s.status = 'ENDED'
ON CONFLICT (session_id, student_id) DO NOTHING;


-- ---------------------------------------------------------------
-- 5) Partial attendance for ACTIVE sessions (live progress bars)
-- ---------------------------------------------------------------
INSERT INTO attendance_records (
    session_id, student_id, device_id,
    ble_verified, biometric_verified, device_verified,
    rssi_value, ble_token_used, status, checked_in_at
)
SELECT
    s.session_id,
    u.user_id,
    dr.device_id,
    TRUE, TRUE, TRUE,
    (-55 - (u.user_id % 10))::smallint,
    s.ble_token,
    'PRESENT'::attendance_status,
    s.started_at + ((2 + (u.user_id % 6)) || ' minutes')::interval
FROM sessions s
JOIN enrolments e ON e.course_id = s.course_id AND e.status = 'ACTIVE'
JOIN users u ON u.user_id = e.student_id AND u.role = 'STUDENT' AND u.is_active = TRUE
LEFT JOIN device_registrations dr
    ON dr.user_id = u.user_id AND dr.is_primary = TRUE AND dr.is_revoked = FALSE
WHERE s.status = 'ACTIVE'
  AND (u.user_id % 3) <> 0
ON CONFLICT (session_id, student_id) DO NOTHING;


-- ---------------------------------------------------------------
-- 6) Add failed attempts + security flags (for alerts feed)
-- ---------------------------------------------------------------
INSERT INTO checkin_attempts (
    session_id, student_id, device_fingerprint,
    ble_verified, biometric_verified, device_verified,
    rssi_value, ble_token_presented, outcome, failure_reason, attempted_at
)
SELECT
    s.session_id,
    u.user_id,
    COALESCE(dr.device_fingerprint, 'MISSING-DEVICE-' || u.user_id),
    FALSE, FALSE, FALSE,
    (-92 + (u.user_id % 3))::smallint,
    s.ble_token,
    'FAILED_BLE'::checkin_outcome,
    'RSSI too weak for room perimeter validation',
    s.started_at + interval '1 minute'
FROM sessions s
JOIN enrolments e ON e.course_id = s.course_id AND e.status = 'ACTIVE'
JOIN users u ON u.user_id = e.student_id AND u.role = 'STUDENT' AND u.is_active = TRUE
LEFT JOIN device_registrations dr ON dr.user_id = u.user_id AND dr.is_primary = TRUE
WHERE s.status = 'ENDED'
  AND u.user_id % 9 = 1
LIMIT 40;

INSERT INTO security_flags (
    user_id, session_id, device_id,
    flag_type, severity, description, resolved, flagged_at
)
SELECT
    ca.student_id,
    ca.session_id,
    dr.device_id,
    'OUT_OF_RANGE'::flag_type,
    CASE WHEN ca.student_id % 2 = 0 THEN 'HIGH'::flag_severity ELSE 'MEDIUM'::flag_severity END,
    'Check-in rejected due to weak BLE signal near classroom boundary',
    FALSE,
    ca.attempted_at
FROM checkin_attempts ca
LEFT JOIN device_registrations dr ON dr.user_id = ca.student_id AND dr.is_primary = TRUE
WHERE ca.outcome = 'FAILED_BLE'
LIMIT 14;

-- One critical unresolved flag for dashboard attention
INSERT INTO security_flags (
    user_id, session_id, flag_type, severity, description, resolved, flagged_at
)
SELECT
    u.user_id,
    s.session_id,
    'REPLAY_TOKEN'::flag_type,
    'CRITICAL'::flag_severity,
    'Expired BLE token reuse detected across multiple attempts',
    FALSE,
    NOW() - interval '90 minutes'
FROM users u
JOIN sessions s ON s.status = 'ACTIVE'
WHERE u.role = 'STUDENT' AND u.is_active = TRUE
ORDER BY u.user_id
LIMIT 1;


-- ---------------------------------------------------------------
-- 7) Notifications + audit/report logs for admin pages
-- ---------------------------------------------------------------
INSERT INTO notifications (
    recipient_id, notification_type, title, body,
    related_entity_type, related_entity_id, is_read, created_at
)
SELECT
    admin_user.user_id,
    'SECURITY_FLAG'::notification_type,
    'Security Alert - ' || sf.flag_type::text,
    'Student ID ' || sf.user_id || ' triggered a ' || sf.severity::text || ' severity flag.',
    'security_flag',
    sf.flag_id,
    FALSE,
    sf.flagged_at
FROM security_flags sf
JOIN users admin_user ON admin_user.role = 'ADMIN' AND admin_user.is_active = TRUE
LIMIT 20;

INSERT INTO audit_logs (actor_id, action, entity_type, new_value, ip_address, performed_at)
SELECT
    admin_user.user_id,
    'REFRESH_SANDBOX_DATA',
    'system',
    '{"source":"V8 migration","note":"Dashboard sandbox regenerated"}'::jsonb,
    '127.0.0.1',
    NOW() - interval '2 minutes'
FROM users admin_user
WHERE admin_user.role = 'ADMIN'
LIMIT 1;

INSERT INTO report_logs (
    generated_by, report_type, date_range_start, date_range_end,
    filters_json, export_format, generated_at, file_size_kb
)
SELECT
    admin_user.user_id,
    'COURSE_ATTENDANCE'::report_type,
    CURRENT_DATE - 7,
    CURRENT_DATE,
    '{"course":"IS4110"}'::jsonb,
    'CSV'::export_format,
    NOW() - interval '4 hours',
    58
FROM users admin_user
WHERE admin_user.role = 'ADMIN'
LIMIT 1;


-- ---------------------------------------------------------------
-- 8) BLE dashboard data: status, heartbeats, broadcast + checkin
-- ---------------------------------------------------------------
UPDATE beacon_status_log bsl
SET
    current_status = CASE
        WHEN v.venue_code = 'LAB-403' THEN 'OFFLINE'::beacon_status
        WHEN v.venue_code = 'SEM-202' THEN 'DEGRADED'::beacon_status
        ELSE 'ONLINE'::beacon_status
    END,
    last_heartbeat_at = CASE
        WHEN v.venue_code = 'LAB-403' THEN NOW() - interval '9 minutes'
        ELSE NOW() - interval '25 seconds'
    END,
    last_online_at = CASE
        WHEN v.venue_code = 'LAB-403' THEN NOW() - interval '9 minutes'
        ELSE NOW() - interval '25 seconds'
    END,
    offline_since = CASE
        WHEN v.venue_code = 'LAB-403' THEN NOW() - interval '9 minutes'
        ELSE NULL
    END,
    battery_pct = CASE
        WHEN v.venue_code = 'SEM-202' THEN 16
        WHEN v.venue_code IN ('LH-A', 'LH-B') THEN 86
        ELSE 74
    END,
    firmware_version = '2.5.0',
    tx_power_dbm = -4,
    consecutive_failures = CASE WHEN v.venue_code = 'LAB-403' THEN 4 ELSE 0 END,
    updated_at = NOW()
FROM venues v
WHERE bsl.venue_id = v.venue_id;

INSERT INTO beacon_heartbeats (
    venue_id, beacon_mac, status, firmware_version,
    battery_pct, tx_power_dbm, rssi_self_check, uptime_seconds, received_at
)
SELECT
    v.venue_id,
    v.beacon_mac,
    CASE WHEN v.venue_code = 'SEM-202' THEN 'DEGRADED'::beacon_status ELSE 'ONLINE'::beacon_status END,
    '2.5.0',
    CASE WHEN v.venue_code = 'SEM-202' THEN 16 ELSE 80 END,
    -4,
    CASE WHEN v.venue_code = 'SEM-202' THEN -81 ELSE -57 END,
    604800,
    NOW() - (i.step_no * interval '30 seconds')
FROM venues v
JOIN (VALUES (0),(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11)) AS i(step_no) ON TRUE
WHERE v.beacon_mac IS NOT NULL
  AND v.venue_code <> 'LAB-403';

INSERT INTO ble_broadcast_events (
    session_id, venue_id, event_type, ble_token,
    token_issued_at, token_expires_at, tx_power_dbm, note
)
SELECT
    s.session_id, s.venue_id, 'TOKEN_ISSUED'::broadcast_event, s.ble_token,
    s.started_at,
    COALESCE(s.ended_at, s.started_at + interval '10 minutes'),
    -4,
    CASE WHEN s.status = 'ACTIVE' THEN 'Live token issued' ELSE 'Session token issued' END
FROM sessions s;

INSERT INTO ble_checkin_events (
    record_id, student_id, session_id, venue_id,
    beacon_mac, ble_token, rssi_dbm, rssi_samples,
    distance_est_m, tx_power_dbm, rssi_threshold, passed_rssi, passed_token, captured_at
)
SELECT
    ar.record_id, ar.student_id, ar.session_id, s.venue_id,
    v.beacon_mac, ar.ble_token_used, COALESCE(ar.rssi_value, -65),
    3,
    LEAST(999.99::numeric, ROUND(POWER(10.0, ((-4.0 - COALESCE(ar.rssi_value, -65)) / 27.0))::numeric, 2)),
    -4,
    COALESCE(v.rssi_threshold, -65),
    COALESCE(ar.rssi_value, -65) >= COALESCE(v.rssi_threshold, -65),
    TRUE,
    ar.checked_in_at
FROM attendance_records ar
JOIN sessions s ON s.session_id = ar.session_id
LEFT JOIN venues v ON v.venue_id = s.venue_id
WHERE ar.ble_token_used IS NOT NULL;


-- ---------------------------------------------------------------
-- 9) Summary notice
-- ---------------------------------------------------------------
DO $$
DECLARE
    v_sessions_active INT;
    v_sessions_ended INT;
    v_attendance INT;
    v_flags_open INT;
    v_beacons_online INT;
BEGIN
    SELECT COUNT(*) INTO v_sessions_active FROM sessions WHERE status = 'ACTIVE';
    SELECT COUNT(*) INTO v_sessions_ended FROM sessions WHERE status IN ('ENDED', 'FORCE_ENDED');
    SELECT COUNT(*) INTO v_attendance FROM attendance_records;
    SELECT COUNT(*) INTO v_flags_open FROM security_flags WHERE resolved = FALSE;
    SELECT COUNT(*) INTO v_beacons_online FROM beacon_status_log WHERE current_status = 'ONLINE';

    RAISE NOTICE '=== V8 Dashboard Sandbox Ready: active_sessions=%, ended_sessions=%, attendance_records=%, open_flags=%, online_beacons=%',
        v_sessions_active, v_sessions_ended, v_attendance, v_flags_open, v_beacons_online;
END $$;
