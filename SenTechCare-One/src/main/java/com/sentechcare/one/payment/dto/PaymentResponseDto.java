package com.sentechcare.one.payment.dto;

import com.sentechcare.one.common.enums.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDto {

    private Long id;
    private Long invoiceId;
    private Long clientId;
    private LocalDate paymentDate;
    private BigDecimal amount;
    private PaymentMethod method;
    private String paymentReference;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
