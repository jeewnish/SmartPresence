package com.smartpresence.backend.session;

import com.smartpresence.backend.session.dto.SessionResponse;
import com.smartpresence.backend.user.User;
import com.smartpresence.backend.user.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SessionControllerTest {

    private final SessionService sessionService = mock(SessionService.class);
    private final UserService userService = mock(UserService.class);
    private final SessionController controller = new SessionController(sessionService, userService);

    @Test
    void activeMineIsLecturerProtectedAndUsesAuthenticatedOwner() throws Exception {
        var authorization = SessionController.class
            .getDeclaredMethod("activeMine", Jwt.class)
            .getAnnotation(PreAuthorize.class);
        assertThat(authorization.value()).isEqualTo("hasRole('LECTURER')");

        var lecturer = User.builder().id(7L).build();
        var jwt = new Jwt("token", Instant.now(), Instant.now().plusSeconds(60),
            Map.of("alg", "none"), Map.of("sub", "clerk-7"));
        var sessions = List.of(new SessionResponse(3L, 2L, "C2", "Course", "owned-secret",
            SessionStatus.ACTIVE, null, null, 7L));
        when(userService.requireByClerkUserId("clerk-7")).thenReturn(lecturer);
        when(sessionService.getActiveSessions(lecturer)).thenReturn(sessions);

        var response = controller.activeMine(jwt);

        assertThat(response.getBody()).isEqualTo(sessions);
        assertThat(response.getBody().getFirst().sessionSecret()).isEqualTo("owned-secret");
        verify(sessionService).getActiveSessions(lecturer);
    }

    @Test
    void studentSafeGetStillOmitsSecret() {
        var safe = new SessionResponse(3L, 2L, "C2", "Course", null,
            SessionStatus.ACTIVE, null, null, 7L);
        when(sessionService.getSession(3L)).thenReturn(safe);

        assertThat(controller.get(3L).getBody().sessionSecret()).isNull();
    }
}
