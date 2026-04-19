package com.smartpresence.repository;

import com.smartpresence.entity.User;
import com.smartpresence.entity.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    boolean existsByIndexNumber(String indexNumber);

    Page<User> findByRole(UserRole role, Pageable pageable);

    Page<User> findByRoleAndIsActive(UserRole role, Boolean isActive, Pageable pageable);

    @Query("""
        SELECT u FROM User u
        WHERE u.role = :role
          AND (:departmentId IS NULL OR u.department.departmentId = :departmentId)
          AND (:enrollmentYear IS NULL OR u.enrollmentYear = :enrollmentYear)
          AND (:isActive IS NULL OR u.isActive = :isActive)
          AND (:search IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%',:search,'%'))
                               OR LOWER(u.lastName)  LIKE LOWER(CONCAT('%',:search,'%'))
                               OR LOWER(u.email)     LIKE LOWER(CONCAT('%',:search,'%'))
                               OR LOWER(u.indexNumber) LIKE LOWER(CONCAT('%',:search,'%')))
        """)
    Page<User> searchUsers(
            @Param("role")         UserRole role,
            @Param("departmentId") Integer departmentId,
            @Param("enrollmentYear") Short enrollmentYear,
            @Param("isActive")     Boolean isActive,
            @Param("search")       String search,
            Pageable pageable);

    long countByRoleAndIsActive(UserRole role, Boolean isActive);

    /** Efficient targeted query — avoids loading all users just to filter in memory. */
    java.util.List<User> findByRoleAndIsActive(UserRole role, Boolean isActive);
}
