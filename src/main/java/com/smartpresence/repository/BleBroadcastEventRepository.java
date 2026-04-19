package com.smartpresence.repository;

import com.smartpresence.entity.BleBroadcastEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BleBroadcastEventRepository extends JpaRepository<BleBroadcastEvent, Long> {

    List<BleBroadcastEvent> findBySessionSessionIdOrderByTokenIssuedAtDesc(Integer sessionId);

    Optional<BleBroadcastEvent> findTopBySessionSessionIdOrderByTokenIssuedAtDesc(Integer sessionId);
}
