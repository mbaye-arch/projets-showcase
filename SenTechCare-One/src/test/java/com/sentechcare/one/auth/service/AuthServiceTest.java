package com.sentechcare.one.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.sentechcare.one.auth.dto.AuthResponseDto;
import com.sentechcare.one.auth.dto.LoginRequestDto;
import com.sentechcare.one.role.entity.Role;
import com.sentechcare.one.security.jwt.JwtService;
import com.sentechcare.one.user.entity.User;
import com.sentechcare.one.user.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthService authService;

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void login_shouldReturnJwtAndUserPayload() {
        LoginRequestDto request = LoginRequestDto.builder()
            .email("  ADMIN@MAIL.COM ")
            .password("password123")
            .build();

        UserDetails principal = org.springframework.security.core.userdetails.User.builder()
            .username("admin@mail.com")
            .password("hash")
            .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
            .build();

        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        User domainUser = User.builder()
            .id(1L)
            .firstName("Admin")
            .lastName("User")
            .email("admin@mail.com")
            .active(true)
            .role(Role.builder().id(10L).name("ADMIN").build())
            .build();

        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(jwtService.generateToken(principal)).thenReturn("jwt-token");
        when(jwtService.getExpirationMs()).thenReturn(3600000L);
        when(userRepository.findByEmailIgnoreCase("admin@mail.com")).thenReturn(Optional.of(domainUser));

        AuthResponseDto response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("jwt-token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getExpiresInSeconds()).isEqualTo(3600L);
        assertThat(response.getUser().getEmail()).isEqualTo("admin@mail.com");
        assertThat(response.getUser().getRoleName()).isEqualTo("ADMIN");
    }

    @Test
    void getCurrentAuthenticatedUser_shouldRejectWhenUnauthenticated() {
        SecurityContextHolder.getContext().setAuthentication(
            new AnonymousAuthenticationToken("key", "anonymous", List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS")))
        );

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            authService::getCurrentAuthenticatedUser
        );

        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(exception.getReason()).isEqualTo("Session non authentifiee");
    }
}
