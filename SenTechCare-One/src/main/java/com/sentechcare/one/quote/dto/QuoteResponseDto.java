package com.sentechcare.one.quote.dto;

import com.sentechcare.one.common.enums.QuoteStatus;
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
public class QuoteResponseDto {

    private Long id;
    private String reference;
    private Long clientId;
    private LocalDate quoteDate;
    private QuoteStatus status;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String notes;
    private List<QuoteItemResponseDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
