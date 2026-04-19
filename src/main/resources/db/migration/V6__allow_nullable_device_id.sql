-- =============================================================
--  V6 — Allow NULL device_id on attendance_records
--
--  Manual overrides have no associated device — the lecturer
--  vouches for the student's physical presence. The NOT NULL
--  constraint on device_id incorrectly rejects these inserts.
-- =============================================================
ALTER TABLE attendance_records
    ALTER COLUMN device_id DROP NOT NULL;
