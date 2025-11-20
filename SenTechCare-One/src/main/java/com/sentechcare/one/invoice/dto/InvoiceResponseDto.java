package com.sentechcare.one.invoice.dto;

import com.sentechcare.one.common.enums.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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
public class InvoiceResponseDto {

    private Long id;
    private String reference;
    private Long clientId;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private InvoiceStatus status;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private String paymentMethodNote;
    private String notes;
    private List<InvoiceItemResponseDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
