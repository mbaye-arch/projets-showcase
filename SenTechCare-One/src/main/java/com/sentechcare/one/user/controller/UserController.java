package com.sentechcare.one.user.controller;

import com.sentechcare.one.user.dto.UserRequestDto;
import com.sentechcare.one.user.dto.UserResponseDto;
import com.sentechcare.one.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDto create(@Valid @RequestBody UserRequestDto requestDto) {
        return userService.create(requestDto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public UserResponseDto update(@PathVariable Long id, @Valid @RequestBody UserRequestDto requestDto) {
        return userService.update(id, requestDto);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','SUPPORT')")
    public UserResponseDto getById(@PathVariable Long id) {
        return userService.getById(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','SUPPORT')")
    public Page<UserResponseDto> getAll(
        Pageable pageable,
        @RequestParam(required = false) Boolean active,
        @RequestParam(required = false) Long roleId,
        @RequestParam(required = false) String search
    ) {
        return userService.getAll(pageable, active, roleId, search);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','SUPPORT')")
    public Page<UserResponseDto> getActive(Pageable pageable) {
        return userService.getActive(pageable);
    }

    @GetMapping("/role/{roleId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','SUPPORT')")
    public Page<UserResponseDto> getByRole(@PathVariable Long roleId, Pageable pageable) {
        return userService.getByRole(roleId, pageable);
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','SUPPORT')")
    public Page<UserResponseDto> getTechnicians(
        Pageable pageable,
        @RequestParam(defaultValue = "true") boolean activeOnly
    ) {
        return userService.getTechnicians(pageable, activeOnly);
    }

    @GetMapping("/by-email")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','SUPPORT') or authentication.name.equalsIgnoreCase(#email)")
    public UserResponseDto getByEmail(@RequestParam String email) {
        return userService.getByEmail(email);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        userService.delete(id);
    }
}
