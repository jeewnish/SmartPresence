package com.smartpresence.backend.user;

import com.smartpresence.backend.user.dto.OnboardRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Spy
    private StudentIdParser studentIdParser = new StudentIdParser();

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
        assertThat(seededUser.getUniversityId()).isEqualTo("25fis0536");
        assertThat(seededUser.getDepartment()).isEqualTo(AcademicDepartment.CIS);
        assertThat(seededUser.getAdmissionYear()).isEqualTo("25");
        assertThat(seededUser.getStudentNumber()).isEqualTo("0536");
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
        assertThat(created.getAdmissionYear()).isEqualTo("24");
        assertThat(created.getStudentNumber()).isEqualTo("0123");
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
        when(userRepository.save(linkedUser)).thenReturn(linkedUser);

        var response = userService.onboard(request, "user_existing");

        assertThat(response.id()).isEqualTo(7L);
        assertThat(response.email()).isEqualTo("existing@example.com");
        verify(userRepository, never()).findByEmailIgnoreCase(request.email());
        verify(userRepository).save(linkedUser);
    }

    @Test
    void rejectsMalformedStudentIdBeforeSavingNewStudent() {
        var request = new OnboardRequest(
            "Invalid", "Student", "invalid@example.com", "22CIS0345", null
        );
        when(userRepository.findByClerkUserId("user_invalid")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase(request.email())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.onboard(request, "user_invalid"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("YYFISNNNN");
        verify(userRepository, never()).save(org.mockito.ArgumentMatchers.any(User.class));
    }

    @Test
    void publicOnboardingCannotSelfAssignLecturerRole() {
        var request = new OnboardRequest(
            "New", "Lecturer", "lecturer@example.com", null, UserRole.ROLE_LECTURER
        );
        when(userRepository.findByClerkUserId("lecturer_clerk")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase(request.email())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> userService.onboard(request, "lecturer_clerk"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("universityId");
        verify(userRepository, never()).save(org.mockito.ArgumentMatchers.any(User.class));
    }
}
