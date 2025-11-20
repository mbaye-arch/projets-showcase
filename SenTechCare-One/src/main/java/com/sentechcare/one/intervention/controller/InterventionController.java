package com.sentechcare.one.intervention.controller;

import com.sentechcare.one.common.enums.InterventionStatus;
import com.sentechcare.one.common.enums.InterventionType;
import com.sentechcare.one.common.enums.PriorityLevel;
import com.sentechcare.one.intervention.dto.InterventionRequestDto;
import com.sentechcare.one.intervention.dto.InterventionResponseDto;
import com.sentechcare.one.intervention.service.InterventionService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
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
@RequestMapping("/api/interventions")
public class InterventionController {

    private final InterventionService interventionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InterventionResponseDto create(@Valid @RequestBody InterventionRequestDto requestDto) {
        return interventionService.create(requestDto);
    }

    @PutMapping("/{id}")
    public InterventionResponseDto update(@PathVariable Long id, @Valid @RequestBody InterventionRequestDto requestDto) {
        return interventionService.update(id, requestDto);
    }

    @GetMapping("/{id}")
    public InterventionResponseDto getById(@PathVariable Long id) {
        return interventionService.getById(id);
    }

    @GetMapping
    public Page<InterventionResponseDto> getAll(
        Pageable pageable,
        @RequestParam(required = false) Long clientId,
        @RequestParam(required = false) Long assignedTechnicianId,
        @RequestParam(required = false) InterventionStatus status,
        @RequestParam(required = false) PriorityLevel priority,
        @RequestParam(required = false) InterventionType type,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime plannedFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime plannedTo,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime actualFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime actualTo,
        @RequestParam(required = false) String search
    ) {
        return interventionService.getAll(
            pageable,
            clientId,
            assignedTechnicianId,
            status,
            priority,
            type,
            plannedFrom,
            plannedTo,
            actualFrom,
            actualTo,
            search
        );
    }

    @GetMapping("/technician/{assignedTechnicianId}")
    public Page<InterventionResponseDto> getByTechnician(@PathVariable Long assignedTechnicianId, Pageable pageable) {
        return interventionService.getByTechnician(assignedTechnicianId, pageable);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        interventionService.delete(id);
    }
}
