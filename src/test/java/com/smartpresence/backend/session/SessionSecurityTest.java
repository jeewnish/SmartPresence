package com.smartpresence.backend.session;

import com.smartpresence.backend.config.SecurityConfig;
import com.smartpresence.backend.security.ClerkJwtConverter;
import com.smartpresence.backend.session.dto.SessionResponse;
import com.smartpresence.backend.user.User;
import com.smartpresence.backend.user.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SessionController.class)
@Import(SecurityConfig.class)
class SessionSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean SessionService sessionService;
    @MockitoBean UserService userService;
    @MockitoBean ClerkJwtConverter clerkJwtConverter;
    @MockitoBean JwtDecoder jwtDecoder;

    @Test
    void lecturerCanRecoverOwnedSecret() throws Exception {
        var lecturer = User.builder().id(7L).build();
        when(userService.requireByClerkUserId("clerk-7")).thenReturn(lecturer);
        when(sessionService.getActiveSessions(lecturer)).thenReturn(List.of(
            new SessionResponse(3L, 2L, "C2", "Course", "owned-secret",
                SessionStatus.ACTIVE, null, null, 7L)));

        mvc.perform(get("/sessions/active/mine").with(jwt()
                .jwt(builder -> builder.subject("clerk-7"))
                .authorities(new SimpleGrantedAuthority("ROLE_LECTURER"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].sessionSecret").value("owned-secret"));
    }

    @Test
    void studentCannotRecoverLecturerSecrets() throws Exception {
        mvc.perform(get("/sessions/active/mine").with(jwt()
                .jwt(builder -> builder.subject("student-1"))
                .authorities(new SimpleGrantedAuthority("ROLE_STUDENT"))))
            .andExpect(status().isForbidden());
    }

    @Test
    void missingJwtIsUnauthorized() throws Exception {
        mvc.perform(get("/sessions/active/mine"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidJwtIsUnauthorized() throws Exception {
        when(jwtDecoder.decode("invalid-token")).thenThrow(new BadJwtException("invalid"));
        mvc.perform(get("/sessions/active/mine")
                .header("Authorization", "Bearer invalid-token"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void studentSafeSessionResponseOmitsSecretField() throws Exception {
        when(sessionService.getSession(3L)).thenReturn(new SessionResponse(
            3L, 2L, "C2", "Course", null, SessionStatus.ACTIVE, null, null, 7L));

        mvc.perform(get("/sessions/3").with(jwt()
                .jwt(builder -> builder.subject("student-1"))
                .authorities(new SimpleGrantedAuthority("ROLE_STUDENT"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sessionSecret").doesNotExist());
    }
}
