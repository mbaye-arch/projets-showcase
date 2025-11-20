package com.sentechcare.one.quote.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.sentechcare.one.client.entity.Client;
import com.sentechcare.one.client.repository.ClientRepository;
import com.sentechcare.one.common.enums.QuoteStatus;
import com.sentechcare.one.quote.dto.QuoteItemRequestDto;
import com.sentechcare.one.quote.dto.QuoteItemResponseDto;
import com.sentechcare.one.quote.dto.QuoteRequestDto;
import com.sentechcare.one.quote.dto.QuoteResponseDto;
import com.sentechcare.one.quote.entity.Quote;
import com.sentechcare.one.quote.entity.QuoteItem;
import com.sentechcare.one.quote.mapper.QuoteMapper;
import com.sentechcare.one.quote.repository.QuoteRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.List;
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
class QuoteServiceTest {

    @Mock
    private QuoteRepository quoteRepository;

    @Mock
    private QuoteMapper quoteMapper;

    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private QuoteService quoteService;

    @Captor
    private ArgumentCaptor<Quote> quoteCaptor;

    @Test
    void create_shouldCalculateAmountsAndDefaultStatus() {
        QuoteRequestDto request = QuoteRequestDto.builder()
            .reference(" q-001 ")
            .clientId(1L)
            .quoteDate(LocalDate.of(2026, 3, 20))
            .discountAmount(new BigDecimal("25"))
            .items(List.of(
                QuoteItemRequestDto.builder().description("Laptop").quantity(new BigDecimal("2")).unitPrice(new BigDecimal("100")).build(),
                QuoteItemRequestDto.builder().description("Router").quantity(new BigDecimal("1")).unitPrice(new BigDecimal("50")).build()
            ))
            .build();

        Client client = Client.builder().id(1L).build();

        when(quoteRepository.existsByReferenceIgnoreCase("Q-001")).thenReturn(false);
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(quoteMapper.toEntity(request)).thenReturn(Quote.builder().items(new LinkedHashSet<>()).build());
        when(quoteMapper.toItemEntity(any(QuoteItemRequestDto.class))).thenAnswer(invocation -> {
            QuoteItemRequestDto dto = invocation.getArgument(0);
            return QuoteItem.builder()
                .description(dto.getDescription())
                .quantity(dto.getQuantity())
                .unitPrice(dto.getUnitPrice())
                .build();
        });
        when(quoteRepository.save(any(Quote.class))).thenAnswer(invocation -> {
            Quote quote = invocation.getArgument(0);
            quote.setId(10L);
            return quote;
        });
        when(quoteMapper.toResponseDto(any(Quote.class))).thenReturn(new QuoteResponseDto());
        when(quoteMapper.toItemResponseDto(any(QuoteItem.class))).thenReturn(new QuoteItemResponseDto());

        quoteService.create(request);

        verify(quoteRepository).save(quoteCaptor.capture());
        Quote saved = quoteCaptor.getValue();

        assertThat(saved.getReference()).isEqualTo("Q-001");
        assertThat(saved.getStatus()).isEqualTo(QuoteStatus.DRAFT);
        assertThat(saved.getSubtotal()).isEqualByComparingTo("250.00");
        assertThat(saved.getDiscountAmount()).isEqualByComparingTo("25.00");
        assertThat(saved.getTotalAmount()).isEqualByComparingTo("225.00");
        assertThat(saved.getItems()).hasSize(2);
        assertThat(saved.getItems())
            .extracting(QuoteItem::getLineTotal)
            .containsExactlyInAnyOrder(new BigDecimal("200.00"), new BigDecimal("50.00"));
    }

    @Test
    void create_shouldRejectDiscountGreaterThanSubtotal() {
        QuoteRequestDto request = QuoteRequestDto.builder()
            .reference("Q-002")
            .clientId(1L)
            .quoteDate(LocalDate.of(2026, 3, 20))
            .discountAmount(new BigDecimal("300"))
            .items(List.of(
                QuoteItemRequestDto.builder().description("Service").quantity(new BigDecimal("1")).unitPrice(new BigDecimal("200")).build()
            ))
            .build();

        when(quoteRepository.existsByReferenceIgnoreCase("Q-002")).thenReturn(false);
        when(clientRepository.findById(1L)).thenReturn(Optional.of(Client.builder().id(1L).build()));
        when(quoteMapper.toEntity(request)).thenReturn(Quote.builder().items(new LinkedHashSet<>()).build());
        when(quoteMapper.toItemEntity(any(QuoteItemRequestDto.class))).thenAnswer(invocation -> {
            QuoteItemRequestDto dto = invocation.getArgument(0);
            return QuoteItem.builder()
                .description(dto.getDescription())
                .quantity(dto.getQuantity())
                .unitPrice(dto.getUnitPrice())
                .build();
        });

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> quoteService.create(request));

        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(exception.getReason()).isEqualTo("discountAmount cannot exceed subtotal");
        verify(quoteRepository, never()).save(any(Quote.class));
    }
}
