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

    /**
     * Idempotent onboarding: creates a new user row or returns the existing one.
     * The clerkUserId comes from the JWT "sub" claim; everything else from the request body.
     */
    @Transactional
    public UserResponse onboard(OnboardRequest request, String clerkUserId) {
        return userRepository.findByClerkUserId(clerkUserId)
            .map(UserResponse::from)
            .orElseGet(() -> {
                UserRole role = request.role() != null ? request.role() : UserRole.ROLE_STUDENT;
                User user = User.builder()
                    .clerkUserId(clerkUserId)
                    .email(request.email())
                    .firstName(request.firstName())
                    .lastName(request.lastName())
                    .role(role)
                    .build();
                return UserResponse.from(userRepository.save(user));
            });
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
