-- =============================================================
--  SmartPresence — Flyway Migration V4
--  BLE System Tables
--  Adds: beacon_heartbeats, ble_broadcast_events, ble_checkin_events
-- =============================================================

-- ── ENUM types for BLE system ──────────────────────────────────
CREATE TYPE beacon_status   AS ENUM ('ONLINE', 'OFFLINE', 'DEGRADED', 'UNKNOWN');
CREATE TYPE broadcast_event AS ENUM ('TOKEN_ISSUED', 'TOKEN_ROTATED', 'TOKEN_EXPIRED', 'SESSION_ENDED');

-- ---------------------------------------------------------------
-- beacon_heartbeats
-- Physical BLE beacons POST a heartbeat every 30 s.
-- The scheduler marks them OFFLINE if no ping arrives in 2 min.
-- ---------------------------------------------------------------
CREATE TABLE beacon_heartbeats (
    heartbeat_id    BIGSERIAL       PRIMARY KEY,
    venue_id        INTEGER         NOT NULL REFERENCES venues(venue_id),
    beacon_mac      VARCHAR(17)     NOT NULL,
    status          beacon_status   NOT NULL DEFAULT 'ONLINE',
    firmware_version VARCHAR(20),
    battery_pct     SMALLINT        CHECK (battery_pct BETWEEN 0 AND 100),
    tx_power_dbm    SMALLINT,           -- beacon transmit power setting
    rssi_self_check SMALLINT,           -- beacon's own signal strength test
    uptime_seconds  BIGINT,
    received_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE beacon_heartbeats IS 'Rolling heartbeat log from physical BLE beacons';

CREATE INDEX idx_heartbeat_venue   ON beacon_heartbeats(venue_id, received_at DESC);
CREATE INDEX idx_heartbeat_mac     ON beacon_heartbeats(beacon_mac, received_at DESC);


-- ---------------------------------------------------------------
-- beacon_status_log
-- Current live status of each beacon — one row per venue, upserted.
-- ---------------------------------------------------------------
CREATE TABLE beacon_status_log (
    status_id           SERIAL          PRIMARY KEY,
    venue_id            INTEGER         NOT NULL UNIQUE REFERENCES venues(venue_id),
    beacon_mac          VARCHAR(17)     NOT NULL,
    current_status      beacon_status   NOT NULL DEFAULT 'UNKNOWN',
    last_heartbeat_at   TIMESTAMPTZ,
    last_online_at      TIMESTAMPTZ,
    offline_since       TIMESTAMPTZ,
    firmware_version    VARCHAR(20),
    battery_pct         SMALLINT,
    tx_power_dbm        SMALLINT,
    consecutive_failures SMALLINT       NOT NULL DEFAULT 0,
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE beacon_status_log IS 'Current health status of every BLE beacon — one row per venue';

-- Seed a row for every existing venue that has a beacon
INSERT INTO beacon_status_log (venue_id, beacon_mac, current_status)
SELECT venue_id, beacon_mac, 'UNKNOWN'::beacon_status
FROM   venues
WHERE  beacon_mac IS NOT NULL;


-- ---------------------------------------------------------------
-- ble_broadcast_events
-- Every token issuance / rotation / expiry is logged here.
-- This is the authoritative audit trail of what token was live
-- at any given moment — critical for dispute resolution.
-- ---------------------------------------------------------------
CREATE TABLE ble_broadcast_events (
    event_id        BIGSERIAL           PRIMARY KEY,
    session_id      INTEGER             NOT NULL REFERENCES sessions(session_id),
    venue_id        INTEGER             REFERENCES venues(venue_id),
    event_type      broadcast_event     NOT NULL,
    ble_token       VARCHAR(64)         NOT NULL,
    token_issued_at TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    token_expires_at TIMESTAMPTZ        NOT NULL,
    tx_power_dbm    SMALLINT,           -- power level used for this broadcast period
    initiated_by    INTEGER             REFERENCES users(user_id),  -- NULL = auto-rotation
    note            VARCHAR(255)
);
COMMENT ON TABLE ble_broadcast_events IS 'Full audit trail of every BLE token issuance and rotation';

CREATE INDEX idx_ble_event_session ON ble_broadcast_events(session_id, token_issued_at DESC);
CREATE INDEX idx_ble_event_token   ON ble_broadcast_events(ble_token);


-- ---------------------------------------------------------------
-- ble_checkin_events
-- Fine-grained log of the BLE signal captured by the student
-- device at the moment of check-in — used for RSSI analytics
-- and fraud forensics.
-- ---------------------------------------------------------------
CREATE TABLE ble_checkin_events (
    ble_event_id    BIGSERIAL       PRIMARY KEY,
    record_id       BIGINT          REFERENCES attendance_records(record_id),
    attempt_id      BIGINT          REFERENCES checkin_attempts(attempt_id),
    student_id      INTEGER         NOT NULL REFERENCES users(user_id),
    session_id      INTEGER         NOT NULL REFERENCES sessions(session_id),
    venue_id        INTEGER         REFERENCES venues(venue_id),

    -- BLE signal data captured by student device
    beacon_mac      VARCHAR(17),
    ble_token       VARCHAR(64)     NOT NULL,
    rssi_dbm        SMALLINT        NOT NULL,
    rssi_samples    SMALLINT,           -- number of RSSI readings averaged
    distance_est_m  NUMERIC(5,2),       -- estimated distance in metres (from RSSI)
    tx_power_dbm    SMALLINT,           -- advertised TX power from beacon packet

    -- Validation outcome
    rssi_threshold  SMALLINT        NOT NULL,
    passed_rssi     BOOLEAN         NOT NULL,
    passed_token    BOOLEAN         NOT NULL,

    captured_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE ble_checkin_events IS 'Fine-grained BLE signal log for every check-in attempt';

CREATE INDEX idx_ble_checkin_session ON ble_checkin_events(session_id, captured_at DESC);
CREATE INDEX idx_ble_checkin_student ON ble_checkin_events(student_id, captured_at DESC);


-- ---------------------------------------------------------------
-- Add WebSocket session tracking column to sessions table
-- ---------------------------------------------------------------
ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS ws_topic VARCHAR(100),
    ADD COLUMN IF NOT EXISTS token_rotation_count SMALLINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_token_rotated_at TIMESTAMPTZ;

-- Populate ws_topic for existing sessions
UPDATE sessions SET ws_topic = '/topic/session/' || session_id
WHERE  ws_topic IS NULL;
