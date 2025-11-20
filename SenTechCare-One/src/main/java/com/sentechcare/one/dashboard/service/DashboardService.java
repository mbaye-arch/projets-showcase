package com.sentechcare.one.dashboard.service;

import com.sentechcare.one.common.enums.InvoiceStatus;
import com.sentechcare.one.common.enums.SubscriptionStatus;
import com.sentechcare.one.common.enums.TicketStatus;
import com.sentechcare.one.dashboard.dto.DashboardResponseDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    @PersistenceContext
    private EntityManager entityManager;

    public DashboardResponseDto getDashboard() {
        LocalDate today = LocalDate.now();
        LocalDate soonDate = today.plusDays(30);

        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = today.withDayOfMonth(today.lengthOfMonth()).atTime(LocalTime.MAX);

        long totalClients = count("select count(c) from Client c");
        long activeClients = count("select count(c) from Client c where c.active = true");

        long activeSubscriptions = count(
            "select count(s) from Subscription s " +
            "where s.status = :status and (s.endDate is null or s.endDate >= :today)",
            "status",
            SubscriptionStatus.ACTIVE,
            "today",
            today
        );

        long subscriptionsExpiringSoon = count(
            "select count(s) from Subscription s " +
            "where s.status = :status and s.endDate is not null and s.endDate between :today and :soonDate",
            "status",
            SubscriptionStatus.ACTIVE,
            "today",
            today,
            "soonDate",
            soonDate
        );

        long openTickets = count(
            "select count(t) from Ticket t where t.status in (:openStatus, :inProgressStatus)",
            "openStatus",
            TicketStatus.OPEN,
            "inProgressStatus",
            TicketStatus.IN_PROGRESS
        );

        long interventionsToday = count(
            "select count(i) from Intervention i where i.plannedDate between :startOfDay and :endOfDay",
            "startOfDay",
            startOfDay,
            "endOfDay",
            endOfDay
        );

        long interventionsThisMonth = count(
            "select count(i) from Intervention i where i.plannedDate between :startOfMonth and :endOfMonth",
            "startOfMonth",
            startOfMonth,
            "endOfMonth",
            endOfMonth
        );

        long unpaidInvoices = count(
            "select count(i) from Invoice i where i.status in (:unpaidStatus, :partiallyPaidStatus)",
            "unpaidStatus",
            InvoiceStatus.UNPAID,
            "partiallyPaidStatus",
            InvoiceStatus.PARTIALLY_PAID
        );

        BigDecimal totalRevenueCollected = amount("select coalesce(sum(p.amount), 0) from Payment p");

        BigDecimal expectedMonthlyRevenue = amount(
            "select coalesce(sum(s.monthlyPrice), 0) from Subscription s " +
            "where s.status = :status and (s.endDate is null or s.endDate >= :today)",
            "status",
            SubscriptionStatus.ACTIVE,
            "today",
            today
        );

        return DashboardResponseDto.builder()
            .totalClients(totalClients)
            .activeClients(activeClients)
            .activeSubscriptions(activeSubscriptions)
            .subscriptionsExpiringSoon(subscriptionsExpiringSoon)
            .openTickets(openTickets)
            .interventionsToday(interventionsToday)
            .interventionsThisMonth(interventionsThisMonth)
            .unpaidInvoices(unpaidInvoices)
            .totalRevenueCollected(totalRevenueCollected)
            .expectedMonthlyRevenue(expectedMonthlyRevenue)
            .build();
    }

    private long count(String jpql, Object... params) {
        var query = entityManager.createQuery(jpql, Long.class);
        applyParams(query, params);
        Long result = query.getSingleResult();
        return result == null ? 0L : result;
    }

    private BigDecimal amount(String jpql, Object... params) {
        var query = entityManager.createQuery(jpql, BigDecimal.class);
        applyParams(query, params);
        BigDecimal result = query.getSingleResult();
        return result == null ? BigDecimal.ZERO : result;
    }

    private void applyParams(jakarta.persistence.Query query, Object... params) {
        for (int i = 0; i < params.length; i += 2) {
            String name = (String) params[i];
            Object value = params[i + 1];
            query.setParameter(name, value);
        }
    }
}
