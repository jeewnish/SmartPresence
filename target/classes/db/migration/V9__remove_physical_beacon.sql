-- =============================================================
--  SmartPresence — Flyway Migration V9
--  Remove Physical BLE Hardware Beacon
--
--  The system no longer uses physical BLE beacon hardware.
--  Attendance is phone-to-phone:
--    - Lecturer's phone broadcasts the BLE token (advertiser)
--    - Student's phone scans and submits it (scanner)
--
--  This migration:
--    1. Drops the beacon_heartbeats table (rolling heartbeat log)
--    2. Drops the beacon_status_log table (per-venue health status)
--    3. Drops the beacon_status ENUM type
--    4. Removes beacon_mac and beacon_uuid from the venues table
--    5. Removes beacon_mac from ble_checkin_events
--    6. Removes beacon-hardware-specific system_settings entries
--    7. Updates the venues table comment
-- =============================================================

-- ---------------------------------------------------------------
-- 1. Drop beacon heartbeat tables (beacon_status_log references
--    beacon_heartbeats.BeaconStatus enum, so drop child first)
-- ---------------------------------------------------------------
DROP TABLE IF EXISTS beacon_status_log CASCADE;
DROP TABLE IF EXISTS beacon_heartbeats CASCADE;

-- ---------------------------------------------------------------
-- 2. Drop the beacon_status PostgreSQL ENUM type
--    (was: 'ONLINE', 'OFFLINE', 'DEGRADED', 'UNKNOWN')
-- ---------------------------------------------------------------
DROP TYPE IF EXISTS beacon_status;

-- ---------------------------------------------------------------
-- 3. Remove physical beacon identifier columns from venues
--    beacon_mac  — MAC address of the now-removed hardware device
--    beacon_uuid — iBeacon / Eddystone UUID of that device
--    rssi_threshold is KEPT — still used for phone-to-phone proximity
-- ---------------------------------------------------------------
ALTER TABLE venues DROP COLUMN IF EXISTS beacon_mac;
ALTER TABLE venues DROP COLUMN IF EXISTS beacon_uuid;

COMMENT ON TABLE venues IS 'Physical rooms. rssi_threshold defines the BLE proximity boundary for phone-to-phone check-in.';

-- ---------------------------------------------------------------
-- 4. Remove beacon_mac from ble_checkin_events
--    Previously recorded which physical beacon the student detected.
--    Not applicable in the phone-to-phone model.
-- ---------------------------------------------------------------
ALTER TABLE ble_checkin_events DROP COLUMN IF EXISTS beacon_mac;

-- ---------------------------------------------------------------
-- 5. Remove hardware-beacon-specific system settings
-- ---------------------------------------------------------------
DELETE FROM system_settings WHERE setting_key = 'beacon_api_key';
DELETE FROM system_settings WHERE setting_key = 'low_battery_threshold_pct';
