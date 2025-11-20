package com.sentechcare.one.invoice.dto;

import com.sentechcare.one.common.enums.InvoiceStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
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
public class InvoiceRequestDto {

    @NotBlank(message = "reference is required")
    @Size(max = 50, message = "reference must not exceed 50 characters")
    private String reference;

    @NotNull(message = "clientId is required")
    private Long clientId;

    @NotNull(message = "issueDate is required")
    private LocalDate issueDate;

    @NotNull(message = "dueDate is required")
    private LocalDate dueDate;

    private InvoiceStatus status;

    @Size(max = 100, message = "paymentMethodNote must not exceed 100 characters")
    private String paymentMethodNote;

    private String notes;

    @NotEmpty(message = "At least one invoice item is required")
    @Valid
    private List<InvoiceItemRequestDto> items;
}
