package com.sentechcare.one.auth.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sentechcare.one.auth.dto.AuthResponseDto;
import com.sentechcare.one.auth.dto.AuthUserDto;
import com.sentechcare.one.auth.dto.LoginRequestDto;
import com.sentechcare.one.auth.service.AuthService;
import com.sentechcare.one.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.standaloneSetup(authController)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
        this.objectMapper = new ObjectMapper();
    }

    @Test
    void login_shouldReturnTokenPayload() throws Exception {
        LoginRequestDto request = LoginRequestDto.builder()
            .email("admin@mail.com")
            .password("password123")
            .build();

        AuthResponseDto response = AuthResponseDto.builder()
            .accessToken("jwt-token")
            .tokenType("Bearer")
            .expiresInSeconds(3600L)
            .user(AuthUserDto.builder().id(1L).email("admin@mail.com").roleName("ADMIN").build())
            .build();

        when(authService.login(any(LoginRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").value("jwt-token"))
            .andExpect(jsonPath("$.tokenType").value("Bearer"))
            .andExpect(jsonPath("$.user.email").value("admin@mail.com"));
    }

    @Test
    void currentUser_shouldReturnAuthenticatedUser() throws Exception {
        when(authService.getCurrentAuthenticatedUser())
            .thenReturn(AuthUserDto.builder().id(2L).email("tech@mail.com").roleName("TECHNICIAN").build());

        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(2L))
            .andExpect(jsonPath("$.email").value("tech@mail.com"))
            .andExpect(jsonPath("$.roleName").value("TECHNICIAN"));
    }
}
