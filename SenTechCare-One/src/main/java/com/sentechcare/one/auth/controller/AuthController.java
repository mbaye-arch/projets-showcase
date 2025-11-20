package com.sentechcare.one.auth.controller;

import com.sentechcare.one.auth.dto.AuthResponseDto;
import com.sentechcare.one.auth.dto.AuthUserDto;
import com.sentechcare.one.auth.dto.LoginRequestDto;
import com.sentechcare.one.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public AuthResponseDto login(@Valid @RequestBody LoginRequestDto requestDto) {
        return authService.login(requestDto);
    }

    @GetMapping("/me")
    public AuthUserDto currentUser() {
        return authService.getCurrentAuthenticatedUser();
    }
}
