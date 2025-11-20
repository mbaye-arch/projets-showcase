package com.sentechcare.one.security.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.sentechcare.one.role.entity.Role;
import com.sentechcare.one.user.entity.User;
import com.sentechcare.one.user.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void loadUserByUsername_shouldBuildSpringSecurityUserWithRolePrefix() {
        User user = User.builder()
            .id(1L)
            .email("tech@mail.com")
            .password("hashed")
            .active(true)
            .role(Role.builder().name("TECHNICIAN").build())
            .build();

        when(userRepository.findByEmailIgnoreCase("tech@mail.com")).thenReturn(Optional.of(user));

        UserDetails details = customUserDetailsService.loadUserByUsername("  TECH@mail.com ");

        assertThat(details.getUsername()).isEqualTo("tech@mail.com");
        assertThat(details.getPassword()).isEqualTo("hashed");
        assertThat(details.isEnabled()).isTrue();
        assertThat(details.getAuthorities()).extracting("authority").containsExactly("ROLE_TECHNICIAN");
    }

    @Test
    void loadUserByUsername_shouldRejectUserWithoutRole() {
        User user = User.builder()
            .email("user@mail.com")
            .password("hashed")
            .active(true)
            .role(null)
            .build();

        when(userRepository.findByEmailIgnoreCase("user@mail.com")).thenReturn(Optional.of(user));

        assertThrows(UsernameNotFoundException.class, () -> customUserDetailsService.loadUserByUsername("user@mail.com"));
    }
}
