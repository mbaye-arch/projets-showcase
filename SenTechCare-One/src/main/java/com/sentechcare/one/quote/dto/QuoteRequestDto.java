package com.sentechcare.one.quote.dto;

import com.sentechcare.one.common.enums.QuoteStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
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
public class QuoteRequestDto {

    @NotBlank(message = "reference is required")
    @Size(max = 50, message = "reference must not exceed 50 characters")
    private String reference;

    @NotNull(message = "clientId is required")
    private Long clientId;

    @NotNull(message = "quoteDate is required")
    private LocalDate quoteDate;

    private QuoteStatus status;

    @DecimalMin(value = "0.0", inclusive = true, message = "discountAmount must be greater than or equal to 0")
    private BigDecimal discountAmount;

    private String notes;

    @NotEmpty(message = "At least one quote item is required")
    @Valid
    private List<QuoteItemRequestDto> items;
}
