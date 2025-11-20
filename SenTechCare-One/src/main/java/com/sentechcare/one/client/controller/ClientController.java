package com.sentechcare.one.client.controller;

import com.sentechcare.one.client.dto.ClientRequestDto;
import com.sentechcare.one.client.dto.ClientResponseDto;
import com.sentechcare.one.client.service.ClientService;
import com.sentechcare.one.common.enums.ClientType;
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
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClientResponseDto create(@Valid @RequestBody ClientRequestDto requestDto) {
        return clientService.create(requestDto);
    }

    @PutMapping("/{id}")
    public ClientResponseDto update(@PathVariable Long id, @Valid @RequestBody ClientRequestDto requestDto) {
        return clientService.update(id, requestDto);
    }

    @GetMapping("/{id}")
    public ClientResponseDto getById(@PathVariable Long id) {
        return clientService.getById(id);
    }

    @GetMapping
    public Page<ClientResponseDto> getAll(
        Pageable pageable,
        @RequestParam(required = false) Boolean active,
        @RequestParam(required = false) ClientType clientType,
        @RequestParam(required = false) String search
    ) {
        return clientService.getAll(pageable, active, clientType, search);
    }

    @GetMapping("/active")
    public Page<ClientResponseDto> getActive(Pageable pageable) {
        return clientService.getActive(pageable);
    }

    @GetMapping("/by-email")
    public ClientResponseDto getByEmail(@RequestParam String email) {
        return clientService.getByEmail(email);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        clientService.delete(id);
    }
}
