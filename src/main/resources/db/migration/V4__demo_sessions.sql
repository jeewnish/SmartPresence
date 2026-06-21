-- SmartPresence demo activity data.
-- Uses stable user/course keys instead of assuming generated numeric IDs.

INSERT INTO device_registrations
    (user_id, device_id, device_name, platform, is_active, last_seen_at)
VALUES
((SELECT id FROM users WHERE clerk_user_id = '22foc0029'),
 'DEVICE-SHARON-001', 'Sharon''s Pixel 8', 'ANDROID', TRUE, NOW() - INTERVAL '1 hour'),
((SELECT id FROM users WHERE clerk_user_id = '25fis0536'),
 'DEVICE-KAMAL-001', 'Kamal''s Samsung A54', 'ANDROID', TRUE, NOW() - INTERVAL '30 minutes'),
((SELECT id FROM users WHERE clerk_user_id = '23fis0444'),
 'DEVICE-VIKRAMA-001', 'Vikrama''s OnePlus Nord', 'ANDROID', TRUE, NOW() - INTERVAL '2 hours'),
((SELECT id FROM users WHERE clerk_user_id = '21fse0322'),
 'DEVICE-ISURI-001', 'Isuri''s iPhone 14', 'IOS', TRUE, NOW() - INTERVAL '45 minutes');

INSERT INTO attendance_sessions
    (course_id, session_secret, status, started_at, ended_at, created_by)
VALUES
((SELECT id FROM courses WHERE course_code = 'IS1101'),
 'secret-session-001', 'ENDED',
 NOW() - INTERVAL '1 day 3 hours', NOW() - INTERVAL '1 day 2 hours',
 (SELECT id FROM users WHERE clerk_user_id = '22foc0029')),
((SELECT id FROM courses WHERE course_code = 'IS2104'),
 'secret-session-002', 'ENDED',
 NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours',
 (SELECT id FROM users WHERE clerk_user_id = '22foc0029')),
((SELECT id FROM courses WHERE course_code = 'IS5103'),
 'secret-session-003', 'ACTIVE',
 NOW() - INTERVAL '20 minutes', NULL,
 (SELECT id FROM users WHERE clerk_user_id = '22foc0029'));

INSERT INTO attendance_records
    (student_id, session_id, attendance_time, verification_method, status)
VALUES
((SELECT id FROM users WHERE clerk_user_id = '25fis0536'),
 (SELECT s.id FROM attendance_sessions s
  JOIN courses c ON c.id = s.course_id
  WHERE c.course_code = 'IS1101' AND s.session_secret = 'secret-session-001'),
 NOW() - INTERVAL '1 day 2 hours 55 minutes', 'BLE_BIOMETRIC', 'PRESENT'),
((SELECT id FROM users WHERE clerk_user_id = '25fis0536'),
 (SELECT s.id FROM attendance_sessions s
  JOIN courses c ON c.id = s.course_id
  WHERE c.course_code = 'IS2104' AND s.session_secret = 'secret-session-002'),
 NOW() - INTERVAL '4 hours 50 minutes', 'BLE_BIOMETRIC', 'PRESENT');

INSERT INTO ble_checkin_events
    (student_id, device_id, session_id, token, rssi, distance_estimate,
     result, failure_reason, biometric_verified, attendance_token_id, created_at)
VALUES
((SELECT id FROM users WHERE clerk_user_id = '25fis0536'),
 (SELECT id FROM device_registrations WHERE device_id = 'DEVICE-KAMAL-001'),
 (SELECT id FROM attendance_sessions WHERE session_secret = 'secret-session-001'),
 'tok-abc-001', -68, 2.50, 'SUCCESS', NULL, TRUE,
 (SELECT ar.id FROM attendance_records ar
  JOIN attendance_sessions s ON s.id = ar.session_id
  WHERE s.session_secret = 'secret-session-001'
    AND ar.student_id = (SELECT id FROM users WHERE clerk_user_id = '25fis0536')),
 NOW() - INTERVAL '1 day 2 hours 55 minutes'),
((SELECT id FROM users WHERE clerk_user_id = '25fis0536'),
 (SELECT id FROM device_registrations WHERE device_id = 'DEVICE-KAMAL-001'),
 (SELECT id FROM attendance_sessions WHERE session_secret = 'secret-session-002'),
 'tok-def-002', -92, 9.80, 'LOW_RSSI',
 'Signal strength below threshold (-85 dBm). Move closer to the lecturer.',
 FALSE, NULL, NOW() - INTERVAL '4 hours 52 minutes'),
((SELECT id FROM users WHERE clerk_user_id = '25fis0536'),
 (SELECT id FROM device_registrations WHERE device_id = 'DEVICE-KAMAL-001'),
 (SELECT id FROM attendance_sessions WHERE session_secret = 'secret-session-002'),
 'tok-def-003', -71, 3.10, 'SUCCESS', NULL, TRUE,
 (SELECT ar.id FROM attendance_records ar
  JOIN attendance_sessions s ON s.id = ar.session_id
  WHERE s.session_secret = 'secret-session-002'
    AND ar.student_id = (SELECT id FROM users WHERE clerk_user_id = '25fis0536')),
 NOW() - INTERVAL '4 hours 50 minutes');
