package com.sentechcare.one.subscription.dto;

import com.sentechcare.one.common.enums.PlanType;
import com.sentechcare.one.common.enums.SubscriptionStatus;
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
public class SubscriptionResponseDto {

    private Long id;
    private Long clientId;
    private PlanType planType;
    private BigDecimal monthlyPrice;
    private LocalDate startDate;
    private LocalDate endDate;
    private String billingFrequency;
    private SubscriptionStatus status;
    private String description;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
