package com.sentechcare.one.role.controller;

import com.sentechcare.one.role.dto.RoleResponseDto;
import com.sentechcare.one.role.service.RoleService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','SUPPORT')")
    public List<RoleResponseDto> getAll() {
        return roleService.getAll();
    }
}

