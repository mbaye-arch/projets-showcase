package com.sentechcare.one.auth.service;

import com.sentechcare.one.auth.dto.AuthResponseDto;
import com.sentechcare.one.auth.dto.AuthUserDto;
import com.sentechcare.one.auth.dto.LoginRequestDto;
import com.sentechcare.one.security.jwt.JwtService;
import com.sentechcare.one.user.entity.User;
import com.sentechcare.one.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private static final String TOKEN_TYPE = "Bearer";

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthResponseDto login(LoginRequestDto requestDto) {
        String email = normalizeEmail(requestDto.getEmail());

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, requestDto.getPassword())
        );

        UserDetails principal = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(principal);

        User user = findUserByEmail(principal.getUsername());

        return AuthResponseDto.builder()
            .accessToken(token)
            .tokenType(TOKEN_TYPE)
            .expiresInSeconds(jwtService.getExpirationMs() / 1000)
            .user(toAuthUserDto(user))
            .build();
    }

    public AuthUserDto getCurrentAuthenticatedUser() {
        Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
            .getContext()
            .getAuthentication();

        if (authentication == null
            || !authentication.isAuthenticated()
            || authentication instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session non authentifiee");
        }

        User user = findUserByEmail(authentication.getName());
        return toAuthUserDto(user);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur authentifie introuvable"));
    }

    private AuthUserDto toAuthUserDto(User user) {
        return AuthUserDto.builder()
            .id(user.getId())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .active(user.getActive())
            .roleId(user.getRole() == null ? null : user.getRole().getId())
            .roleName(user.getRole() == null ? null : user.getRole().getName())
            .build();
    }

    private String normalizeEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L email est obligatoire");
        }
        return email.trim().toLowerCase();
    }
}
