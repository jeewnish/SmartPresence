-- Store lecturer-facing timetable details on the course catalog.
ALTER TABLE courses
    ADD COLUMN lecture_time TIME,
    ADD COLUMN venue VARCHAR(100),
    ADD COLUMN class_size INTEGER,
    ADD CONSTRAINT chk_courses_class_size_positive
        CHECK (class_size IS NULL OR class_size > 0);

UPDATE courses
SET lecture_time = TIME '22:00:00',
    venue = 'Hall B',
    class_size = 34
WHERE course_code = 'IS2101';
