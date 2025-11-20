package com.sentechcare.one.security.service;

import com.sentechcare.one.user.entity.User;
import com.sentechcare.one.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String normalizedEmail = username == null ? null : username.trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));

        String roleName = user.getRole() == null ? null : user.getRole().getName();
        if (!StringUtils.hasText(roleName)) {
            throw new UsernameNotFoundException("User has no role assigned");
        }

        String authorityName = roleName.toUpperCase().startsWith("ROLE_")
            ? roleName.toUpperCase()
            : "ROLE_" + roleName.toUpperCase();

        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(authorityName));

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password(user.getPassword())
            .authorities(authorities)
            .disabled(!Boolean.TRUE.equals(user.getActive()))
            .build();
    }
}
