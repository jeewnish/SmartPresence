package com.smartpresence.backend.course;

import com.smartpresence.backend.course.dto.CourseResponse;
import com.smartpresence.backend.exception.ResourceNotFoundException;
import com.smartpresence.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LecturerCourseService {
    private final LecturerCourseRepository lecturerCourseRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public CourseResponse assign(Long courseId, User lecturer) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResourceNotFoundException("Course", courseId));
        if (lecturerCourseRepository.existsByLecturerIdAndCourseId(lecturer.getId(), courseId)) {
            throw new IllegalArgumentException("Subject is already assigned to this lecturer");
        }
        lecturerCourseRepository.save(LecturerCourse.builder()
            .lecturer(lecturer)
            .course(course)
            .build());
        return CourseResponse.from(course);
    }

    @Transactional
    public void remove(Long courseId, User lecturer) {
        LecturerCourse assignment = lecturerCourseRepository
            .findByLecturerIdAndCourseId(lecturer.getId(), courseId)
            .orElseThrow(() -> new ResourceNotFoundException("Lecturer course assignment", courseId));
        lecturerCourseRepository.delete(assignment);
    }
}
