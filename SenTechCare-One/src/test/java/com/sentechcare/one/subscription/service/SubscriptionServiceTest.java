package com.sentechcare.one.subscription.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.sentechcare.one.client.entity.Client;
import com.sentechcare.one.client.repository.ClientRepository;
import com.sentechcare.one.common.enums.PlanType;
import com.sentechcare.one.common.enums.SubscriptionStatus;
import com.sentechcare.one.subscription.dto.SubscriptionRequestDto;
import com.sentechcare.one.subscription.dto.SubscriptionResponseDto;
import com.sentechcare.one.subscription.entity.Subscription;
import com.sentechcare.one.subscription.mapper.SubscriptionMapper;
import com.sentechcare.one.subscription.repository.SubscriptionRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private SubscriptionMapper subscriptionMapper;

    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private SubscriptionService subscriptionService;

    @Captor
    private ArgumentCaptor<Subscription> subscriptionCaptor;

    @Test
    void create_shouldDefaultFrequencyAndStatus() {
        SubscriptionRequestDto request = SubscriptionRequestDto.builder()
            .clientId(1L)
            .planType(PlanType.BUSINESS)
            .monthlyPrice(new BigDecimal("99.99"))
            .startDate(LocalDate.of(2026, 1, 1))
            .description("  Managed support  ")
            .build();

        Subscription entity = Subscription.builder()
            .planType(request.getPlanType())
            .monthlyPrice(request.getMonthlyPrice())
            .startDate(request.getStartDate())
            .billingFrequency(null)
            .status(null)
            .description(request.getDescription())
            .build();

        when(clientRepository.findById(1L)).thenReturn(Optional.of(Client.builder().id(1L).build()));
        when(subscriptionMapper.toEntity(request)).thenReturn(entity);
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(subscriptionMapper.toResponseDto(any(Subscription.class))).thenReturn(new SubscriptionResponseDto());

        subscriptionService.create(request);

        verify(subscriptionRepository).save(subscriptionCaptor.capture());
        Subscription saved = subscriptionCaptor.getValue();

        assertThat(saved.getBillingFrequency()).isEqualTo("MONTHLY");
        assertThat(saved.getStatus()).isEqualTo(SubscriptionStatus.ACTIVE);
        assertThat(saved.getDescription()).isEqualTo("Managed support");
    }

    @Test
    void create_shouldRejectInvalidBillingFrequency() {
        SubscriptionRequestDto request = SubscriptionRequestDto.builder()
            .clientId(1L)
            .planType(PlanType.BASIC)
            .monthlyPrice(new BigDecimal("10"))
            .startDate(LocalDate.now())
            .billingFrequency("weekly")
            .build();

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> subscriptionService.create(request));

        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(exception.getReason()).contains("billingFrequency must be one of");
    }

    @Test
    void delete_shouldSetCancelledAndEndDate() {
        Subscription existing = Subscription.builder()
            .id(4L)
            .status(SubscriptionStatus.ACTIVE)
            .endDate(null)
            .build();

        when(subscriptionRepository.findById(4L)).thenReturn(Optional.of(existing));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(invocation -> invocation.getArgument(0));

        subscriptionService.delete(4L);

        verify(subscriptionRepository).save(subscriptionCaptor.capture());
        Subscription saved = subscriptionCaptor.getValue();

        assertThat(saved.getStatus()).isEqualTo(SubscriptionStatus.CANCELLED);
        assertThat(saved.getEndDate()).isNotNull();
    }
}
