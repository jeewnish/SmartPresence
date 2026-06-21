package com.smartpresence.backend.user;

import com.smartpresence.backend.user.dto.OnboardRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void linksSeededUserByEmailAndPreservesExistingRole() {
        var request = new OnboardRequest(
            "Kamal",
            "Perera",
            "LOOPDEPOO@gmail.com",
            "25FIS0536",
            UserRole.ROLE_STUDENT
        );
        var seededUser = User.builder()
            .id(2L)
            .clerkUserId("25fis0536")
            .email("loopdepoo@gmail.com")
            .firstName("Kamal")
            .lastName("Perera")
            .role(UserRole.ROLE_STUDENT)
            .build();

        when(userRepository.findByClerkUserId("user_clerk_123")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase(request.email())).thenReturn(Optional.of(seededUser));
        when(userRepository.save(seededUser)).thenReturn(seededUser);

        var response = userService.onboard(request, "user_clerk_123");

        assertThat(response.id()).isEqualTo(2L);
        assertThat(response.clerkUserId()).isEqualTo("user_clerk_123");
        assertThat(response.role()).isEqualTo(UserRole.ROLE_STUDENT);
        verify(userRepository).save(seededUser);
    }

    @Test
    void createsUserForFutureSignupWhenEmailDoesNotExist() {
        var request = new OnboardRequest(
            "New",
            "Student",
            "new.student@example.com",
            "24FDS0123",
            null
        );

        when(userRepository.findByClerkUserId("user_new_456")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase(request.email())).thenReturn(Optional.empty());
        when(userRepository.save(org.mockito.ArgumentMatchers.any(User.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        var response = userService.onboard(request, "user_new_456");

        var userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User created = userCaptor.getValue();

        assertThat(created.getClerkUserId()).isEqualTo("user_new_456");
        assertThat(created.getEmail()).isEqualTo("new.student@example.com");
        assertThat(created.getRole()).isEqualTo(UserRole.ROLE_STUDENT);
        assertThat(created.getUniversityId()).isEqualTo("24fds0123");
        assertThat(created.getDepartment()).isEqualTo(AcademicDepartment.DS);
        assertThat(response.clerkUserId()).isEqualTo("user_new_456");
    }

    @Test
    void returnsAlreadyLinkedUserWithoutChangingIt() {
        var request = new OnboardRequest(
            "Ignored",
            "Name",
            "ignored@example.com",
            "24FSE0001",
            UserRole.ROLE_LECTURER
        );
        var linkedUser = User.builder()
            .id(7L)
            .clerkUserId("user_existing")
            .email("existing@example.com")
            .firstName("Existing")
            .lastName("User")
            .role(UserRole.ROLE_STUDENT)
            .build();

        when(userRepository.findByClerkUserId("user_existing")).thenReturn(Optional.of(linkedUser));

        var response = userService.onboard(request, "user_existing");

        assertThat(response.id()).isEqualTo(7L);
        assertThat(response.email()).isEqualTo("existing@example.com");
        verify(userRepository, never()).findByEmailIgnoreCase(request.email());
        verify(userRepository, never()).save(org.mockito.ArgumentMatchers.any(User.class));
    }
}
