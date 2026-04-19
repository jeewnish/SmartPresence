-- =============================================================
--  SmartPresence — Flyway Migration V3
--  Comprehensive Sandbox / Demo Data
--
--  FIXES vs original:
--  1. Removed psql \set command (not supported by Flyway JDBC)
--  2. All department_id / FK references use subqueries by code,
--     so SERIAL sequence gaps from ON CONFLICT skips never cause
--     foreign-key violations.
-- =============================================================

-- ---------------------------------------------------------------
-- 1.  DEPARTMENTS  (add DS; CIS/SE/NET already in V2)
-- ---------------------------------------------------------------
INSERT INTO departments (department_code, department_name, faculty)
VALUES ('DS', 'Data Science and AI', 'Faculty of Computing')
ON CONFLICT (department_code) DO NOTHING;


-- ---------------------------------------------------------------
-- 2.  COURSES  — use subquery for department_id everywhere
-- ---------------------------------------------------------------
INSERT INTO courses (course_code, course_name, department_id, credit_hours, level, semester, academic_year, description)
SELECT course_code, course_name,
       (SELECT department_id FROM departments WHERE department_code = dept),
       credit_hours, level, semester, academic_year, description
FROM (VALUES
  -- CIS
  ('IS4110', 'Capstone Project',                       'CIS', 6, 4, 1, 2026, 'Final year integration project'),
  ('IS3210', 'Database Systems',                       'CIS', 3, 3, 1, 2026, 'Relational and NoSQL databases'),
  ('IS2120', 'Data Structures & Algorithms',           'CIS', 3, 2, 2, 2026, 'Core CS fundamentals'),
  -- SE
  ('SE3110', 'Software Architecture',                  'SE',  3, 3, 1, 2026, 'Design patterns and system design'),
  ('SE2210', 'Agile Software Development',             'SE',  3, 2, 2, 2026, 'Scrum, Kanban and DevOps practices'),
  ('SE4210', 'Mobile Application Development',         'SE',  3, 4, 2, 2026, 'Android and iOS development'),
  -- NET
  ('NT3100', 'Network Security Fundamentals',          'NET', 3, 3, 1, 2026, 'Cryptography, firewalls, VPNs'),
  ('NT2100', 'Computer Networks',                      'NET', 3, 2, 1, 2026, 'OSI model, TCP/IP, routing'),
  ('NT4100', 'Ethical Hacking & Penetration Testing',  'NET', 3, 4, 1, 2026, 'Offensive security methodology'),
  -- DS
  ('DS3100', 'Machine Learning',                       'DS',  3, 3, 2, 2026, 'Supervised and unsupervised learning'),
  ('DS2100', 'Statistics for Data Science',            'DS',  3, 2, 1, 2026, 'Probability, distributions, hypothesis'),
  ('DS4100', 'Deep Learning & Neural Networks',        'DS',  3, 4, 2, 2026, 'CNNs, RNNs, Transformers')
) AS t(course_code, course_name, dept, credit_hours, level, semester, academic_year, description)
ON CONFLICT (course_code) DO NOTHING;


-- ---------------------------------------------------------------
-- 3.  VENUES
-- ---------------------------------------------------------------
INSERT INTO venues (venue_code, venue_name, building, floor, capacity, beacon_mac, beacon_uuid, rssi_threshold)
VALUES
  ('LH-A',    'Lecture Hall A',       'Main Block', 1, 150, 'AA:BB:CC:DD:EE:01', 'a1b2c3d4-0001-0001-0001-aabbccddeeff', -65),
  ('LH-B',    'Lecture Hall B',       'Main Block', 1, 120, 'AA:BB:CC:DD:EE:02', 'a1b2c3d4-0002-0002-0002-aabbccddeeff', -65),
  ('LH-C',    'Lecture Hall C',       'Main Block', 2, 100, 'AA:BB:CC:DD:EE:06', 'a1b2c3d4-0003-0003-0003-aabbccddeeff', -65),
  ('LAB-401', 'Computer Lab 401',     'IT Block',   4,  40, 'AA:BB:CC:DD:EE:03', 'a1b2c3d4-0004-0004-0004-aabbccddeeff', -60),
  ('LAB-402', 'Computer Lab 402',     'IT Block',   4,  40, 'AA:BB:CC:DD:EE:04', 'a1b2c3d4-0005-0005-0005-aabbccddeeff', -60),
  ('LAB-403', 'Network Lab 403',      'IT Block',   4,  35, 'AA:BB:CC:DD:EE:07', 'a1b2c3d4-0006-0006-0006-aabbccddeeff', -62),
  ('SEM-201', 'Seminar Room 201',     'Main Block', 2,  30, 'AA:BB:CC:DD:EE:08', 'a1b2c3d4-0007-0007-0007-aabbccddeeff', -68),
  ('SEM-202', 'Seminar Room 202',     'Main Block', 2,  30, 'AA:BB:CC:DD:EE:09', 'a1b2c3d4-0008-0008-0008-aabbccddeeff', -68)
ON CONFLICT (venue_code) DO NOTHING;


-- ---------------------------------------------------------------
-- 4.  USERS
--     Bcrypt hash of "Pass@1234" inlined directly (no \set).
--     department_id looked up by code with a subquery.
-- ---------------------------------------------------------------

-- Admins
INSERT INTO users (first_name, last_name, email, password_hash, role, department_id, is_active)
SELECT first_name, last_name, email,
       '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
       'ADMIN'::user_role,
       (SELECT department_id FROM departments WHERE department_code = dept),
       TRUE
FROM (VALUES
  ('System',   'Admin',     'admin@smartpresence.lk',    'CIS'),
  ('Saranga',  'Somaweera', 'saranga@susl.lk',           'CIS'),
  ('Vasantha', 'Priyan',    'vasantha@susl.lk',          'CIS')
) AS t(first_name, last_name, email, dept)
ON CONFLICT (email) DO NOTHING;

-- Lecturers
INSERT INTO users (first_name, last_name, email, password_hash, role, department_id, is_active)
SELECT first_name, last_name, email,
       '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
       'LECTURER'::user_role,
       (SELECT department_id FROM departments WHERE department_code = dept),
       TRUE
FROM (VALUES
  ('Nirubikaa',  'Ratnam',      'nirubikaa@susl.lk',          'CIS'),
  ('Harshani',   'Vitharana',   'harshani@susl.lk',           'SE'),
  ('Kamal',      'Perera',      'kamal.perera@susl.lk',       'CIS'),
  ('Dilini',     'Fernando',    'dilini.fernando@susl.lk',    'SE'),
  ('Ruwan',      'Jayasinghe',  'ruwan.jayasinghe@susl.lk',   'NET'),
  ('Chamara',    'Bandara',     'chamara.bandara@susl.lk',    'NET'),
  ('Priyanka',   'Silva',       'priyanka.silva@susl.lk',     'DS'),
  ('Nishantha',  'Wickrama',    'nishantha.wickrama@susl.lk', 'DS')
) AS t(first_name, last_name, email, dept)
ON CONFLICT (email) DO NOTHING;

-- Students — CIS batch 2022
INSERT INTO users (index_number, first_name, last_name, email, password_hash, role, department_id, enrollment_year, is_active)
SELECT index_number, first_name, last_name, email,
       '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
       'STUDENT'::user_role,
       (SELECT department_id FROM departments WHERE department_code = dept),
       enrollment_year, active
FROM (VALUES
  ('22CIS0272', 'Chamindu',  'Sandeepa',    'sandeepa@student.susl.lk',    'CIS', 2022, TRUE),
  ('22CIS0273', 'Pasan',     'Denuwan',     'denuwan@student.susl.lk',     'CIS', 2022, TRUE),
  ('22CIS0276', 'Chamika',   'Nilaweera',   'nilaweera@student.susl.lk',   'CIS', 2022, TRUE),
  ('22CIS0279', 'Jeewan',    'Ekanayaka',   'ekanayaka@student.susl.lk',   'CIS', 2022, TRUE),
  ('22CIS0299', 'Isuri',     'Keshani',     'keshani@student.susl.lk',     'CIS', 2022, TRUE),
  ('22CIS0301', 'Malith',    'Gunawardena', 'malith@student.susl.lk',      'CIS', 2022, TRUE),
  ('22CIS0315', 'Sachini',   'Perera',      'sachini@student.susl.lk',     'CIS', 2022, TRUE),
  ('22CIS0320', 'Dineth',    'Rathnayake',  'dineth@student.susl.lk',      'CIS', 2022, TRUE),
  ('22CIS0334', 'Pavithra',  'Jayasekara',  'pavithra@student.susl.lk',    'CIS', 2022, TRUE),
  ('22CIS0341', 'Lahiru',    'Madushanka',  'lahiru@student.susl.lk',      'CIS', 2022, TRUE),
  -- CIS batch 2023
  ('23CIS0101', 'Tharaka',   'Dissanayake', 'tharaka@student.susl.lk',     'CIS', 2023, TRUE),
  ('23CIS0102', 'Minuli',    'Senanayake',  'minuli@student.susl.lk',      'CIS', 2023, TRUE),
  -- SE batch 2022
  ('22SE0201',  'Kasun',     'Weerasinghe', 'kasun@student.susl.lk',       'SE',  2022, TRUE),
  ('22SE0202',  'Thilini',   'Amarasinghe', 'thilini@student.susl.lk',     'SE',  2022, TRUE),
  ('22SE0210',  'Sithum',    'Rajapaksha',  'sithum@student.susl.lk',      'SE',  2022, TRUE),
  ('22SE0215',  'Nadeesha',  'Liyanage',    'nadeesha@student.susl.lk',    'SE',  2022, TRUE),
  ('22SE0223',  'Rashmika',  'Gunasekara',  'rashmika@student.susl.lk',    'SE',  2022, TRUE),
  ('22SE0230',  'Asanka',    'Jayawardena', 'asanka@student.susl.lk',      'SE',  2022, TRUE),
  ('22SE0245',  'Dulanja',   'Alwis',       'dulanja@student.susl.lk',     'SE',  2022, TRUE),
  ('22SE0252',  'Ishara',    'Udayanga',    'ishara@student.susl.lk',      'SE',  2022, TRUE),
  -- SE batch 2023
  ('23SE0101',  'Pramudi',   'Koswatte',    'pramudi@student.susl.lk',     'SE',  2023, TRUE),
  ('23SE0102',  'Supun',     'Lakmal',      'supun@student.susl.lk',       'SE',  2023, TRUE),
  -- NET batch 2022
  ('22NET0101', 'Amith',     'Munasinghe',  'amith@student.susl.lk',       'NET', 2022, TRUE),
  ('22NET0102', 'Shanika',   'Pathirana',   'shanika@student.susl.lk',     'NET', 2022, TRUE),
  ('22NET0110', 'Dhanuka',   'Samaraweera', 'dhanuka@student.susl.lk',     'NET', 2022, TRUE),
  ('22NET0118', 'Renuka',    'Wijesinghe',  'renuka@student.susl.lk',      'NET', 2022, TRUE),
  ('22NET0125', 'Sachith',   'Priyadarshana','sachith@student.susl.lk',    'NET', 2022, TRUE),
  ('22NET0133', 'Himasha',   'Nanayakkara', 'himasha@student.susl.lk',     'NET', 2022, TRUE),
  -- DS batch 2022
  ('22DS0101',  'Sanduni',   'Karunathilaka','sanduni@student.susl.lk',    'DS',  2022, TRUE),
  ('22DS0102',  'Buddhika',  'Ranasinghe',  'buddhika@student.susl.lk',    'DS',  2022, TRUE),
  ('22DS0110',  'Vinuri',    'Wathsala',    'vinuri@student.susl.lk',      'DS',  2022, TRUE),
  ('22DS0118',  'Chanaka',   'Madushanka',  'chanaka@student.susl.lk',     'DS',  2022, TRUE),
  ('22DS0125',  'Nimasha',   'Dilrukshi',   'nimasha@student.susl.lk',     'DS',  2022, TRUE),
  ('22DS0133',  'Roshan',    'Wijesekara',  'roshan@student.susl.lk',      'DS',  2022, TRUE),
  ('22DS0140',  'Thushara',  'Samaratunga', 'thushara@student.susl.lk',    'DS',  2022, TRUE),
  ('22DS0148',  'Kavindra',  'Herath',      'kavindra@student.susl.lk',    'DS',  2022, TRUE),
  -- Special demo accounts
  ('22CIS0399', 'Demo',      'Suspended',   'suspended@student.susl.lk',   'CIS', 2022, FALSE),
  ('23DS0001',  'New',       'Student',     'newstudent@student.susl.lk',  'DS',  2023, TRUE),
  ('22CIS0350', 'Flagged',   'User',        'flagged@student.susl.lk',     'CIS', 2022, TRUE),
  ('22SE0299',  'Absent',    'Often',       'absent@student.susl.lk',      'SE',  2022, TRUE)
) AS t(index_number, first_name, last_name, email, dept, enrollment_year, active)
ON CONFLICT (email) DO NOTHING;


-- ---------------------------------------------------------------
-- 5.  DEVICE REGISTRATIONS
-- ---------------------------------------------------------------
INSERT INTO device_registrations (
    user_id, device_fingerprint, device_model, os_type,
    os_version, app_version, is_primary, is_revoked
)
SELECT
    u.user_id,
    'FP-' || UPPER(MD5(u.email)),
    CASE (u.user_id % 6)
        WHEN 0 THEN 'Samsung Galaxy S24'
        WHEN 1 THEN 'Samsung Galaxy A54'
        WHEN 2 THEN 'iPhone 15 Pro'
        WHEN 3 THEN 'iPhone 14'
        WHEN 4 THEN 'Google Pixel 8'
        ELSE       'Xiaomi 13T'
    END,
    CASE WHEN u.user_id % 3 = 0 THEN 'IOS'::os_type ELSE 'ANDROID'::os_type END,
    CASE WHEN u.user_id % 3 = 0 THEN '17.4' ELSE '14.0' END,
    '1.2.0', TRUE, FALSE
FROM users u
WHERE u.role = 'STUDENT'
  AND u.email NOT IN ('newstudent@student.susl.lk', 'suspended@student.susl.lk')
  AND NOT EXISTS (
      SELECT 1 FROM device_registrations dr WHERE dr.user_id = u.user_id
  );

-- Revoke device for the flagged student (simulates lost phone)
UPDATE device_registrations dr
SET    is_revoked    = TRUE,
       revoke_reason = 'Reported lost phone — replaced with new device'
FROM   users u
WHERE  dr.user_id = u.user_id
AND    u.email    = 'flagged@student.susl.lk';


-- ---------------------------------------------------------------
-- 6.  BIOMETRIC PROFILES
-- ---------------------------------------------------------------
INSERT INTO biometric_profiles (
    user_id, fingerprint_enrolled, faceid_enrolled,
    preferred_method, enrolled_at, last_verified_at
)
SELECT
    u.user_id,
    CASE WHEN u.user_id % 3 != 0 THEN TRUE  ELSE FALSE END,
    CASE WHEN u.user_id % 3 = 0  THEN TRUE  ELSE FALSE END,
    CASE WHEN u.user_id % 3 = 0
         THEN 'FACEID'::biometric_method
         ELSE 'FINGERPRINT'::biometric_method END,
    NOW() - ((u.user_id % 180) || ' days')::INTERVAL,
    NOW() - ((u.user_id % 7)   || ' days')::INTERVAL
FROM users u
WHERE u.role IN ('STUDENT', 'LECTURER')
  AND NOT EXISTS (
      SELECT 1 FROM biometric_profiles bp WHERE bp.user_id = u.user_id
  );


-- ---------------------------------------------------------------
-- 7.  COURSE ASSIGNMENTS  (use subqueries for all IDs)
-- ---------------------------------------------------------------
INSERT INTO course_assignments (lecturer_id, course_id, assigned_by, is_active)
SELECT
    (SELECT user_id FROM users WHERE email = lect_email),
    (SELECT course_id FROM courses WHERE course_code = ccode),
    (SELECT user_id FROM users WHERE email = 'admin@smartpresence.lk'),
    TRUE
FROM (VALUES
  ('nirubikaa@susl.lk',          'IS4110'),
  ('nirubikaa@susl.lk',          'IS3210'),
  ('kamal.perera@susl.lk',       'IS2120'),
  ('harshani@susl.lk',           'SE3110'),
  ('harshani@susl.lk',           'SE4210'),
  ('dilini.fernando@susl.lk',    'SE2210'),
  ('ruwan.jayasinghe@susl.lk',   'NT3100'),
  ('ruwan.jayasinghe@susl.lk',   'NT4100'),
  ('chamara.bandara@susl.lk',    'NT2100'),
  ('priyanka.silva@susl.lk',     'DS3100'),
  ('priyanka.silva@susl.lk',     'DS4100'),
  ('nishantha.wickrama@susl.lk', 'DS2100')
) AS t(lect_email, ccode)
ON CONFLICT (lecturer_id, course_id) DO NOTHING;


-- ---------------------------------------------------------------
-- 8.  ENROLMENTS  (use subqueries for course lookups)
-- ---------------------------------------------------------------
-- CIS students → CIS courses
INSERT INTO enrolments (student_id, course_id, status)
SELECT u.user_id, c.course_id, 'ACTIVE'::enrolment_status
FROM   users u, courses c
WHERE  u.role = 'STUDENT'
  AND  u.department_id = (SELECT department_id FROM departments WHERE department_code = 'CIS')
  AND  u.is_active = TRUE
  AND  c.course_code IN ('IS4110','IS3210','IS2120')
ON CONFLICT (student_id, course_id) DO NOTHING;

-- SE students → SE courses
INSERT INTO enrolments (student_id, course_id, status)
SELECT u.user_id, c.course_id, 'ACTIVE'::enrolment_status
FROM   users u, courses c
WHERE  u.role = 'STUDENT'
  AND  u.department_id = (SELECT department_id FROM departments WHERE department_code = 'SE')
  AND  u.is_active = TRUE
  AND  c.course_code IN ('SE3110','SE2210','SE4210')
ON CONFLICT (student_id, course_id) DO NOTHING;

-- NET students → NET courses
INSERT INTO enrolments (student_id, course_id, status)
SELECT u.user_id, c.course_id, 'ACTIVE'::enrolment_status
FROM   users u, courses c
WHERE  u.role = 'STUDENT'
  AND  u.department_id = (SELECT department_id FROM departments WHERE department_code = 'NET')
  AND  u.is_active = TRUE
  AND  c.course_code IN ('NT3100','NT2100','NT4100')
ON CONFLICT (student_id, course_id) DO NOTHING;

-- DS students → DS courses
INSERT INTO enrolments (student_id, course_id, status)
SELECT u.user_id, c.course_id, 'ACTIVE'::enrolment_status
FROM   users u, courses c
WHERE  u.role = 'STUDENT'
  AND  u.department_id = (SELECT department_id FROM departments WHERE department_code = 'DS')
  AND  u.is_active = TRUE
  AND  c.course_code IN ('DS3100','DS2100','DS4100')
ON CONFLICT (student_id, course_id) DO NOTHING;

-- Cross-department electives
INSERT INTO enrolments (student_id, course_id, status)
SELECT u.user_id, c.course_id, 'ACTIVE'::enrolment_status
FROM   users u, courses c
WHERE  u.email IN ('sandeepa@student.susl.lk','denuwan@student.susl.lk','kasun@student.susl.lk')
  AND  c.course_code = 'DS3100'
ON CONFLICT (student_id, course_id) DO NOTHING;

-- One dropped enrolment (demo)
INSERT INTO enrolments (student_id, course_id, status)
SELECT u.user_id, c.course_id, 'DROPPED'::enrolment_status
FROM   users u, courses c
WHERE  u.email = 'absent@student.susl.lk' AND c.course_code = 'SE4210'
ON CONFLICT (student_id, course_id) DO NOTHING;


-- ---------------------------------------------------------------
-- 9.  PAST SESSIONS  (~60 ended sessions, last 4 weeks)
-- ---------------------------------------------------------------
INSERT INTO sessions (
    course_id, lecturer_id, venue_id,
    ble_token, ble_token_expires_at,
    status, started_at, ended_at, scheduled_duration_minutes
)
SELECT
    c.course_id,
    ca.lecturer_id,
    v.venue_id,
    'TOKEN-PAST-' || c.course_code || '-' || TO_CHAR(day_offset.d, 'YYYYMMDD'),
    (NOW() - (day_offset.days_ago || ' days')::INTERVAL + '09:10:00'::INTERVAL),
    'ENDED'::session_status,
    (NOW() - (day_offset.days_ago || ' days')::INTERVAL + '09:00:00'::INTERVAL),
    (NOW() - (day_offset.days_ago || ' days')::INTERVAL + '10:00:00'::INTERVAL),
    60
FROM courses c
JOIN course_assignments ca ON ca.course_id  = c.course_id AND ca.is_active = TRUE
JOIN venues v ON v.venue_code = CASE
    WHEN c.department_id = (SELECT department_id FROM departments WHERE department_code = 'CIS') THEN 'LH-A'
    WHEN c.department_id = (SELECT department_id FROM departments WHERE department_code = 'SE')  THEN 'LH-B'
    WHEN c.department_id = (SELECT department_id FROM departments WHERE department_code = 'NET') THEN 'LAB-403'
    ELSE 'LH-C'
END,
(VALUES
    (2,  NOW() - '2  days'::INTERVAL),
    (5,  NOW() - '5  days'::INTERVAL),
    (7,  NOW() - '7  days'::INTERVAL),
    (9,  NOW() - '9  days'::INTERVAL),
    (12, NOW() - '12 days'::INTERVAL),
    (14, NOW() - '14 days'::INTERVAL),
    (16, NOW() - '16 days'::INTERVAL),
    (19, NOW() - '19 days'::INTERVAL),
    (21, NOW() - '21 days'::INTERVAL),
    (23, NOW() - '23 days'::INTERVAL)
) AS day_offset(days_ago, d)
WHERE c.course_code IN ('IS4110','IS3210','SE3110','SE2210','NT3100','DS3100');


-- ---------------------------------------------------------------
-- 10. ONE FORCE-ENDED SESSION
-- ---------------------------------------------------------------
INSERT INTO sessions (
    course_id, lecturer_id, venue_id,
    ble_token, ble_token_expires_at,
    status, started_at, ended_at, scheduled_duration_minutes,
    force_ended_by, force_ended_at, force_ended_reason
)
SELECT
    c.course_id, ca.lecturer_id, v.venue_id,
    'TOKEN-FORCE-ENDED-DEMO',
    NOW() - '3 days'::INTERVAL,
    'FORCE_ENDED'::session_status,
    NOW() - '3 days'::INTERVAL - '2 hours'::INTERVAL,
    NOW() - '3 days'::INTERVAL - '1 hour 30 minutes'::INTERVAL,
    60,
    adm.user_id,
    NOW() - '3 days'::INTERVAL - '1 hour 30 minutes'::INTERVAL,
    'Fire alarm evacuation — session manually closed by admin'
FROM courses c
JOIN course_assignments ca ON ca.course_id = c.course_id AND ca.is_active = TRUE
JOIN venues v  ON v.venue_code = 'LH-A'
JOIN users adm ON adm.email = 'admin@smartpresence.lk'
WHERE c.course_code = 'IS4110'
LIMIT 1;


-- ---------------------------------------------------------------
-- 11. TWO ACTIVE (LIVE) SESSIONS
-- ---------------------------------------------------------------
INSERT INTO sessions (
    course_id, lecturer_id, venue_id,
    ble_token, ble_token_expires_at,
    status, started_at, scheduled_duration_minutes
)
SELECT
    c.course_id, ca.lecturer_id, v.venue_id,
    'LIVE-TOKEN-' || c.course_code,
    NOW() + '8 minutes'::INTERVAL,
    'ACTIVE'::session_status,
    NOW() - '22 minutes'::INTERVAL,
    60
FROM courses c
JOIN course_assignments ca ON ca.course_id = c.course_id AND ca.is_active = TRUE
JOIN venues v ON v.venue_code = CASE c.course_code WHEN 'IS4110' THEN 'LH-A' ELSE 'LH-B' END
WHERE c.course_code IN ('IS4110', 'SE3110');


-- ---------------------------------------------------------------
-- 12. ATTENDANCE RECORDS
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
    (-60 - (u.user_id % 10))::SMALLINT,
    s.ble_token,
    CASE
        WHEN u.email = 'absent@student.susl.lk'
             AND s.session_id % 3 != 0   THEN 'ABSENT'::attendance_status
        WHEN (s.session_id + u.user_id) % 10 = 0
             AND u.email != 'absent@student.susl.lk' THEN 'ABSENT'::attendance_status
        WHEN (s.session_id + u.user_id) % 7  = 0  THEN 'LATE'::attendance_status
        ELSE 'PRESENT'::attendance_status
    END,
    s.started_at + ((5 + (u.user_id % 8)) || ' minutes')::INTERVAL
FROM sessions s
JOIN enrolments e  ON e.course_id  = s.course_id  AND e.status = 'ACTIVE'
JOIN users u       ON u.user_id    = e.student_id  AND u.is_active = TRUE
JOIN device_registrations dr ON dr.user_id = u.user_id AND dr.is_primary = TRUE AND dr.is_revoked = FALSE
WHERE s.status IN ('ENDED', 'FORCE_ENDED')
ON CONFLICT (session_id, student_id) DO NOTHING;

-- Partial check-ins for the two ACTIVE sessions
INSERT INTO attendance_records (
    session_id, student_id, device_id,
    ble_verified, biometric_verified, device_verified,
    rssi_value, ble_token_used, status, checked_in_at
)
SELECT
    s.session_id, u.user_id, dr.device_id,
    TRUE, TRUE, TRUE,
    (-58 - (u.user_id % 8))::SMALLINT,
    s.ble_token,
    'PRESENT'::attendance_status,
    s.started_at + ((2 + (u.user_id % 6)) || ' minutes')::INTERVAL
FROM sessions s
JOIN enrolments e  ON e.course_id  = s.course_id  AND e.status = 'ACTIVE'
JOIN users u       ON u.user_id    = e.student_id  AND u.is_active = TRUE
JOIN device_registrations dr ON dr.user_id = u.user_id AND dr.is_primary = TRUE AND dr.is_revoked = FALSE
WHERE s.status = 'ACTIVE'
  AND (u.user_id % 3) != 0
ON CONFLICT (session_id, student_id) DO NOTHING;

-- One manual override
INSERT INTO attendance_records (
    session_id, student_id, device_id,
    ble_verified, biometric_verified, device_verified,
    rssi_value, status, checked_in_at,
    is_manual_override, overridden_by, override_reason, overridden_at
)
SELECT
    s.session_id, u.user_id, dr.device_id,
    FALSE, FALSE, FALSE, NULL,
    'PRESENT'::attendance_status,
    s.started_at + '35 minutes'::INTERVAL,
    TRUE,
    lect.user_id,
    'Student phone battery died — lecturer confirmed physical presence',
    s.started_at + '36 minutes'::INTERVAL
FROM sessions s
JOIN courses c   ON c.course_id   = s.course_id AND c.course_code = 'IS3210'
JOIN users u     ON u.email       = 'malith@student.susl.lk'
JOIN device_registrations dr ON dr.user_id = u.user_id AND dr.is_primary = TRUE
JOIN users lect  ON lect.email    = 'nirubikaa@susl.lk'
WHERE s.status = 'ENDED'
ORDER BY s.session_id DESC
LIMIT 1
ON CONFLICT (session_id, student_id) DO NOTHING;


-- ---------------------------------------------------------------
-- 13. CHECKIN ATTEMPTS (failed attempts)
-- ---------------------------------------------------------------
INSERT INTO checkin_attempts (
    session_id, student_id, device_fingerprint,
    ble_verified, biometric_verified, device_verified,
    rssi_value, ble_token_presented, outcome, failure_reason, attempted_at
)
SELECT
    s.session_id, u.user_id, dr.device_fingerprint,
    FALSE, FALSE, FALSE,
    (-90 - (u.user_id % 5))::SMALLINT,
    s.ble_token,
    'FAILED_BLE'::checkin_outcome,
    'RSSI ' || (-90 - (u.user_id % 5)) || ' dBm below venue threshold of -65 dBm',
    s.started_at + '1 minute'::INTERVAL
FROM sessions s
JOIN enrolments e ON e.course_id = s.course_id AND e.status = 'ACTIVE'
JOIN users u      ON u.user_id = e.student_id
JOIN device_registrations dr ON dr.user_id = u.user_id AND dr.is_primary = TRUE
WHERE s.status = 'ENDED'
  AND u.user_id % 8 = 1
LIMIT 30;

-- Device mismatch — flagged student
INSERT INTO checkin_attempts (
    session_id, student_id, device_fingerprint,
    ble_verified, biometric_verified, device_verified,
    rssi_value, ble_token_presented, outcome, failure_reason, attempted_at
)
SELECT
    s.session_id, u.user_id,
    'UNKNOWN-DEVICE-' || s.session_id,
    TRUE, TRUE, FALSE,
    -62::SMALLINT, s.ble_token,
    'FAILED_DEVICE'::checkin_outcome,
    'Device fingerprint not registered to this account',
    s.started_at + '3 minutes'::INTERVAL
FROM sessions s
JOIN users u ON u.email = 'flagged@student.susl.lk'
WHERE s.status = 'ENDED'
LIMIT 6;

-- Biometric failures
INSERT INTO checkin_attempts (
    session_id, student_id, device_fingerprint,
    ble_verified, biometric_verified, device_verified,
    rssi_value, ble_token_presented, outcome, failure_reason, attempted_at
)
SELECT
    s.session_id, u.user_id, dr.device_fingerprint,
    TRUE, FALSE, FALSE,
    -63::SMALLINT, s.ble_token,
    'FAILED_BIOMETRIC'::checkin_outcome,
    'Biometric prompt failed — user did not authenticate',
    s.started_at + '4 minutes'::INTERVAL
FROM sessions s
JOIN enrolments e ON e.course_id = s.course_id AND e.status = 'ACTIVE'
JOIN users u      ON u.user_id = e.student_id
JOIN device_registrations dr ON dr.user_id = u.user_id AND dr.is_primary = TRUE
WHERE s.status = 'ENDED'
  AND u.user_id % 12 = 3
LIMIT 15;


-- ---------------------------------------------------------------
-- 14. SECURITY FLAGS
-- ---------------------------------------------------------------
-- Device mismatch flags for flagged student
INSERT INTO security_flags (user_id, session_id, flag_type, severity, description, resolved, flagged_at)
SELECT
    u.user_id, s.session_id,
    'DEVICE_MISMATCH'::flag_type, 'HIGH'::flag_severity,
    'Check-in attempted from unregistered device fingerprint UNKNOWN-DEVICE-' || s.session_id,
    FALSE,
    s.started_at + '3 minutes'::INTERVAL
FROM sessions s
JOIN users u ON u.email = 'flagged@student.susl.lk'
WHERE s.status = 'ENDED'
LIMIT 4;

-- One resolved flag
INSERT INTO security_flags (user_id, session_id, flag_type, severity, description, resolved, resolved_by, resolved_at, resolution_note, flagged_at)
SELECT
    u.user_id, s.session_id,
    'DEVICE_MISMATCH'::flag_type, 'HIGH'::flag_severity,
    'Attempted check-in from secondary device',
    TRUE, adm.user_id,
    NOW() - '5 days'::INTERVAL,
    'Student reported using borrowed phone. Warned and attendance manually corrected.',
    s.started_at + '3 minutes'::INTERVAL
FROM sessions s
JOIN users u   ON u.email   = 'flagged@student.susl.lk'
JOIN users adm ON adm.email = 'admin@smartpresence.lk'
WHERE s.status = 'ENDED'
ORDER BY s.session_id ASC
LIMIT 1;

-- Replay token flag
INSERT INTO security_flags (user_id, session_id, flag_type, severity, description, resolved, flagged_at)
SELECT
    u.user_id, s.session_id,
    'REPLAY_TOKEN'::flag_type, 'CRITICAL'::flag_severity,
    'Expired BLE token presented — possible token sharing or replay attack',
    FALSE,
    s.started_at + '45 minutes'::INTERVAL
FROM sessions s
JOIN users u ON u.email = 'flagged@student.susl.lk'
WHERE s.status = 'ENDED'
ORDER BY s.session_id DESC
LIMIT 1;

-- Out-of-range flags (multiple students)
INSERT INTO security_flags (user_id, session_id, flag_type, severity, description, resolved, flagged_at)
SELECT
    u.user_id, s.session_id,
    'OUT_OF_RANGE'::flag_type, 'MEDIUM'::flag_severity,
    'RSSI ' || (-90 - (u.user_id % 5)) || ' dBm below venue threshold of -65 dBm',
    (u.user_id % 2 = 0),
    s.started_at + '1 minute'::INTERVAL
FROM sessions s
JOIN enrolments e ON e.course_id = s.course_id AND e.status = 'ACTIVE'
JOIN users u      ON u.user_id = e.student_id
WHERE s.status = 'ENDED'
  AND u.user_id % 8 = 1
LIMIT 12;

-- Biometric failure flags
INSERT INTO security_flags (user_id, session_id, flag_type, severity, description, resolved, flagged_at)
SELECT
    u.user_id, s.session_id,
    'BIOMETRIC_FAILURE'::flag_type, 'MEDIUM'::flag_severity,
    '3+ biometric failures in the last 5 minutes for this session',
    TRUE,
    s.started_at + '5 minutes'::INTERVAL
FROM sessions s
JOIN enrolments e ON e.course_id = s.course_id AND e.status = 'ACTIVE'
JOIN users u      ON u.user_id = e.student_id
WHERE s.status = 'ENDED'
  AND u.user_id % 12 = 3
LIMIT 8;

-- Account sharing suspect
INSERT INTO security_flags (user_id, session_id, flag_type, severity, description, resolved, flagged_at)
SELECT
    u.user_id, s.session_id,
    'ACCOUNT_SHARING_SUSPECT'::flag_type, 'CRITICAL'::flag_severity,
    'Rapid consecutive check-ins from two different IP locations detected',
    FALSE,
    s.started_at + '8 minutes'::INTERVAL
FROM sessions s
JOIN users u ON u.email = 'absent@student.susl.lk'
WHERE s.status = 'ENDED'
ORDER BY s.session_id DESC
LIMIT 1;


-- ---------------------------------------------------------------
-- 15. NOTIFICATIONS
-- ---------------------------------------------------------------
INSERT INTO notifications (recipient_id, notification_type, title, body, related_entity_type, is_read, created_at)
SELECT
    adm.user_id,
    'SECURITY_FLAG'::notification_type,
    'Security Flag Raised — ' || sf.flag_type::TEXT,
    'Student ' || u.first_name || ' ' || u.last_name || ' triggered a ' ||
        sf.severity::TEXT || '-severity ' || sf.flag_type::TEXT || ' flag.',
    'security_flag',
    (sf.flag_id % 3 = 0),
    sf.flagged_at
FROM security_flags sf
JOIN users u   ON u.user_id   = sf.user_id
JOIN users adm ON adm.email   = 'admin@smartpresence.lk'
LIMIT 10;

INSERT INTO notifications (recipient_id, notification_type, title, body, related_entity_type, is_read, created_at)
SELECT
    adm.user_id,
    'LOW_ATTENDANCE_WARNING'::notification_type,
    'Low Attendance Alert — SE2210',
    'Agile Software Development session attendance dropped to 38%. Threshold is 50%.',
    'session', FALSE, NOW() - '1 day'::INTERVAL
FROM users adm WHERE adm.email = 'admin@smartpresence.lk';

INSERT INTO notifications (recipient_id, notification_type, title, body, related_entity_type, is_read, created_at)
SELECT
    u.user_id,
    'SESSION_STARTED'::notification_type,
    'IS4110 Session is now LIVE',
    'Your Capstone Project session in Lecture Hall A has started.',
    'session', TRUE, NOW() - '23 minutes'::INTERVAL
FROM users u WHERE u.email = 'nirubikaa@susl.lk';

INSERT INTO notifications (recipient_id, notification_type, title, body, related_entity_type, is_read, created_at)
SELECT
    u.user_id,
    'MANUAL_OVERRIDE_APPLIED'::notification_type,
    'Attendance Corrected — IS3210',
    'Your attendance for the IS3210 session has been manually marked as PRESENT.',
    'attendance_record', FALSE, NOW() - '2 days'::INTERVAL
FROM users u WHERE u.email = 'malith@student.susl.lk';

INSERT INTO notifications (recipient_id, notification_type, title, body, is_read, created_at)
SELECT
    u.user_id,
    'SYSTEM_HEALTH'::notification_type,
    'BLE Beacon Offline — LAB-403',
    'Network Lab 403 BLE beacon has not sent a heartbeat in 15 minutes.',
    FALSE, NOW() - '4 hours'::INTERVAL
FROM users u WHERE u.role = 'ADMIN';

INSERT INTO notifications (recipient_id, notification_type, title, body, is_read, created_at)
SELECT
    u.user_id,
    'ANNOUNCEMENT'::notification_type,
    'Semester Timetable Updated',
    'The academic timetable for Semester 1 2026 has been updated.',
    (u.user_id % 2 = 0), NOW() - '3 days'::INTERVAL
FROM users u WHERE u.role = 'STUDENT';


-- ---------------------------------------------------------------
-- 16. AUDIT LOGS
-- ---------------------------------------------------------------
INSERT INTO audit_logs (actor_id, action, entity_type, old_value, new_value, ip_address, performed_at)
SELECT
    adm.user_id, 'ASSIGN_LECTURER', 'course_assignment',
    '{"lecturerId": null}'::jsonb,
    ('{"courseCode": "' || c.course_code || '", "lecturerEmail": "' || l.email || '"}')::jsonb,
    '192.168.1.10',
    NOW() - '30 days'::INTERVAL
FROM users adm, course_assignments ca
JOIN users l  ON l.user_id  = ca.lecturer_id
JOIN courses c ON c.course_id = ca.course_id
WHERE adm.email = 'admin@smartpresence.lk'
LIMIT 8;

INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, old_value, new_value, ip_address, performed_at)
SELECT
    adm.user_id, 'CHANGE_SETTING', 'system_setting',
    ss.setting_id,
    '{"key": "ble_rssi_threshold_strict", "value": "-70"}'::jsonb,
    '{"key": "ble_rssi_threshold_strict", "value": "-65"}'::jsonb,
    '192.168.1.10',
    NOW() - '14 days'::INTERVAL
FROM users adm, system_settings ss
WHERE adm.email = 'admin@smartpresence.lk'
  AND ss.setting_key = 'ble_rssi_threshold_strict'
LIMIT 1;

INSERT INTO audit_logs (actor_id, action, entity_type, old_value, new_value, ip_address, performed_at)
SELECT
    l.user_id, 'MANUAL_ATTENDANCE_OVERRIDE', 'attendance_record',
    '{"status": "ABSENT"}'::jsonb,
    '{"status": "PRESENT", "reason": "Student phone battery died"}'::jsonb,
    '10.0.0.45', NOW() - '2 days'::INTERVAL
FROM users l WHERE l.email = 'nirubikaa@susl.lk';

INSERT INTO audit_logs (actor_id, action, entity_type, new_value, ip_address, performed_at)
SELECT adm.user_id, 'EXPORT_REPORT', 'report',
    '{"type": "COURSE_ATTENDANCE", "format": "CSV"}'::jsonb,
    '192.168.1.10', NOW() - '7 days'::INTERVAL
FROM users adm WHERE adm.email = 'admin@smartpresence.lk';

INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, old_value, new_value, ip_address, performed_at)
SELECT
    adm.user_id, 'SUSPEND_USER', 'user', u.user_id,
    '{"isActive": true}'::jsonb, '{"isActive": false}'::jsonb,
    '192.168.1.10', NOW() - '10 days'::INTERVAL
FROM users adm, users u
WHERE adm.email = 'admin@smartpresence.lk'
  AND u.email   = 'suspended@student.susl.lk';

INSERT INTO audit_logs (actor_id, action, entity_type, new_value, ip_address, performed_at)
SELECT adm.user_id, 'BULK_IMPORT_USERS', 'user',
    '{"importedCount": 40, "source": "semester_intake_2026.csv"}'::jsonb,
    '192.168.1.10', NOW() - '45 days'::INTERVAL
FROM users adm WHERE adm.email = 'admin@smartpresence.lk';


-- ---------------------------------------------------------------
-- 17. REPORT LOGS
-- ---------------------------------------------------------------
INSERT INTO report_logs (generated_by, report_type, date_range_start, date_range_end, filters_json, export_format, file_size_kb, generated_at)
SELECT
    adm.user_id, rtype.t,
    '2026-03-01'::DATE, '2026-04-01'::DATE,
    rtype.f::jsonb, rtype.fmt, rtype.kb,
    NOW() - (rtype.days_ago || ' days')::INTERVAL
FROM users adm,
(VALUES
    ('COURSE_ATTENDANCE'::report_type,  '{"courseCode":"IS4110"}', 'CSV'::export_format, 45,  7),
    ('STUDENT_SUMMARY'::report_type,    '{"courseCode":"IS3210"}', 'PDF'::export_format, 210, 5),
    ('SECURITY_ANOMALIES'::report_type, '{}',                      'PDF'::export_format, 88,  3),
    ('COURSE_ATTENDANCE'::report_type,  '{"courseCode":"SE3110"}', 'CSV'::export_format, 38,  1),
    ('DEPARTMENT_OVERVIEW'::report_type,'{"dept":"CIS"}',          'PDF'::export_format, 320, 0)
) AS rtype(t, f, fmt, kb, days_ago)
WHERE adm.email = 'admin@smartpresence.lk';


-- ---------------------------------------------------------------
-- 18. SUMMARY
-- ---------------------------------------------------------------
DO $$
DECLARE
    v_users INT; v_sessions INT; v_attendance INT;
    v_flags INT; v_attempts INT; v_notifs INT; v_audit INT;
BEGIN
    SELECT COUNT(*) INTO v_users       FROM users;
    SELECT COUNT(*) INTO v_sessions    FROM sessions;
    SELECT COUNT(*) INTO v_attendance  FROM attendance_records;
    SELECT COUNT(*) INTO v_flags       FROM security_flags;
    SELECT COUNT(*) INTO v_attempts    FROM checkin_attempts;
    SELECT COUNT(*) INTO v_notifs      FROM notifications;
    SELECT COUNT(*) INTO v_audit       FROM audit_logs;
    RAISE NOTICE '=== V3 Sandbox Complete: users=%, sessions=%, attendance=%, flags=%, attempts=%, notifs=%, audit=%',
        v_users, v_sessions, v_attendance, v_flags, v_attempts, v_notifs, v_audit;
END $$;
