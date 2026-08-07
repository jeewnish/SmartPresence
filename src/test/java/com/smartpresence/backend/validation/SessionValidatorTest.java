package com.smartpresence.backend.validation;

import com.smartpresence.backend.ble.CheckinResult;
import com.smartpresence.backend.session.AttendanceSession;
import com.smartpresence.backend.session.SessionRepository;
import com.smartpresence.backend.session.SessionStatus;
import com.smartpresence.backend.user.User;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SessionValidatorTest {
    @Test
    void endedSessionCannotAcceptNewCheckIns() {
        var repository = mock(SessionRepository.class);
        var ended = AttendanceSession.builder().id(101L).status(SessionStatus.ENDED).build();
        when(repository.findById(101L)).thenReturn(Optional.of(ended));
        var context = new ValidationContext(101L, 1L, "token", -50, "device", "attendance-token",
            User.builder().id(7L).build(), false);

        assertThatThrownBy(() -> new SessionValidator(repository).validate(context))
            .isInstanceOfSatisfying(ValidationException.class, error -> {
                assertThat(error.getResult()).isEqualTo(CheckinResult.INVALID_SESSION);
                assertThat(error).hasMessageContaining("not active");
            });
    }
}
