package com.sentechcare.one.dashboard.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.sentechcare.one.dashboard.dto.DashboardResponseDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.math.BigDecimal;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private DashboardService dashboardService;

    @SuppressWarnings("unchecked")
    @Test
    void getDashboard_shouldAggregateMetrics() {
        TypedQuery<Long> countQuery = (TypedQuery<Long>) org.mockito.Mockito.mock(TypedQuery.class);
        TypedQuery<BigDecimal> amountQuery = (TypedQuery<BigDecimal>) org.mockito.Mockito.mock(TypedQuery.class);

        AtomicInteger countIdx = new AtomicInteger();
        AtomicInteger amountIdx = new AtomicInteger();

        Long[] countValues = {100L, 80L, 30L, 5L, 12L, 3L, 25L, 7L};
        BigDecimal[] amountValues = {new BigDecimal("100000.50"), new BigDecimal("12500.00")};

        when(entityManager.createQuery(anyString(), eq(Long.class))).thenReturn(countQuery);
        when(entityManager.createQuery(anyString(), eq(BigDecimal.class))).thenReturn(amountQuery);

        when(countQuery.setParameter(anyString(), any())).thenReturn(countQuery);
        when(amountQuery.setParameter(anyString(), any())).thenReturn(amountQuery);

        when(countQuery.getSingleResult()).thenAnswer(invocation -> countValues[countIdx.getAndIncrement()]);
        when(amountQuery.getSingleResult()).thenAnswer(invocation -> amountValues[amountIdx.getAndIncrement()]);

        DashboardResponseDto response = dashboardService.getDashboard();

        assertThat(response.getTotalClients()).isEqualTo(100L);
        assertThat(response.getActiveClients()).isEqualTo(80L);
        assertThat(response.getActiveSubscriptions()).isEqualTo(30L);
        assertThat(response.getSubscriptionsExpiringSoon()).isEqualTo(5L);
        assertThat(response.getOpenTickets()).isEqualTo(12L);
        assertThat(response.getInterventionsToday()).isEqualTo(3L);
        assertThat(response.getInterventionsThisMonth()).isEqualTo(25L);
        assertThat(response.getUnpaidInvoices()).isEqualTo(7L);
        assertThat(response.getTotalRevenueCollected()).isEqualByComparingTo("100000.50");
        assertThat(response.getExpectedMonthlyRevenue()).isEqualByComparingTo("12500.00");
    }
}
