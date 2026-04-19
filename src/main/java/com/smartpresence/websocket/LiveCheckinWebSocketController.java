package com.smartpresence.websocket;

import com.smartpresence.entity.Session;
import com.smartpresence.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

/**
 * STOMP message handlers for the Live Sessions board.
 *
 * This controller only handles inbound STOMP messages from clients.
 * All outbound publishing is done through {@link LiveSessionPublisher}.
 *
 * Clients subscribe to:
 *  /topic/session/{id}           BLE token updates + session status (from LiveSessionPublisher)
 *  /topic/session/{id}/checkins  Real-time check-in stream (from LiveSessionPublisher)
 *  /topic/session/{id}/lifecycle Session start/end events (from LiveSessionPublisher)
 *  /topic/dashboard/alerts       Security flag alerts (from LiveSessionPublisher)
 *  /topic/dashboard/kpis         KPI refresh triggers (from LiveSessionPublisher)
 */
@Controller
@RequiredArgsConstructor
public class LiveCheckinWebSocketController {

    private final SessionRepository sessionRepository;

    /**
     * Client sends a ping to confirm subscription and get current session state.
     * Maps to: /app/session/{id}/ping
     * Responds on: /topic/session/{id}/lifecycle
     */
    @MessageMapping("/session/{sessionId}/ping")
    @SendTo("/topic/session/{sessionId}/lifecycle")
    public String ping(@DestinationVariable Integer sessionId) {
        return sessionRepository.findById(sessionId)
                .map(s -> s.getStatus() == Session.SessionStatus.ACTIVE
                        ? "{\"status\":\"ACTIVE\",\"bleToken\":\"" + s.getBleToken() + "\"}"
                        : "{\"status\":\"" + s.getStatus().name() + "\"}")
                .orElse("{\"status\":\"NOT_FOUND\"}");
    }
}
