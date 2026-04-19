package com.smartpresence.repository;

import com.smartpresence.entity.BleCheckinEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BleCheckinEventRepository extends JpaRepository<BleCheckinEvent, Long> {

    List<BleCheckinEvent> findBySessionSessionIdOrderByCapturedAtDesc(Integer sessionId);

    List<BleCheckinEvent> findByStudentUserIdOrderByCapturedAtDesc(Integer studentId);

    /** Average RSSI for a session — used for venue coverage analytics */
    @Query("""
        SELECT AVG(b.rssiDbm) FROM BleCheckinEvent b
        WHERE b.session.sessionId = :sessionId
          AND b.passedRssi = true
        """)
    Double avgRssiForSession(@Param("sessionId") Integer sessionId);
}
