-- ============================================================
-- V2__seed_data.sql
-- SmartPresence - Seed Data from FOC Student Handbook 2022-2023
-- Based on accounts from accounts.md (5 accounts only)
-- ============================================================

-- ============================================================
-- Username Decoding (FOC Sabaragamuwa University of Sri Lanka)
--
--   Format: YY<programme><index>
--   YY        = intake year
--   fis       = Faculty of Computing → Computing & Information Systems (IS prefix)
--   fse       = Faculty of Computing → Software Engineering (SE prefix)
--   foc       = Faculty of Computing → Lecturer / Staff
--
--   25fis0536 → 2025 intake, IS programme → Year 1 (Sem 1–2)
--   23fis0444 → 2023 intake, IS programme → Year 3 (Sem 5–6)
--   21fse0322 → 2021 intake, SE programme → Year 4 (Sem 7–8)
--   22foc0029 → 2022 staff number,          Lecturer
-- ============================================================

-- ============================================================
-- TABLE: users
-- clerk_user_id set to username as a placeholder (replace with
-- real Clerk IDs once accounts are provisioned in Clerk).
-- ============================================================

INSERT INTO users (clerk_user_id, email, first_name, last_name, role) VALUES

-- Lecturer
('22foc0029', 'loopnox99@gmail.com',       'Sharon',  'Danapala', 'ROLE_LECTURER'),

-- Students
('25fis0536', 'loopdepoo@gmail.com',       'Kamal',   'Perera',   'ROLE_STUDENT'),
('23fis0444', 'jeewekanayaka99@gmail.com', 'Vikrama', 'Singha',   'ROLE_STUDENT'),
('21fse0322', 'jeewekan098@gmail.com',     'Isuri',   'Hewage',   'ROLE_STUDENT');


-- ============================================================
-- TABLE: courses
-- Sourced from the FOC Student Handbook 2022-2023.
-- Only courses relevant to the three students' current
-- semester blocks are included. The lecturer (Sharon Danapala)
-- is set as lecturer_id = 1 for all demo courses.
--
-- Semester determination (as of academic year 2025/2026):
--   25fis0536 → Year 1 → IS Semester 1 & 2  (IS1xxx / IS2xxx)
--   23fis0444 → Year 3 → IS Semester 5 & 6  (IS5xxx / IS6xxx)
--   21fse0322 → Year 4 → SE Semester 7 & 8  (SE8xxx)
-- ============================================================

INSERT INTO courses (course_code, course_name, lecturer_id, semester) VALUES

-- ── IS Programme · Semester 1 (for 25fis0536) ─────────────────────────────
('IS1101', 'Fundamentals of Information Systems',          1, 'Semester 1'),
('IS1102', 'Structured Programming Techniques',            1, 'Semester 1'),
('IS1103', 'Structured Programming Practicum',             1, 'Semester 1'),
('IS1104', 'Theories of Information Systems',              1, 'Semester 1'),
('IS1105', 'Computer System Organization',                 1, 'Semester 1'),
('IS1106', 'Foundations of Web Technologies',             1, 'Semester 1'),
('IS1107', 'Personal Productivity with Information Technology', 1, 'Semester 1'),
('IS1108', 'Fundamentals of Mathematics',                  1, 'Semester 1'),
('IS1109', 'Statistics & Probability Theory',              1, 'Semester 1'),
('IS1110', 'Communication Skills I',                       1, 'Semester 1'),
('IS1111', 'Academic Integrity',                           1, 'Semester 1'),
('IS-EGP-1101', 'General English I',                       1, 'Semester 1'),

-- ── IS Programme · Semester 2 (for 25fis0536) ─────────────────────────────
('IS2101', 'Object Oriented Programming',                  1, 'Semester 2'),
('IS2102', 'Object Oriented Programming Practicum',        1, 'Semester 2'),
('IS2103', 'Emerging IS Technologies',                     1, 'Semester 2'),
('IS2104', 'Database Systems',                             1, 'Semester 2'),
('IS2105', 'Database Management Systems Practicum',        1, 'Semester 2'),
('IS2106', 'System Analysis & Design',                     1, 'Semester 2'),
('IS2107', 'Social & Professional Issues',                 1, 'Semester 2'),
('IS2108', 'Human Computer Interaction',                   1, 'Semester 2'),
('IS2109', 'Information Assurance & Security',             1, 'Semester 2'),
('IS2110', 'Software Project Initiation & Planning',       1, 'Semester 2'),
('IS2111', 'Advanced Mathematics',                         1, 'Semester 2'),
('IS2112', 'Communication Skills II',                      1, 'Semester 2'),
('IS-EGP-1201', 'General English II',                      1, 'Semester 2'),

-- ── IS Programme · Semester 5 (for 23fis0444) ─────────────────────────────
('IS5101', 'Entrepreneurship & Innovation',                1, 'Semester 5'),
('IS5102', 'Enterprise Architecture',                      1, 'Semester 5'),
('IS5103', 'High Performance Computing',                   1, 'Semester 5'),
('IS5104', 'Software Process Management',                  1, 'Semester 5'),
('IS5105', 'Business Process Management',                  1, 'Semester 5'),
('IS5106', 'UI/UX Practicum',                              1, 'Semester 5'),
('IS5107', 'Project Management Practicum',                 1, 'Semester 5'),
('IS5108', 'Business Intelligence',                        1, 'Semester 5'),
('IS5109', 'IS Project for Community',                     1, 'Semester 5'),
('IS-EBP-3101', 'Business English',                        1, 'Semester 5'),
-- Electives (Semester 5)
('IS5110', 'Advanced Database Systems',                    1, 'Semester 5'),
('IS5111', 'Data Communication & Networks',                1, 'Semester 5'),
('IS5112', 'Design Patterns & Anti-patterns',              1, 'Semester 5'),
('IS5113', 'Software Quality Assurance',                   1, 'Semester 5'),
('IS5114', 'Data Mining & Analytics',                      1, 'Semester 5'),

-- ── IS Programme · Semester 6 (for 23fis0444) ─────────────────────────────
('IS6101', 'Industrial Training',                          1, 'Semester 6'),

-- ── SE Programme · Semester 7 (for 21fse0322) ─────────────────────────────
('SE7101', 'Industrial Training',                          1, 'Semester 7'),

-- ── SE Programme · Semester 8 (for 21fse0322) ─────────────────────────────
('SE8101', 'Research Project',                             1, 'Semester 8'),
('SE8102', 'Research Methods',                             1, 'Semester 8'),
('SE8103', 'Service Oriented Architecture',                1, 'Semester 8'),
('SE8104', 'Problem Analysis and Reporting',               1, 'Semester 8'),
('SE8105', 'Machine Learning',                             1, 'Semester 8'),
('SE8106', 'Mobile Computing',                             1, 'Semester 8'),
('SE8107', 'Refactoring',                                  1, 'Semester 8'),
-- Electives (Semester 8)
('SE8108', 'Game Designing and Development',               1, 'Semester 8'),
('SE8109', 'Data Mining',                                  1, 'Semester 8'),
('SE8110', 'Big Data Analytics',                           1, 'Semester 8'),
('SE8111', 'Artificial Intelligence',                      1, 'Semester 8');


-- ============================================================
-- TABLE: enrollments
-- Each student is enrolled in all compulsory courses for their
-- current semester block.
--
-- user IDs (assigned by BIGSERIAL in order of INSERT above):
--   id=1  → Sharon Danapala  (ROLE_LECTURER)
--   id=2  → Kamal Perera     (25fis0536, IS Year 1)
--   id=3  → Vikrama Singha   (23fis0444, IS Year 3)
--   id=4  → Isuri Hewage     (21fse0322, SE Year 4)
--
-- course IDs (assigned by BIGSERIAL in order of INSERT above):
--   IS Sem 1:  ids  1–12   (IS1101–IS-EGP-1101)
--   IS Sem 2:  ids 13–25   (IS2101–IS-EGP-1201)
--   IS Sem 5:  ids 26–40   (IS5101–IS5114)
--   IS Sem 6:  id  41      (IS6101)
--   SE Sem 7:  id  42      (SE7101)
--   SE Sem 8:  ids 43–53   (SE8101–SE8111)
-- ============================================================

INSERT INTO enrollments (student_id, course_id) VALUES

-- ── Kamal Perera (id=2) · IS Semester 1 ───────────────────────────────────
(2,  1),   -- IS1101 Fundamentals of Information Systems
(2,  2),   -- IS1102 Structured Programming Techniques
(2,  3),   -- IS1103 Structured Programming Practicum
(2,  4),   -- IS1104 Theories of Information Systems
(2,  5),   -- IS1105 Computer System Organization
(2,  6),   -- IS1106 Foundations of Web Technologies
(2,  7),   -- IS1107 Personal Productivity with IT
(2,  8),   -- IS1108 Fundamentals of Mathematics
(2,  9),   -- IS1109 Statistics & Probability Theory
(2, 10),   -- IS1110 Communication Skills I
(2, 11),   -- IS1111 Academic Integrity
(2, 12),   -- IS-EGP-1101 General English I

-- ── Kamal Perera (id=2) · IS Semester 2 ───────────────────────────────────
(2, 13),   -- IS2101 Object Oriented Programming
(2, 14),   -- IS2102 OOP Practicum
(2, 15),   -- IS2103 Emerging IS Technologies
(2, 16),   -- IS2104 Database Systems
(2, 17),   -- IS2105 DBMS Practicum
(2, 18),   -- IS2106 System Analysis & Design
(2, 19),   -- IS2107 Social & Professional Issues
(2, 20),   -- IS2108 Human Computer Interaction
(2, 21),   -- IS2109 Information Assurance & Security
(2, 22),   -- IS2110 Software Project Initiation & Planning
(2, 23),   -- IS2111 Advanced Mathematics
(2, 24),   -- IS2112 Communication Skills II
(2, 25),   -- IS-EGP-1201 General English II

-- ── Vikrama Singha (id=3) · IS Semester 5 (compulsory + sample electives) ─
(3, 26),   -- IS5101 Entrepreneurship & Innovation
(3, 27),   -- IS5102 Enterprise Architecture
(3, 28),   -- IS5103 High Performance Computing
(3, 29),   -- IS5104 Software Process Management
(3, 30),   -- IS5105 Business Process Management
(3, 31),   -- IS5106 UI/UX Practicum
(3, 32),   -- IS5107 Project Management Practicum
(3, 33),   -- IS5108 Business Intelligence
(3, 34),   -- IS5109 IS Project for Community
(3, 35),   -- IS-EBP-3101 Business English
-- Electives: must select ≥6 credits; selecting IS5110 (2cr) + IS5111 (2cr) + IS5112 (2cr)
(3, 36),   -- IS5110 Advanced Database Systems
(3, 37),   -- IS5111 Data Communication & Networks
(3, 38),   -- IS5112 Design Patterns & Anti-patterns

-- ── Vikrama Singha (id=3) · IS Semester 6 ─────────────────────────────────
(3, 41),   -- IS6101 Industrial Training

-- ── Isuri Hewage (id=4) · SE Semester 7 ───────────────────────────────────
(4, 42),   -- SE7101 Industrial Training

-- ── Isuri Hewage (id=4) · SE Semester 8 (compulsory + sample electives) ───
(4, 43),   -- SE8101 Research Project
(4, 44),   -- SE8102 Research Methods
(4, 45),   -- SE8103 Service Oriented Architecture
(4, 46),   -- SE8104 Problem Analysis and Reporting
(4, 47),   -- SE8105 Machine Learning
(4, 48),   -- SE8106 Mobile Computing
(4, 49),   -- SE8107 Refactoring
-- Electives: must select ≥4 credits; selecting SE8109 (2cr) + SE8110 (2cr)
(4, 50),   -- SE8108 Game Designing and Development
(4, 51);   -- SE8109 Data Mining
