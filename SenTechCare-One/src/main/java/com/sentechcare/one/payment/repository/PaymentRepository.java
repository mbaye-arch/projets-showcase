package com.sentechcare.one.payment.repository;

import com.sentechcare.one.common.enums.PaymentMethod;
import com.sentechcare.one.payment.entity.Payment;
import java.math.BigDecimal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {

    Page<Payment> findByInvoiceId(Long invoiceId, Pageable pageable);

    Page<Payment> findByClientId(Long clientId, Pageable pageable);

    Page<Payment> findByMethod(PaymentMethod method, Pageable pageable);

    @Query("select coalesce(sum(p.amount), 0) from Payment p where p.invoice.id = :invoiceId")
    BigDecimal sumAmountByInvoiceId(@Param("invoiceId") Long invoiceId);
}
