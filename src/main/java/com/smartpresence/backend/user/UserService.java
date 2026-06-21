package com.smartpresence.backend.user;

import com.smartpresence.backend.exception.ResourceNotFoundException;
import com.smartpresence.backend.user.dto.OnboardRequest;
import com.smartpresence.backend.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Idempotent onboarding:
     * 1. Return the row already linked to this Clerk user.
     * 2. Otherwise, claim a pre-provisioned/seeded row with the same verified email.
     * 3. Otherwise, create a new user for a first-time signup.
     *
     * Matching seeded users by email preserves their existing enrollments, attendance,
     * courses, and role while replacing the placeholder clerk_user_id with the real
     * Clerk JWT subject.
     */
    @Transactional
    public UserResponse onboard(OnboardRequest request, String clerkUserId) {
        return userRepository.findByClerkUserId(clerkUserId)
            .map(UserResponse::from)
            .orElseGet(() -> {
                var existingByEmail = userRepository.findByEmailIgnoreCase(request.email());
                if (existingByEmail.isPresent()) {
                    User user = existingByEmail.get();
                    user.setClerkUserId(clerkUserId);
                    applyUniversityIdentity(user, request);
                    return UserResponse.from(userRepository.save(user));
                }

                UserRole role = request.role() != null ? request.role() : UserRole.ROLE_STUDENT;
                String universityId = normalizeUniversityId(request.universityId());
                AcademicDepartment department = role == UserRole.ROLE_STUDENT
                    ? AcademicDepartment.fromUniversityId(universityId)
                    : null;
                if (role == UserRole.ROLE_STUDENT && department == null) {
                    throw new IllegalArgumentException("universityId is required for student accounts");
                }
                User user = User.builder()
                    .clerkUserId(clerkUserId)
                    .email(request.email())
                    .firstName(request.firstName())
                    .lastName(request.lastName())
                    .universityId(universityId)
                    .department(department)
                    .role(role)
                    .build();
                return UserResponse.from(userRepository.save(user));
            });
    }

    private void applyUniversityIdentity(User user, OnboardRequest request) {
        if (request.universityId() == null || request.universityId().isBlank()) {
            return;
        }

        String universityId = normalizeUniversityId(request.universityId());
        user.setUniversityId(universityId);
        user.setDepartment(user.getRole() == UserRole.ROLE_STUDENT
            ? AcademicDepartment.fromUniversityId(universityId)
            : null);
    }

    private String normalizeUniversityId(String universityId) {
        return universityId == null || universityId.isBlank()
            ? null
            : universityId.trim().toLowerCase(Locale.ROOT);
    }

    @Transactional(readOnly = true)
    public UserResponse getByClerkUserId(String clerkUserId) {
        return userRepository.findByClerkUserId(clerkUserId)
            .map(UserResponse::from)
            .orElseThrow(() -> new ResourceNotFoundException("User not found. Please call /users/onboard first."));
    }

    /** Internal helper used by services that need the entity, not the DTO. */
    @Transactional(readOnly = true)
    public User requireByClerkUserId(String clerkUserId) {
        return userRepository.findByClerkUserId(clerkUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found. Please call /users/onboard first."));
    }

    /** Convenience: extract clerk_user_id from a Spring Security JWT principal. */
    public String clerkUserId(Jwt jwt) {
        return jwt.getSubject();
    }
}
