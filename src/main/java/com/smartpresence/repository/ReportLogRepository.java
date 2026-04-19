package com.smartpresence.repository;

import com.smartpresence.entity.ReportLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportLogRepository extends JpaRepository<ReportLog, Integer> {

    Page<ReportLog> findByGeneratedByUserIdOrderByGeneratedAtDesc(
            Integer userId, Pageable pageable);
}
