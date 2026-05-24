INSERT INTO system_settings (setting_key, setting_value, setting_group, description) VALUES
('absent_attendance_threshold_pct', '75', 'GENERAL', 'Minimum percentage of a lecture a student must attend to receive attendance credit'),
('academic_term_start_date', '2026-01-01', 'GENERAL', 'Active academic term start date used by analytics and reports'),
('academic_term_end_date', '2026-06-30', 'GENERAL', 'Active academic term end date used by analytics and reports'),
('timezone', 'Asia/Colombo', 'GENERAL', 'Timezone used for attendance logs and lecture localization'),
('beacon_stale_timeout_minutes', '15', 'BLE', 'Minutes before a silent BLE broadcaster is considered stale'),
('ble_broadcast_interval_seconds', '5', 'BLE', 'Seconds between BLE payload broadcasts'),
('ble_scanning_window_seconds', '10', 'BLE', 'BLE scan window duration in seconds'),
('identity_provider_sync_enabled', 'true', 'SECURITY', 'Whether identity provider role synchronization is enabled'),
('identity_provider_name', 'Keycloak', 'SECURITY', 'Authentication server used for admin and lecturer role sync'),
('device_binding_limit', '1', 'SECURITY', 'Maximum registered mobile devices allowed per student account'),
('concurrent_session_limit', '1', 'SECURITY', 'Maximum concurrent physical attendance sessions allowed for a student account'),
('low_battery_threshold_pct', '20', 'NOTIFICATIONS', 'Battery percentage below which users receive BLE reliability warnings'),
('absence_warning_alerts_enabled', 'true', 'NOTIFICATIONS', 'Whether automatic low-attendance warning alerts are enabled'),
('system_failure_alert_email', 'admin@smartpresence.lk', 'NOTIFICATIONS', 'Email or webhook target for automated session failure alerts'),
('push_notification_environment', 'DEV', 'NOTIFICATIONS', 'Push notification service environment'),
('push_notification_api_key', 'not-configured', 'NOTIFICATIONS', 'Push notification service API key placeholder')
ON CONFLICT (setting_key) DO NOTHING;
