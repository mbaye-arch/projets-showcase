package com.sentechcare.one.ticket.controller;

import com.sentechcare.one.common.enums.PriorityLevel;
import com.sentechcare.one.common.enums.TicketChannel;
import com.sentechcare.one.common.enums.TicketStatus;
import com.sentechcare.one.ticket.dto.TicketRequestDto;
import com.sentechcare.one.ticket.dto.TicketResponseDto;
import com.sentechcare.one.ticket.dto.TicketToInterventionRequestDto;
import com.sentechcare.one.ticket.dto.TicketToInterventionResponseDto;
import com.sentechcare.one.ticket.service.TicketService;
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
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponseDto create(@Valid @RequestBody TicketRequestDto requestDto) {
        return ticketService.create(requestDto);
    }

    @PutMapping("/{id}")
    public TicketResponseDto update(@PathVariable Long id, @Valid @RequestBody TicketRequestDto requestDto) {
        return ticketService.update(id, requestDto);
    }

    @GetMapping("/{id}")
    public TicketResponseDto getById(@PathVariable Long id) {
        return ticketService.getById(id);
    }

    @GetMapping
    public Page<TicketResponseDto> getAll(
        Pageable pageable,
        @RequestParam(required = false) Long clientId,
        @RequestParam(required = false) Long assignedTechnicianId,
        @RequestParam(required = false) TicketStatus status,
        @RequestParam(required = false) PriorityLevel priority,
        @RequestParam(required = false) TicketChannel channel,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime createdFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime createdTo,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime resolvedFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime resolvedTo,
        @RequestParam(required = false) String search
    ) {
        return ticketService.getAll(
            pageable,
            clientId,
            assignedTechnicianId,
            status,
            priority,
            channel,
            createdFrom,
            createdTo,
            resolvedFrom,
            resolvedTo,
            search
        );
    }

    @GetMapping("/technician/{assignedTechnicianId}")
    public Page<TicketResponseDto> getByTechnician(@PathVariable Long assignedTechnicianId, Pageable pageable) {
        return ticketService.getByTechnician(assignedTechnicianId, pageable);
    }

    @PostMapping("/{id}/convert-to-intervention")
    public TicketToInterventionResponseDto convertToIntervention(
        @PathVariable Long id,
        @Valid @RequestBody TicketToInterventionRequestDto requestDto
    ) {
        return ticketService.convertToIntervention(id, requestDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        ticketService.delete(id);
    }
}
