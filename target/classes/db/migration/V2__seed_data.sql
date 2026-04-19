-- =============================================================
--  SmartPresence — Flyway Migration V2
--  Seed data for development and testing
-- =============================================================

-- ── Departments ────────────────────────────────────────────────
INSERT INTO departments (department_code, department_name, faculty) VALUES
('CIS',  'Computing and Information Systems', 'Faculty of Computing'),
('SE',   'Software Engineering',              'Faculty of Computing'),
('NET',  'Networking and Security',           'Faculty of Computing');

-- ── Courses ───────────────────────────────────────────────────
INSERT INTO courses (course_code, course_name, department_id, credit_hours, level, semester, academic_year) VALUES
('IS4110', 'Capstone Project',              1, 6, 4, 1, 2026),
('IS3210', 'Database Systems',              1, 3, 3, 1, 2026),
('SE3110', 'Software Architecture',         2, 3, 3, 1, 2026),
('IS2120', 'Data Structures & Algorithms',  1, 3, 2, 2, 2026);

-- ── Venues ────────────────────────────────────────────────────
INSERT INTO venues (venue_code, venue_name, building, floor, capacity, beacon_mac, rssi_threshold) VALUES
('LH-A',    'Lecture Hall A',    'Main Block', 1, 120, 'AA:BB:CC:DD:EE:01', -65),
('LH-B',    'Lecture Hall B',    'Main Block', 1, 100, 'AA:BB:CC:DD:EE:02', -65),
('LAB-401', 'Computer Lab 401',  'IT Block',   4,  40, 'AA:BB:CC:DD:EE:03', -60),
('LAB-402', 'Computer Lab 402',  'IT Block',   4,  40, 'AA:BB:CC:DD:EE:04', -60),
('ROOM-201','Seminar Room 201',  'Main Block', 2,  30, 'AA:BB:CC:DD:EE:05', -68);

-- ── Admin user (password: Admin@12345) ────────────────────────
INSERT INTO users (first_name, last_name, email, password_hash, role, department_id, is_active) VALUES
('System', 'Admin',
 'admin@smartpresence.lk',
 '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgDzMa.7Xmq8t.l7D9rZ6.',
 'ADMIN', 1, TRUE);

-- ── Lecturers (password: Lecturer@123) ────────────────────────
INSERT INTO users (first_name, last_name, email, password_hash, role, department_id, is_active) VALUES
('Nirubikaa',   'R.',      'nirubikaa@susl.lk',  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgDzMa.7Xmq8t.l7D9rZ6.', 'LECTURER', 1, TRUE),
('Harshani',    'Vitharana','harshani@susl.lk',   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgDzMa.7Xmq8t.l7D9rZ6.', 'LECTURER', 2, TRUE);

-- ── Students (password: Student@123) ──────────────────────────
INSERT INTO users (index_number, first_name, last_name, email, password_hash, role, department_id, enrollment_year, is_active) VALUES
('22CIS0272', 'Chamindu',  'Sandeepa',  'sandeepa@student.susl.lk', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgDzMa.7Xmq8t.l7D9rZ6.', 'STUDENT', 1, 2022, TRUE),
('22CIS0273', 'Pasan',     'Denuwan',   'denuwan@student.susl.lk',  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgDzMa.7Xmq8t.l7D9rZ6.', 'STUDENT', 1, 2022, TRUE),
('22CIS0276', 'Chamika',   'Nilaweera', 'nilaweera@student.susl.lk','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgDzMa.7Xmq8t.l7D9rZ6.', 'STUDENT', 1, 2022, TRUE),
('22CIS0279', 'Jeewan',    'Ekanayaka', 'ekanayaka@student.susl.lk','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgDzMa.7Xmq8t.l7D9rZ6.', 'STUDENT', 1, 2022, TRUE),
('22CIS0299', 'Isuri',     'Keshani',   'keshani@student.susl.lk',  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgDzMa.7Xmq8t.l7D9rZ6.', 'STUDENT', 1, 2022, TRUE);

-- ── Biometric profiles for all students ───────────────────────
INSERT INTO biometric_profiles (user_id, fingerprint_enrolled, faceid_enrolled, preferred_method)
SELECT user_id, FALSE, FALSE, 'NONE'
FROM   users
WHERE  role = 'STUDENT';

-- ── Lecturer assignments ───────────────────────────────────────
INSERT INTO course_assignments (lecturer_id, course_id, assigned_by, is_active)
SELECT l.user_id, c.course_id, a.user_id, TRUE
FROM   users l, courses c, users a
WHERE  l.email = 'nirubikaa@susl.lk'
AND    c.course_code IN ('IS4110', 'IS3210')
AND    a.role = 'ADMIN'
LIMIT  2;

INSERT INTO course_assignments (lecturer_id, course_id, assigned_by, is_active)
SELECT l.user_id, c.course_id, a.user_id, TRUE
FROM   users l, courses c, users a
WHERE  l.email = 'harshani@susl.lk'
AND    c.course_code = 'SE3110'
AND    a.role = 'ADMIN'
LIMIT  1;

-- ── Enrol all 5 students in IS4110 ────────────────────────────
INSERT INTO enrolments (student_id, course_id, status)
SELECT u.user_id, c.course_id, 'ACTIVE'
FROM   users u, courses c
WHERE  u.role = 'STUDENT'
AND    c.course_code = 'IS4110';

-- Also enrol in IS3210
INSERT INTO enrolments (student_id, course_id, status)
SELECT u.user_id, c.course_id, 'ACTIVE'
FROM   users u, courses c
WHERE  u.role = 'STUDENT'
AND    c.course_code = 'IS3210';
