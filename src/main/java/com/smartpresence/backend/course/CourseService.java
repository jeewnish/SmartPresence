package com.smartpresence.backend.course;

import com.smartpresence.backend.course.dto.CourseResponse;
import com.smartpresence.backend.course.dto.CreateCourseRequest;
import com.smartpresence.backend.user.User;
import com.smartpresence.backend.user.AcademicDepartment;
import com.smartpresence.backend.user.UserRole;
import com.smartpresence.backend.config.AcademicProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final LecturerCourseRepository lecturerCourseRepository;
    private final AcademicProperties academicProperties;

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
            .department(AcademicDepartment.fromCourseCode(request.courseCode()))
            .build();
        return CourseResponse.from(courseRepository.save(course));
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findBySemesterOrderByDepartmentAscCourseCodeAsc(academicProperties.getActiveSemester())
            .stream().map(CourseResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getCoursesFor(User user) {
        if (user.getRole() != UserRole.ROLE_STUDENT) {
            return getAllCourses();
        }
        if (user.getDepartment() == null) {
            throw new IllegalArgumentException("Student account has no department. Set a valid universityId during onboarding.");
        }
        return courseRepository.findByDepartmentAndSemesterOrderByCourseCodeAsc(
                user.getDepartment(), academicProperties.getActiveSemester())
            .stream().map(CourseResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long id) {
        return courseRepository.findById(id)
            .map(CourseResponse::from)
            .orElseThrow(() -> new com.smartpresence.backend.exception.ResourceNotFoundException("Course", id));
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getMyCourses(User lecturer) {
        return lecturerCourseRepository.findByLecturerOrderByCourseSemesterAscCourseCourseCodeAsc(lecturer)
            .stream().map(LecturerCourse::getCourse).map(CourseResponse::from).toList();
    }
}
