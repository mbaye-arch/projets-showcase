package com.sentechcare.one.role.service;

import com.sentechcare.one.role.dto.RoleResponseDto;
import com.sentechcare.one.role.repository.RoleRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleService {

    private final RoleRepository roleRepository;

    public List<RoleResponseDto> getAll() {
        return roleRepository.findAllByOrderByNameAsc()
            .stream()
            .map(role -> RoleResponseDto.builder()
                .id(role.getId())
                .name(role.getName())
                .build()
            )
            .toList();
    }
}

