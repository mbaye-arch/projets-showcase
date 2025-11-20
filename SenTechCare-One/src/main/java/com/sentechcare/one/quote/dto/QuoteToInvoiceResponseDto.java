package com.sentechcare.one.quote.dto;

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
public class QuoteToInvoiceResponseDto {

    private Long quoteId;
    private String quoteReference;
    private Long invoiceId;
    private String invoiceReference;
    private LocalDateTime convertedAt;
    private String message;
}
