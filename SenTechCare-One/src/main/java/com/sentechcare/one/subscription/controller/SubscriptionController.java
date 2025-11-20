package com.sentechcare.one.subscription.controller;

import com.sentechcare.one.common.enums.PlanType;
import com.sentechcare.one.common.enums.SubscriptionStatus;
import com.sentechcare.one.subscription.dto.SubscriptionRequestDto;
import com.sentechcare.one.subscription.dto.SubscriptionResponseDto;
import com.sentechcare.one.subscription.service.SubscriptionService;
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
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SubscriptionResponseDto create(@Valid @RequestBody SubscriptionRequestDto requestDto) {
        return subscriptionService.create(requestDto);
    }

    @PutMapping("/{id}")
    public SubscriptionResponseDto update(@PathVariable Long id, @Valid @RequestBody SubscriptionRequestDto requestDto) {
        return subscriptionService.update(id, requestDto);
    }

    @GetMapping("/{id}")
    public SubscriptionResponseDto getById(@PathVariable Long id) {
        return subscriptionService.getById(id);
    }

    @GetMapping
    public Page<SubscriptionResponseDto> getAll(
        Pageable pageable,
        @RequestParam(required = false) Long clientId,
        @RequestParam(required = false) SubscriptionStatus status,
        @RequestParam(required = false) PlanType planType,
        @RequestParam(required = false) Boolean expired
    ) {
        return subscriptionService.getAll(pageable, clientId, status, planType, expired);
    }

    @GetMapping("/active")
    public Page<SubscriptionResponseDto> getActive(Pageable pageable) {
        return subscriptionService.getActive(pageable);
    }

    @GetMapping("/expired")
    public Page<SubscriptionResponseDto> getExpired(Pageable pageable) {
        return subscriptionService.getExpired(pageable);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        subscriptionService.delete(id);
    }
}
