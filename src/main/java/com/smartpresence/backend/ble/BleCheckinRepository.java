package com.smartpresence.backend.ble;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BleCheckinRepository extends JpaRepository<BleCheckinEvent, Long> {

    List<BleCheckinEvent> findBySessionIdOrderByCreatedAtDesc(Long sessionId);

    List<BleCheckinEvent> findByStudentIdAndSessionIdOrderByCreatedAtAsc(
        Long studentId, Long sessionId);

    List<BleCheckinEvent> findByStudentIdOrderByCreatedAtDesc(Long studentId);
}
