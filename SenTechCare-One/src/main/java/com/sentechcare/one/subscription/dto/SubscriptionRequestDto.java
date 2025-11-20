package com.sentechcare.one.subscription.dto;

import com.sentechcare.one.common.enums.PlanType;
import com.sentechcare.one.common.enums.SubscriptionStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
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
public class SubscriptionRequestDto {

    @NotNull(message = "clientId is required")
    private Long clientId;

    @NotNull(message = "planType is required")
    private PlanType planType;

    @NotNull(message = "monthlyPrice is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "monthlyPrice must be greater than or equal to 0")
    private BigDecimal monthlyPrice;

    @NotNull(message = "startDate is required")
    private LocalDate startDate;

    private LocalDate endDate;

    @Size(max = 20, message = "billingFrequency must not exceed 20 characters")
    private String billingFrequency;

    private SubscriptionStatus status;

    @Size(max = 255, message = "description must not exceed 255 characters")
    private String description;

    private String notes;
}
