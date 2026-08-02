package com.smartpresence.backend.user;

import com.smartpresence.backend.exception.ResourceNotFoundException;
import com.smartpresence.backend.user.dto.OnboardRequest;
import com.smartpresence.backend.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StudentIdParser studentIdParser;

    /**
     * Idempotent onboarding:
     * 1. Refresh and return the row already linked to this Clerk user.
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
            .map(user -> {
                applyUniversityIdentity(user, request);
                return UserResponse.from(userRepository.save(user));
            })
            .orElseGet(() -> {
                var existingByEmail = userRepository.findByEmailIgnoreCase(request.email());
                if (existingByEmail.isPresent()) {
                    User user = existingByEmail.get();
                    user.setClerkUserId(clerkUserId);
                    applyUniversityIdentity(user, request);
                    return UserResponse.from(userRepository.save(user));
                }

                User user = User.builder()
                    .clerkUserId(clerkUserId)
                    .email(request.email())
                    .firstName(request.firstName())
                    .lastName(request.lastName())
                    // Roles are provisioned server-side. Never allow public onboarding
                    // to elevate a newly created account to lecturer or admin.
                    .role(UserRole.ROLE_STUDENT)
                    .build();
                applyUniversityIdentity(user, request);
                return UserResponse.from(userRepository.save(user));
            });
    }

    private void applyUniversityIdentity(User user, OnboardRequest request) {
        if (user.getRole() != UserRole.ROLE_STUDENT) {
            return;
        }

        var parsed = studentIdParser.parse(request.universityId());
        user.setUniversityId(parsed.normalizedId());
        user.setDepartment(parsed.department());
        user.setAdmissionYear(parsed.admissionYear());
        user.setStudentNumber(parsed.studentNumber());
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
