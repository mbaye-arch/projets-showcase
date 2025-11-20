package com.sentechcare.one.subscription.repository;

import com.sentechcare.one.common.enums.PlanType;
import com.sentechcare.one.common.enums.SubscriptionStatus;
import com.sentechcare.one.subscription.entity.Subscription;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long>, JpaSpecificationExecutor<Subscription> {

    Page<Subscription> findByClient_Id(Long clientId, Pageable pageable);

    Page<Subscription> findByStatus(SubscriptionStatus status, Pageable pageable);

    Page<Subscription> findByPlanType(PlanType planType, Pageable pageable);

    Page<Subscription> findByClient_IdAndStatus(Long clientId, SubscriptionStatus status, Pageable pageable);

    List<Subscription> findByStatusAndEndDateBefore(SubscriptionStatus status, LocalDate date);
}
