package com.smartpresence.backend.attendance;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TokenUsageRepository extends JpaRepository<AttendanceTokenUsage, Long> {

    boolean existsByTokenJti(String tokenJti);
}
