package com.sentechcare.one.payment.service;

import com.sentechcare.one.common.enums.InvoiceStatus;
import com.sentechcare.one.common.enums.PaymentMethod;
import com.sentechcare.one.invoice.entity.Invoice;
import com.sentechcare.one.invoice.repository.InvoiceRepository;
import com.sentechcare.one.payment.dto.PaymentRequestDto;
import com.sentechcare.one.payment.dto.PaymentResponseDto;
import com.sentechcare.one.payment.entity.Payment;
import com.sentechcare.one.payment.mapper.PaymentMapper;
import com.sentechcare.one.payment.repository.PaymentRepository;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {

    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final InvoiceRepository invoiceRepository;

    @Transactional
    public PaymentResponseDto create(PaymentRequestDto requestDto) {
        validateRequest(requestDto);

        Invoice invoice = findInvoiceById(requestDto.getInvoiceId());
        validatePayableInvoice(invoice);

        Payment payment = paymentMapper.toEntity(requestDto);
        payment.setInvoice(invoice);
        normalize(payment);
        payment.setAmount(scale(payment.getAmount()));

        Payment saved = paymentRepository.save(payment);
        synchronizeInvoiceFinancials(invoice.getId());
        return paymentMapper.toResponseDto(saved);
    }

    @Transactional
    public PaymentResponseDto update(Long id, PaymentRequestDto requestDto) {
        validateRequest(requestDto);

        Payment payment = findEntityById(id);
        Long previousInvoiceId = payment.getInvoice().getId();

        Invoice targetInvoice = findInvoiceById(requestDto.getInvoiceId());
        validatePayableInvoice(targetInvoice);

        paymentMapper.updateEntityFromDto(requestDto, payment);
        payment.setInvoice(targetInvoice);
        normalize(payment);
        payment.setAmount(scale(payment.getAmount()));

        Payment saved = paymentRepository.save(payment);

        if (!previousInvoiceId.equals(targetInvoice.getId())) {
            synchronizeInvoiceFinancials(previousInvoiceId);
        }
        synchronizeInvoiceFinancials(targetInvoice.getId());

        return paymentMapper.toResponseDto(saved);
    }

    public PaymentResponseDto getById(Long id) {
        return paymentMapper.toResponseDto(findEntityById(id));
    }

    public Page<PaymentResponseDto> getAll(
        Pageable pageable,
        Long invoiceId,
        Long clientId,
        PaymentMethod method,
        LocalDate paymentDateFrom,
        LocalDate paymentDateTo,
        String search
    ) {
        validateDateRange(paymentDateFrom, paymentDateTo);

        Specification<Payment> specification = buildSpecification(
            invoiceId,
            clientId,
            method,
            paymentDateFrom,
            paymentDateTo,
            search
        );

        return paymentRepository.findAll(specification, pageable)
            .map(paymentMapper::toResponseDto);
    }

    public Page<PaymentResponseDto> getByInvoice(Long invoiceId, Pageable pageable) {
        findInvoiceById(invoiceId);
        return paymentRepository.findByInvoiceId(invoiceId, pageable)
            .map(paymentMapper::toResponseDto);
    }

    @Transactional
    public void delete(Long id) {
        Payment payment = findEntityById(id);
        Long invoiceId = payment.getInvoice().getId();

        paymentRepository.delete(payment);
        synchronizeInvoiceFinancials(invoiceId);
    }

    private Payment findEntityById(Long id) {
        return paymentRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found with id: " + id));
    }

    private Invoice findInvoiceById(Long invoiceId) {
        return invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found with id: " + invoiceId));
    }

    private void validatePayableInvoice(Invoice invoice) {
        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot register payment on a CANCELLED invoice");
        }
    }

    private void validateRequest(PaymentRequestDto requestDto) {
        if (requestDto.getPaymentDate() != null
            && requestDto.getPaymentDate().isAfter(LocalDate.now().plusDays(1))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "paymentDate is not valid");
        }

        if (requestDto.getAmount() != null && requestDto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "amount must be greater than 0");
        }
    }

    private void validateDateRange(LocalDate paymentDateFrom, LocalDate paymentDateTo) {
        if (paymentDateFrom != null && paymentDateTo != null && paymentDateFrom.isAfter(paymentDateTo)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "paymentDateFrom must be before or equal to paymentDateTo"
            );
        }
    }

    private Specification<Payment> buildSpecification(
        Long invoiceId,
        Long clientId,
        PaymentMethod method,
        LocalDate paymentDateFrom,
        LocalDate paymentDateTo,
        String search
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (invoiceId != null) {
                predicates.add(criteriaBuilder.equal(root.get("invoice").get("id"), invoiceId));
            }

            if (clientId != null) {
                predicates.add(criteriaBuilder.equal(root.get("client").get("id"), clientId));
            }

            if (method != null) {
                predicates.add(criteriaBuilder.equal(root.get("method"), method));
            }

            if (paymentDateFrom != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("paymentDate"), paymentDateFrom));
            }

            if (paymentDateTo != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("paymentDate"), paymentDateTo));
            }

            if (StringUtils.hasText(search)) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("paymentReference")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("notes")), like)
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private void synchronizeInvoiceFinancials(Long invoiceId) {
        Invoice invoice = findInvoiceById(invoiceId);

        BigDecimal totalAmount = scale(invoice.getTotalAmount());
        BigDecimal paidAmount = scale(paymentRepository.sumAmountByInvoiceId(invoiceId));

        if (paidAmount.compareTo(totalAmount) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "paidAmount cannot exceed totalAmount");
        }

        BigDecimal remainingAmount = scale(totalAmount.subtract(paidAmount));
        InvoiceStatus nextStatus = resolveInvoiceStatus(invoice.getStatus(), totalAmount, paidAmount, remainingAmount);

        invoice.setTotalAmount(totalAmount);
        invoice.setPaidAmount(paidAmount);
        invoice.setRemainingAmount(remainingAmount);
        invoice.setStatus(nextStatus);

        invoiceRepository.save(invoice);
    }

    private InvoiceStatus resolveInvoiceStatus(
        InvoiceStatus currentStatus,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal remainingAmount
    ) {
        if (currentStatus == InvoiceStatus.CANCELLED) {
            return InvoiceStatus.CANCELLED;
        }

        if (paidAmount.compareTo(ZERO) == 0) {
            if (currentStatus == InvoiceStatus.DRAFT) {
                return InvoiceStatus.DRAFT;
            }

            if (currentStatus == InvoiceStatus.ISSUED) {
                return InvoiceStatus.ISSUED;
            }

            return InvoiceStatus.UNPAID;
        }

        if (remainingAmount.compareTo(ZERO) == 0 && totalAmount.compareTo(ZERO) >= 0) {
            return InvoiceStatus.PAID;
        }

        return InvoiceStatus.PARTIALLY_PAID;
    }

    private void normalize(Payment payment) {
        payment.setPaymentReference(trimToNull(payment.getPaymentReference()));
        payment.setNotes(trimToNull(payment.getNotes()));
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private BigDecimal scale(BigDecimal value) {
        if (value == null) {
            return ZERO;
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
