package com.sentechcare.one.invoice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.sentechcare.one.client.entity.Client;
import com.sentechcare.one.client.repository.ClientRepository;
import com.sentechcare.one.common.enums.InvoiceStatus;
import com.sentechcare.one.invoice.dto.InvoiceItemRequestDto;
import com.sentechcare.one.invoice.dto.InvoiceItemResponseDto;
import com.sentechcare.one.invoice.dto.InvoiceRequestDto;
import com.sentechcare.one.invoice.dto.InvoiceResponseDto;
import com.sentechcare.one.invoice.entity.Invoice;
import com.sentechcare.one.invoice.entity.InvoiceItem;
import com.sentechcare.one.invoice.mapper.InvoiceMapper;
import com.sentechcare.one.invoice.repository.InvoiceRepository;
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
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private InvoiceMapper invoiceMapper;

    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private InvoiceService invoiceService;

    @Captor
    private ArgumentCaptor<Invoice> invoiceCaptor;

    @Test
    void create_shouldCalculateTotalAndSetAutomaticFinancials() {
        InvoiceRequestDto request = InvoiceRequestDto.builder()
            .reference(" inv-001 ")
            .clientId(1L)
            .issueDate(LocalDate.of(2026, 3, 20))
            .dueDate(LocalDate.of(2026, 4, 20))
            .items(List.of(
                InvoiceItemRequestDto.builder().description("Maintenance").quantity(new BigDecimal("2")).unitPrice(new BigDecimal("100")).build(),
                InvoiceItemRequestDto.builder().description("Antivirus").quantity(new BigDecimal("1")).unitPrice(new BigDecimal("40")).build()
            ))
            .build();

        when(invoiceRepository.existsByReferenceIgnoreCase("INV-001")).thenReturn(false);
        when(clientRepository.findById(1L)).thenReturn(Optional.of(Client.builder().id(1L).build()));
        when(invoiceMapper.toEntity(request)).thenReturn(Invoice.builder().items(new LinkedHashSet<>()).build());
        when(invoiceMapper.toItemEntity(any(InvoiceItemRequestDto.class))).thenAnswer(invocation -> {
            InvoiceItemRequestDto dto = invocation.getArgument(0);
            return InvoiceItem.builder()
                .description(dto.getDescription())
                .quantity(dto.getQuantity())
                .unitPrice(dto.getUnitPrice())
                .build();
        });
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> {
            Invoice invoice = invocation.getArgument(0);
            invoice.setId(11L);
            return invoice;
        });
        when(invoiceMapper.toResponseDto(any(Invoice.class))).thenReturn(new InvoiceResponseDto());
        when(invoiceMapper.toItemResponseDto(any(InvoiceItem.class))).thenReturn(new InvoiceItemResponseDto());

        invoiceService.create(request);

        verify(invoiceRepository).save(invoiceCaptor.capture());
        Invoice saved = invoiceCaptor.getValue();

        assertThat(saved.getReference()).isEqualTo("INV-001");
        assertThat(saved.getTotalAmount()).isEqualByComparingTo("240.00");
        assertThat(saved.getPaidAmount()).isEqualByComparingTo("0.00");
        assertThat(saved.getRemainingAmount()).isEqualByComparingTo("240.00");
        assertThat(saved.getStatus()).isEqualTo(InvoiceStatus.UNPAID);
    }

    @Test
    void getById_shouldSynchronizeAmountsAndStatusFromPayments() {
        Invoice invoice = Invoice.builder()
            .id(7L)
            .reference("INV-007")
            .totalAmount(new BigDecimal("240.00"))
            .paidAmount(BigDecimal.ZERO)
            .remainingAmount(new BigDecimal("240.00"))
            .status(InvoiceStatus.UNPAID)
            .items(new LinkedHashSet<>())
            .build();

        when(invoiceRepository.findById(7L)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.sumPaymentsByInvoiceId(7L)).thenReturn(new BigDecimal("90.00"));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(invoiceMapper.toResponseDto(any(Invoice.class))).thenReturn(new InvoiceResponseDto());

        invoiceService.getById(7L);

        verify(invoiceRepository).save(invoiceCaptor.capture());
        Invoice synced = invoiceCaptor.getValue();

        assertThat(synced.getPaidAmount()).isEqualByComparingTo("90.00");
        assertThat(synced.getRemainingAmount()).isEqualByComparingTo("150.00");
        assertThat(synced.getStatus()).isEqualTo(InvoiceStatus.PARTIALLY_PAID);
    }

    @Test
    void getById_shouldRejectWhenPaidExceedsTotal() {
        Invoice invoice = Invoice.builder()
            .id(8L)
            .reference("INV-008")
            .totalAmount(new BigDecimal("100.00"))
            .paidAmount(BigDecimal.ZERO)
            .remainingAmount(new BigDecimal("100.00"))
            .status(InvoiceStatus.UNPAID)
            .items(new LinkedHashSet<>())
            .build();

        when(invoiceRepository.findById(8L)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.sumPaymentsByInvoiceId(8L)).thenReturn(new BigDecimal("110.00"));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> invoiceService.getById(8L));

        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(exception.getReason()).isEqualTo("paidAmount cannot exceed totalAmount");
        verify(invoiceRepository, never()).save(any(Invoice.class));
    }
}
