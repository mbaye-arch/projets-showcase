package com.sentechcare.one.user.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.sentechcare.one.role.entity.Role;
import com.sentechcare.one.user.dto.UserRequestDto;
import com.sentechcare.one.user.dto.UserResponseDto;
import com.sentechcare.one.user.entity.User;
import com.sentechcare.one.user.mapper.UserMapper;
import com.sentechcare.one.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private UserService userService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    @Test
    void create_shouldEncodePasswordAndNormalizeEmail() {
        UserRequestDto request = UserRequestDto.builder()
            .firstName("  John ")
            .lastName(" Doe  ")
            .email("  JOHN.DOE@MAIL.COM ")
            .password("password123")
            .roleId(3L)
            .build();

        Role role = Role.builder().id(3L).name("TECHNICIAN").build();
        User entity = User.builder()
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .email(request.getEmail())
            .active(null)
            .build();

        when(userRepository.existsByEmailIgnoreCase("john.doe@mail.com")).thenReturn(false);
        when(entityManager.find(Role.class, 3L)).thenReturn(role);
        when(userMapper.toEntity(request)).thenReturn(entity);
        when(passwordEncoder.encode("password123")).thenReturn("ENCODED");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userMapper.toResponseDto(any(User.class))).thenReturn(new UserResponseDto());

        userService.create(request);

        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();

        assertThat(saved.getEmail()).isEqualTo("john.doe@mail.com");
        assertThat(saved.getPassword()).isEqualTo("ENCODED");
        assertThat(saved.getActive()).isTrue();
        assertThat(saved.getRole()).isSameAs(role);
        assertThat(saved.getFirstName()).isEqualTo("John");
        assertThat(saved.getLastName()).isEqualTo("Doe");
    }

    @Test
    void update_shouldKeepCurrentPasswordWhenMissingInRequest() {
        User existing = User.builder()
            .id(9L)
            .firstName("Old")
            .lastName("Name")
            .email("old@mail.com")
            .password("OLD_HASH")
            .active(true)
            .role(Role.builder().id(1L).name("ADMIN").build())
            .build();

        UserRequestDto request = UserRequestDto.builder()
            .firstName("New")
            .lastName("User")
            .email("new@mail.com")
            .password(null)
            .roleId(2L)
            .build();

        Role role = Role.builder().id(2L).name("TECHNICIAN").build();

        when(userRepository.findById(9L)).thenReturn(Optional.of(existing));
        when(entityManager.find(Role.class, 2L)).thenReturn(role);
        when(userRepository.existsByEmailIgnoreCaseAndIdNot("new@mail.com", 9L)).thenReturn(false);
        doAnswer(invocation -> {
            UserRequestDto dto = invocation.getArgument(0);
            User user = invocation.getArgument(1);
            user.setFirstName(dto.getFirstName());
            user.setLastName(dto.getLastName());
            user.setEmail(dto.getEmail());
            user.setActive(dto.getActive());
            return null;
        }).when(userMapper).updateEntityFromDto(any(UserRequestDto.class), any(User.class));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userMapper.toResponseDto(any(User.class))).thenReturn(new UserResponseDto());

        userService.update(9L, request);

        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();

        assertThat(saved.getPassword()).isEqualTo("OLD_HASH");
        assertThat(saved.getRole()).isSameAs(role);
        assertThat(saved.getEmail()).isEqualTo("new@mail.com");
    }

    @Test
    void create_shouldRejectDuplicateEmail() {
        UserRequestDto request = UserRequestDto.builder()
            .firstName("John")
            .lastName("Doe")
            .email("john@doe.com")
            .password("password123")
            .roleId(1L)
            .build();

        when(userRepository.existsByEmailIgnoreCase("john@doe.com")).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> userService.create(request));

        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(exception.getReason()).isEqualTo("User email already exists");
    }
}
