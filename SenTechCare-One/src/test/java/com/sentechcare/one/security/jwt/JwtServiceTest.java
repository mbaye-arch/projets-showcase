package com.sentechcare.one.security.jwt;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "01234567890123456789012345678901");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 60000L);
    }

    @Test
    void generateToken_shouldBeValidForSameUser() {
        UserDetails user = org.springframework.security.core.userdetails.User
            .withUsername("tech@mail.com")
            .password("encoded")
            .authorities("ROLE_TECHNICIAN")
            .build();

        String token = jwtService.generateToken(user);

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("tech@mail.com");
        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }

    @Test
    void isTokenValid_shouldReturnFalseForDifferentUser() {
        UserDetails user1 = org.springframework.security.core.userdetails.User
            .withUsername("user1@mail.com")
            .password("encoded")
            .authorities("ROLE_USER")
            .build();

        UserDetails user2 = org.springframework.security.core.userdetails.User
            .withUsername("user2@mail.com")
            .password("encoded")
            .authorities("ROLE_USER")
            .build();

        String token = jwtService.generateToken(user1);

        assertThat(jwtService.isTokenValid(token, user2)).isFalse();
    }
}
