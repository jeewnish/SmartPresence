package com.smartpresence.service;

import com.smartpresence.dto.request.RegisterRequest;
import com.smartpresence.entity.AuditLog;
import com.smartpresence.entity.User;
import com.smartpresence.entity.UserRole;
import com.smartpresence.repository.AuditLogRepository;
import com.smartpresence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository        userRepository;
    private final AuditLogRepository    auditLogRepository;
    private final KeycloakAdminService  keycloakAdminService;

    @Transactional(readOnly = true)
    public Page<User> searchUsers(UserRole role, Integer departmentId,
                                   Short enrollmentYear, Boolean isActive,
                                   String search, Pageable pageable) {
        return userRepository.searchUsers(role, departmentId, enrollmentYear,
                isActive, search, pageable);
    }

    @Transactional(readOnly = true)
    public User getUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }

    public User updateUser(Integer userId, String firstName, String lastName,
                            Boolean isActive, Integer actorId) {
        User user  = getUserById(userId);
        User actor = getUserById(actorId);

        Map<String, Object> oldVal = Map.of(
                "firstName", user.getFirstName(),
                "lastName",  user.getLastName(),
                "isActive",  user.getIsActive());

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setIsActive(isActive);
        User saved = userRepository.save(user);

        auditLogRepository.save(AuditLog.builder()
                .actor(actor).action("UPDATE_USER").entityType("user").entityId(userId)
                .oldValue(oldVal)
                .newValue(Map.of("firstName", firstName, "lastName", lastName, "isActive", isActive))
                .build());
        return saved;
    }

    /** Suspend / unsuspend — disables in Keycloak + marks local row inactive. */
    public User setAccountStatus(Integer userId, boolean active, Integer actorId) {
        User user  = getUserById(userId);
        User actor = getUserById(actorId);
        boolean old = Boolean.TRUE.equals(user.getIsActive());

        if (!active) {
            // Also disable in Keycloak
            keycloakAdminService.suspendUser(userId, actorId);
        }

        user.setIsActive(active);
        User saved = userRepository.save(user);

        auditLogRepository.save(AuditLog.builder()
                .actor(actor)
                .action(active ? "ACTIVATE_USER" : "SUSPEND_USER")
                .entityType("user").entityId(userId)
                .oldValue(Map.of("isActive", old))
                .newValue(Map.of("isActive", active))
                .build());
        return saved;
    }

    /**
     * Bulk CSV import — each row is registered in Keycloak (which sends
     * a "Set Password" email) and a local profile row is created.
     * Keycloak owns authentication; we own profile data.
     */
    @Transactional
    public int bulkImport(List<RegisterRequest> requests, Integer actorId) {
        User actor = getUserById(actorId);
        int count  = 0;

        for (RegisterRequest req : requests) {
            if (!userRepository.existsByEmail(req.getEmail())) {
                try {
                    keycloakAdminService.registerUser(req);
                    count++;
                } catch (Exception e) {
                    // Log and continue — don't abort the whole import for one failure.
                    // BUG FIX: exception was silently swallowed — now properly logged.
                    log.warn("Bulk import: failed to register user {}: {}",
                            req.getEmail(), e.getMessage());
                }
            }
        }

        auditLogRepository.save(AuditLog.builder()
                .actor(actor).action("BULK_IMPORT_USERS").entityType("user")
                .newValue(Map.of("importedCount", count))
                .build());
        return count;
    }
}
