package com.sentechcare.one.payment.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.sentechcare.one.common.enums.InvoiceStatus;
import com.sentechcare.one.common.enums.PaymentMethod;
import com.sentechcare.one.invoice.entity.Invoice;
import com.sentechcare.one.invoice.repository.InvoiceRepository;
import com.sentechcare.one.payment.dto.PaymentRequestDto;
import com.sentechcare.one.payment.dto.PaymentResponseDto;
import com.sentechcare.one.payment.entity.Payment;
import com.sentechcare.one.payment.mapper.PaymentMapper;
import com.sentechcare.one.payment.repository.PaymentRepository;
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
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentMapper paymentMapper;

    @Mock
    private InvoiceRepository invoiceRepository;

    @InjectMocks
    private PaymentService paymentService;

    @Captor
    private ArgumentCaptor<Invoice> invoiceCaptor;

    @Test
    void create_shouldSynchronizeInvoiceFinancials() {
        PaymentRequestDto request = PaymentRequestDto.builder()
            .invoiceId(5L)
            .paymentDate(LocalDate.of(2026, 3, 20))
            .amount(new BigDecimal("50"))
            .method(PaymentMethod.CASH)
            .paymentReference(" PAY-001 ")
            .notes(" paid ")
            .build();

        Invoice invoice = Invoice.builder()
            .id(5L)
            .totalAmount(new BigDecimal("200.00"))
            .paidAmount(BigDecimal.ZERO)
            .remainingAmount(new BigDecimal("200.00"))
            .status(InvoiceStatus.ISSUED)
            .build();

        Payment paymentEntity = Payment.builder()
            .paymentDate(request.getPaymentDate())
            .amount(request.getAmount())
            .method(request.getMethod())
            .paymentReference(request.getPaymentReference())
            .notes(request.getNotes())
            .build();

        when(invoiceRepository.findById(5L)).thenReturn(Optional.of(invoice));
        when(paymentMapper.toEntity(request)).thenReturn(paymentEntity);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment payment = invocation.getArgument(0);
            payment.setId(20L);
            return payment;
        });
        when(paymentRepository.sumAmountByInvoiceId(5L)).thenReturn(new BigDecimal("50.00"));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentMapper.toResponseDto(any(Payment.class))).thenReturn(new PaymentResponseDto());

        paymentService.create(request);

        verify(invoiceRepository).save(invoiceCaptor.capture());
        Invoice synced = invoiceCaptor.getValue();

        assertThat(synced.getPaidAmount()).isEqualByComparingTo("50.00");
        assertThat(synced.getRemainingAmount()).isEqualByComparingTo("150.00");
        assertThat(synced.getStatus()).isEqualTo(InvoiceStatus.PARTIALLY_PAID);
    }

    @Test
    void create_shouldRejectPaymentForCancelledInvoice() {
        PaymentRequestDto request = PaymentRequestDto.builder()
            .invoiceId(6L)
            .paymentDate(LocalDate.of(2026, 3, 20))
            .amount(new BigDecimal("20"))
            .method(PaymentMethod.CASH)
            .build();

        Invoice cancelledInvoice = Invoice.builder()
            .id(6L)
            .status(InvoiceStatus.CANCELLED)
            .totalAmount(new BigDecimal("100.00"))
            .build();

        when(invoiceRepository.findById(6L)).thenReturn(Optional.of(cancelledInvoice));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> paymentService.create(request));

        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(exception.getReason()).isEqualTo("Cannot register payment on a CANCELLED invoice");
        verify(paymentRepository, never()).save(any(Payment.class));
    }
}
