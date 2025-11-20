package com.sentechcare.one.equipment.controller;

import com.sentechcare.one.common.enums.EquipmentCategory;
import com.sentechcare.one.common.enums.EquipmentSource;
import com.sentechcare.one.common.enums.EquipmentStatus;
import com.sentechcare.one.equipment.dto.EquipmentRequestDto;
import com.sentechcare.one.equipment.dto.EquipmentResponseDto;
import com.sentechcare.one.equipment.service.EquipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/api/equipments")
public class EquipmentController {

    private final EquipmentService equipmentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EquipmentResponseDto create(@Valid @RequestBody EquipmentRequestDto requestDto) {
        return equipmentService.create(requestDto);
    }

    @PutMapping("/{id}")
    public EquipmentResponseDto update(@PathVariable Long id, @Valid @RequestBody EquipmentRequestDto requestDto) {
        return equipmentService.update(id, requestDto);
    }

    @GetMapping("/{id}")
    public EquipmentResponseDto getById(@PathVariable Long id) {
        return equipmentService.getById(id);
    }

    @GetMapping
    public Page<EquipmentResponseDto> getAll(
        Pageable pageable,
        @RequestParam(required = false) Long clientId,
        @RequestParam(required = false) EquipmentStatus status,
        @RequestParam(required = false) EquipmentCategory category,
        @RequestParam(required = false) EquipmentSource source,
        @RequestParam(required = false) String search
    ) {
        return equipmentService.getAll(pageable, clientId, status, category, source, search);
    }

    @GetMapping("/client/{clientId}")
    public Page<EquipmentResponseDto> getByClient(@PathVariable Long clientId, Pageable pageable) {
        return equipmentService.getByClient(clientId, pageable);
    }

    @GetMapping("/by-serial")
    public EquipmentResponseDto getByExactSerialNumber(@RequestParam String serialNumber) {
        return equipmentService.getByExactSerialNumber(serialNumber);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        equipmentService.delete(id);
    }
}
