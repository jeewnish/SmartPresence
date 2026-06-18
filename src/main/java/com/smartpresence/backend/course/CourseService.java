package com.smartpresence.backend.course;

import com.smartpresence.backend.course.dto.CourseResponse;
import com.smartpresence.backend.course.dto.CreateCourseRequest;
import com.smartpresence.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    @Transactional
    public CourseResponse createCourse(CreateCourseRequest request, User lecturer) {
        if (courseRepository.existsByCourseCode(request.courseCode())) {
            throw new IllegalArgumentException("Course code already exists: " + request.courseCode());
        }
        Course course = Course.builder()
            .courseCode(request.courseCode())
            .courseName(request.courseName())
            .lecturer(lecturer)
            .semester(request.semester())
            .build();
        return CourseResponse.from(courseRepository.save(course));
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream().map(CourseResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long id) {
        return courseRepository.findById(id)
            .map(CourseResponse::from)
            .orElseThrow(() -> new com.smartpresence.backend.exception.ResourceNotFoundException("Course", id));
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getMyCourses(User lecturer) {
        return courseRepository.findByLecturer(lecturer).stream().map(CourseResponse::from).toList();
    }
}
