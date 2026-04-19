-- =============================================================
--  SmartPresence — Flyway Migration V5
--  BLE System Sandbox Data
--
--  FIX: Replaced GENERATE_SERIES (set-returning function, can
--  cause issues with some Flyway JDBC drivers) with explicit
--  VALUES rows.  All venue lookups use venue_code subqueries.
-- =============================================================


-- ── 1. Update beacon_status_log with realistic states ─────────────────────────
UPDATE beacon_status_log bsl
SET    current_status    = CASE
           WHEN v.venue_code = 'LAB-403' THEN 'OFFLINE'::beacon_status
           WHEN v.venue_code = 'SEM-202' THEN 'DEGRADED'::beacon_status
           ELSE 'ONLINE'::beacon_status
       END,
       last_heartbeat_at = CASE
           WHEN v.venue_code = 'LAB-403' THEN NOW() - '5 minutes'::INTERVAL
           ELSE NOW() - '18 seconds'::INTERVAL
       END,
       last_online_at    = CASE
           WHEN v.venue_code = 'LAB-403' THEN NOW() - '5 minutes'::INTERVAL
           ELSE NOW() - '18 seconds'::INTERVAL
       END,
       offline_since     = CASE
           WHEN v.venue_code = 'LAB-403' THEN NOW() - '5 minutes'::INTERVAL
           ELSE NULL
       END,
       firmware_version  = '2.4.1',
       battery_pct       = CASE
           WHEN v.venue_code = 'SEM-202'             THEN 15::SMALLINT
           WHEN v.venue_code IN ('LH-A','LH-B')       THEN 87::SMALLINT
           ELSE 72::SMALLINT
       END,
       tx_power_dbm      = -4::SMALLINT,
       consecutive_failures = CASE
           WHEN v.venue_code = 'LAB-403' THEN 3::SMALLINT
           ELSE 0::SMALLINT
       END,
       updated_at        = NOW()
FROM   venues v
WHERE  bsl.venue_id = v.venue_id;


-- ── 2. Recent heartbeats — 20 rows per online beacon via VALUES ───────────────
--  Instead of GENERATE_SERIES we inline 20 offset values.
INSERT INTO beacon_heartbeats (
    venue_id, beacon_mac, status,
    firmware_version, battery_pct, tx_power_dbm,
    rssi_self_check, uptime_seconds, received_at
)
SELECT
    v.venue_id,
    v.beacon_mac,
    CASE WHEN v.venue_code = 'SEM-202'
         THEN 'DEGRADED'::beacon_status
         ELSE 'ONLINE'::beacon_status END,
    '2.4.1',
    CASE WHEN v.venue_code = 'SEM-202'       THEN 15::SMALLINT
         WHEN v.venue_code IN ('LH-A','LH-B') THEN 87::SMALLINT
         ELSE 72::SMALLINT END,
    -4::SMALLINT,
    CASE WHEN v.venue_code = 'SEM-202' THEN -82::SMALLINT ELSE -58::SMALLINT END,
    (EXTRACT(EPOCH FROM (NOW() - '7 days'::INTERVAL)))::BIGINT,
    NOW() - (offsets.secs * '30 seconds'::INTERVAL)
FROM venues v,
     (VALUES (0),(1),(2),(3),(4),(5),(6),(7),(8),(9),
             (10),(11),(12),(13),(14),(15),(16),(17),(18),(19)
     ) AS offsets(secs)
WHERE  v.beacon_mac IS NOT NULL
  AND  v.venue_code != 'LAB-403';


-- ── 3. BLE broadcast events: TOKEN_ISSUED for every past session ──────────────
INSERT INTO ble_broadcast_events (
    session_id, venue_id, event_type,
    ble_token, token_issued_at, token_expires_at,
    tx_power_dbm, note
)
SELECT
    s.session_id,
    s.venue_id,
    'TOKEN_ISSUED'::broadcast_event,
    s.ble_token,
    s.started_at,
    s.started_at + '600 seconds'::INTERVAL,
    -4::SMALLINT,
    'Initial token on session start'
FROM sessions s
WHERE s.status IN ('ENDED', 'FORCE_ENDED');


-- TOKEN_ROTATED — one rotation per session lasting 60+ min ────────────────────
INSERT INTO ble_broadcast_events (
    session_id, venue_id, event_type,
    ble_token, token_issued_at, token_expires_at,
    tx_power_dbm, note
)
SELECT
    s.session_id,
    s.venue_id,
    'TOKEN_ROTATED'::broadcast_event,
    'ROTATED-' || s.ble_token,
    s.started_at + '600 seconds'::INTERVAL,
    s.started_at + '1200 seconds'::INTERVAL,
    -4::SMALLINT,
    'Rotation #1 — auto-scheduler'
FROM sessions s
WHERE s.status IN ('ENDED', 'FORCE_ENDED')
  AND s.scheduled_duration_minutes >= 60;


-- SESSION_ENDED events ─────────────────────────────────────────────────────────
INSERT INTO ble_broadcast_events (
    session_id, venue_id, event_type,
    ble_token, token_issued_at, token_expires_at,
    tx_power_dbm, note
)
SELECT
    s.session_id,
    s.venue_id,
    'SESSION_ENDED'::broadcast_event,
    s.ble_token,
    s.ended_at,
    s.ended_at,
    -4::SMALLINT,
    CASE WHEN s.status = 'FORCE_ENDED'
         THEN 'Force-ended: ' || COALESCE(s.force_ended_reason, 'Admin action')
         ELSE 'Session ended normally'
    END
FROM sessions s
WHERE s.status IN ('ENDED', 'FORCE_ENDED')
  AND s.ended_at IS NOT NULL;


-- TOKEN_ISSUED for the two live ACTIVE sessions ───────────────────────────────
INSERT INTO ble_broadcast_events (
    session_id, venue_id, event_type,
    ble_token, token_issued_at, token_expires_at,
    tx_power_dbm, note
)
SELECT
    s.session_id, s.venue_id,
    'TOKEN_ISSUED'::broadcast_event,
    s.ble_token,
    s.started_at,
    s.ble_token_expires_at,
    -4::SMALLINT,
    'Initial token — session live now'
FROM sessions s
WHERE s.status = 'ACTIVE';


-- ── 4. BLE checkin events — one row per successful attendance record ──────────
INSERT INTO ble_checkin_events (
    record_id, student_id, session_id, venue_id,
    beacon_mac, ble_token,
    rssi_dbm, rssi_samples, distance_est_m,
    tx_power_dbm, rssi_threshold,
    passed_rssi, passed_token, captured_at
)
SELECT
    ar.record_id,
    ar.student_id,
    ar.session_id,
    s.venue_id,
    v.beacon_mac,
    ar.ble_token_used,
    ar.rssi_value,
    3::SMALLINT,
    LEAST(
        999.99::NUMERIC,
        ROUND(
            POWER(10.0,
                ((-4.0 - COALESCE(ar.rssi_value, -65)) / (10.0 * 2.7))
            )::NUMERIC, 2
        )
    ),
    -4::SMALLINT,
    COALESCE(v.rssi_threshold, -65),
    (COALESCE(ar.rssi_value, -65) >= COALESCE(v.rssi_threshold, -65)),
    TRUE,
    ar.checked_in_at
FROM attendance_records ar
JOIN sessions s ON s.session_id = ar.session_id
LEFT JOIN venues v ON v.venue_id = s.venue_id
WHERE ar.is_manual_override = FALSE
  AND ar.ble_token_used IS NOT NULL;


-- ── 5. BLE checkin events for failed attempts ─────────────────────────────────
INSERT INTO ble_checkin_events (
    attempt_id, student_id, session_id, venue_id,
    beacon_mac, ble_token,
    rssi_dbm, rssi_samples, distance_est_m,
    tx_power_dbm, rssi_threshold,
    passed_rssi, passed_token, captured_at
)
SELECT
    ca.attempt_id,
    ca.student_id,
    ca.session_id,
    s.venue_id,
    v.beacon_mac,
    ca.ble_token_presented,
    ca.rssi_value,
    2::SMALLINT,
    CASE
        WHEN ca.rssi_value IS NOT NULL
        THEN LEAST(
            999.99::NUMERIC,
            ROUND(POWER(10.0, ((-4.0 - ca.rssi_value) / 27.0))::NUMERIC, 2)
        )
        ELSE NULL
    END,
    -4::SMALLINT,
    COALESCE(v.rssi_threshold, -65),
    (COALESCE(ca.rssi_value, -99) >= COALESCE(v.rssi_threshold, -65)),
    (ca.outcome != 'FAILED_BLE'::checkin_outcome),
    ca.attempted_at
FROM checkin_attempts ca
JOIN sessions s ON s.session_id = ca.session_id
LEFT JOIN venues v ON v.venue_id = s.venue_id
WHERE ca.ble_token_presented IS NOT NULL;


-- ── 6. Update session rotation counts from broadcast events ───────────────────
UPDATE sessions s
SET token_rotation_count = (
    SELECT COUNT(*)::SMALLINT
    FROM   ble_broadcast_events be
    WHERE  be.session_id = s.session_id
      AND  be.event_type = 'TOKEN_ROTATED'::broadcast_event
),
last_token_rotated_at = (
    SELECT MAX(be.token_issued_at)
    FROM   ble_broadcast_events be
    WHERE  be.session_id = s.session_id
      AND  be.event_type = 'TOKEN_ROTATED'::broadcast_event
);


-- ── 7. Summary ────────────────────────────────────────────────────────────────
DO $$
DECLARE
    v_heartbeats    INT;
    v_status_logs   INT;
    v_bcast_events  INT;
    v_checkin_events INT;
BEGIN
    SELECT COUNT(*) INTO v_heartbeats     FROM beacon_heartbeats;
    SELECT COUNT(*) INTO v_status_logs    FROM beacon_status_log;
    SELECT COUNT(*) INTO v_bcast_events   FROM ble_broadcast_events;
    SELECT COUNT(*) INTO v_checkin_events FROM ble_checkin_events;
    RAISE NOTICE '=== V5 BLE Sandbox: heartbeats=%, status_logs=%, broadcast_events=%, checkin_events=%',
        v_heartbeats, v_status_logs, v_bcast_events, v_checkin_events;
    RAISE NOTICE 'Beacon states: LH-A/B/C/LAB-401/402/SEM-201=ONLINE, LAB-403=OFFLINE, SEM-202=DEGRADED';
END $$;
