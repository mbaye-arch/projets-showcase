package com.sentechcare.one.dashboard.dto;

import java.math.BigDecimal;
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
public class DashboardResponseDto {

    private long totalClients;
    private long activeClients;
    private long activeSubscriptions;
    private long subscriptionsExpiringSoon;
    private long openTickets;
    private long interventionsToday;
    private long interventionsThisMonth;
    private long unpaidInvoices;
    private BigDecimal totalRevenueCollected;
    private BigDecimal expectedMonthlyRevenue;
}
