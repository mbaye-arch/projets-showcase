package com.sentechcare.one.invoice.service;

import com.sentechcare.one.client.entity.Client;
import com.sentechcare.one.client.repository.ClientRepository;
import com.sentechcare.one.common.enums.InvoiceStatus;
import com.sentechcare.one.invoice.dto.InvoiceItemRequestDto;
import com.sentechcare.one.invoice.dto.InvoiceItemResponseDto;
import com.sentechcare.one.invoice.dto.InvoiceRequestDto;
import com.sentechcare.one.invoice.dto.InvoiceResponseDto;
import com.sentechcare.one.invoice.entity.Invoice;
import com.sentechcare.one.invoice.entity.InvoiceItem;
import com.sentechcare.one.invoice.mapper.InvoiceMapper;
import com.sentechcare.one.invoice.repository.InvoiceRepository;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
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
public class InvoiceService {

    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

    private final InvoiceRepository invoiceRepository;
    private final InvoiceMapper invoiceMapper;
    private final ClientRepository clientRepository;

    @Transactional
    public InvoiceResponseDto create(InvoiceRequestDto requestDto) {
        validateRequest(requestDto);

        String normalizedReference = normalizeReference(requestDto.getReference());
        if (invoiceRepository.existsByReferenceIgnoreCase(normalizedReference)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice reference already exists");
        }

        Client client = findClientById(requestDto.getClientId());

        Invoice invoice = invoiceMapper.toEntity(requestDto);
        invoice.setReference(normalizedReference);
        invoice.setClient(client);
        normalize(invoice);

        rebuildItemsAndTotal(invoice, requestDto.getItems());
        applyFinancialsAndStatus(invoice, requestDto.getStatus());

        Invoice saved = invoiceRepository.save(invoice);
        return toResponse(saved);
    }

    @Transactional
    public InvoiceResponseDto update(Long id, InvoiceRequestDto requestDto) {
        validateRequest(requestDto);

        Invoice invoice = findEntityById(id);
        String normalizedReference = normalizeReference(requestDto.getReference());

        if (invoiceRepository.existsByReferenceIgnoreCaseAndIdNot(normalizedReference, id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice reference already exists");
        }

        Client client = findClientById(requestDto.getClientId());

        InvoiceStatus currentStatus = invoice.getStatus();

        invoiceMapper.updateEntityFromDto(requestDto, invoice);
        invoice.setReference(normalizedReference);
        invoice.setClient(client);
        normalize(invoice);

        rebuildItemsAndTotal(invoice, requestDto.getItems());
        applyFinancialsAndStatus(invoice, requestDto.getStatus() == null ? currentStatus : requestDto.getStatus());

        Invoice saved = invoiceRepository.save(invoice);
        return toResponse(saved);
    }

    @Transactional
    public InvoiceResponseDto getById(Long id) {
        Invoice invoice = findEntityById(id);
        invoice = synchronizeFromPayments(invoice);
        return toResponse(invoice);
    }

    @Transactional
    public InvoiceResponseDto getByReference(String reference) {
        if (!StringUtils.hasText(reference)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "reference must not be blank");
        }

        Invoice invoice = invoiceRepository.findByReferenceIgnoreCase(reference.trim())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found for reference: " + reference));

        invoice = synchronizeFromPayments(invoice);
        return toResponse(invoice);
    }

    @Transactional
    public Page<InvoiceResponseDto> getAll(
        Pageable pageable,
        Long clientId,
        InvoiceStatus status,
        LocalDate issueFrom,
        LocalDate issueTo,
        LocalDate dueFrom,
        LocalDate dueTo,
        String search
    ) {
        validateFilterDates(issueFrom, issueTo, dueFrom, dueTo);

        Specification<Invoice> specification = buildSpecification(
            clientId,
            status,
            issueFrom,
            issueTo,
            dueFrom,
            dueTo,
            search
        );

        return invoiceRepository.findAll(specification, pageable)
            .map(this::synchronizeFromPayments)
            .map(this::toResponse);
    }

    @Transactional
    public void delete(Long id) {
        Invoice invoice = findEntityById(id);
        invoice.setStatus(InvoiceStatus.CANCELLED);
        invoiceRepository.save(invoice);
    }

    private Invoice findEntityById(Long id) {
        return invoiceRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found with id: " + id));
    }

    private Client findClientById(Long clientId) {
        return clientRepository.findById(clientId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found with id: " + clientId));
    }

    private void validateRequest(InvoiceRequestDto requestDto) {
        if (requestDto.getItems() == null || requestDto.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one invoice item is required");
        }

        if (requestDto.getIssueDate() != null
            && requestDto.getDueDate() != null
            && requestDto.getDueDate().isBefore(requestDto.getIssueDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dueDate must be greater than or equal to issueDate");
        }
    }

    private void validateFilterDates(LocalDate issueFrom, LocalDate issueTo, LocalDate dueFrom, LocalDate dueTo) {
        if (issueFrom != null && issueTo != null && issueFrom.isAfter(issueTo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "issueFrom must be before or equal to issueTo");
        }

        if (dueFrom != null && dueTo != null && dueFrom.isAfter(dueTo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dueFrom must be before or equal to dueTo");
        }
    }

    private void rebuildItemsAndTotal(Invoice invoice, List<InvoiceItemRequestDto> itemDtos) {
        Set<InvoiceItem> rebuiltItems = new LinkedHashSet<>();
        BigDecimal total = ZERO;

        for (InvoiceItemRequestDto itemDto : itemDtos) {
            validateItem(itemDto);

            InvoiceItem item = invoiceMapper.toItemEntity(itemDto);
            item.setDescription(trimToNull(item.getDescription()));
            item.setInvoice(invoice);

            BigDecimal quantity = scale(item.getQuantity());
            BigDecimal unitPrice = scale(item.getUnitPrice());
            BigDecimal lineTotal = scale(quantity.multiply(unitPrice));

            item.setQuantity(quantity);
            item.setUnitPrice(unitPrice);
            item.setLineTotal(lineTotal);

            total = total.add(lineTotal);
            rebuiltItems.add(item);
        }

        invoice.getItems().clear();
        invoice.getItems().addAll(rebuiltItems);
        invoice.setTotalAmount(scale(total));
    }

    private void validateItem(InvoiceItemRequestDto itemDto) {
        if (!StringUtils.hasText(itemDto.getDescription())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice item description is required");
        }

        if (itemDto.getQuantity() == null || itemDto.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice item quantity must be greater than 0");
        }

        if (itemDto.getUnitPrice() == null || itemDto.getUnitPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice item unitPrice must be greater than or equal to 0");
        }
    }

    private Invoice synchronizeFromPayments(Invoice invoice) {
        InvoiceStatus previousStatus = invoice.getStatus();
        BigDecimal previousPaid = scale(invoice.getPaidAmount());
        BigDecimal previousRemaining = scale(invoice.getRemainingAmount());

        applyFinancialsAndStatus(invoice, previousStatus);

        boolean changed = previousStatus != invoice.getStatus()
            || previousPaid.compareTo(scale(invoice.getPaidAmount())) != 0
            || previousRemaining.compareTo(scale(invoice.getRemainingAmount())) != 0;

        if (changed) {
            return invoiceRepository.save(invoice);
        }

        return invoice;
    }

    private void applyFinancialsAndStatus(Invoice invoice, InvoiceStatus requestedStatus) {
        BigDecimal total = scale(invoice.getTotalAmount());
        BigDecimal paid = invoice.getId() == null ? ZERO : scale(invoiceRepository.sumPaymentsByInvoiceId(invoice.getId()));

        if (paid.compareTo(total) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "paidAmount cannot exceed totalAmount");
        }

        BigDecimal remaining = scale(total.subtract(paid));

        invoice.setTotalAmount(total);
        invoice.setPaidAmount(paid);
        invoice.setRemainingAmount(remaining);
        invoice.setStatus(resolveStatus(requestedStatus, total, paid, remaining));
    }

    private InvoiceStatus resolveStatus(
        InvoiceStatus requestedStatus,
        BigDecimal total,
        BigDecimal paid,
        BigDecimal remaining
    ) {
        if (requestedStatus == InvoiceStatus.CANCELLED) {
            return InvoiceStatus.CANCELLED;
        }

        if (paid.compareTo(ZERO) == 0) {
            if (requestedStatus == InvoiceStatus.DRAFT) {
                return InvoiceStatus.DRAFT;
            }

            if (requestedStatus == InvoiceStatus.ISSUED) {
                return InvoiceStatus.ISSUED;
            }

            return InvoiceStatus.UNPAID;
        }

        if (remaining.compareTo(ZERO) == 0 && total.compareTo(ZERO) >= 0) {
            return InvoiceStatus.PAID;
        }

        return InvoiceStatus.PARTIALLY_PAID;
    }

    private Specification<Invoice> buildSpecification(
        Long clientId,
        InvoiceStatus status,
        LocalDate issueFrom,
        LocalDate issueTo,
        LocalDate dueFrom,
        LocalDate dueTo,
        String search
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (clientId != null) {
                predicates.add(criteriaBuilder.equal(root.get("client").get("id"), clientId));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (issueFrom != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("issueDate"), issueFrom));
            }

            if (issueTo != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("issueDate"), issueTo));
            }

            if (dueFrom != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("dueDate"), dueFrom));
            }

            if (dueTo != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("dueDate"), dueTo));
            }

            if (StringUtils.hasText(search)) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("reference")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("notes")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("paymentMethodNote")), like)
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private InvoiceResponseDto toResponse(Invoice invoice) {
        InvoiceResponseDto response = invoiceMapper.toResponseDto(invoice);

        List<InvoiceItemResponseDto> items = invoice.getItems().stream()
            .sorted(java.util.Comparator.comparing(InvoiceItem::getId, Comparator.nullsLast(Comparator.naturalOrder())))
            .map(invoiceMapper::toItemResponseDto)
            .toList();

        response.setItems(items);
        return response;
    }

    private void normalize(Invoice invoice) {
        invoice.setReference(normalizeReference(invoice.getReference()));
        invoice.setPaymentMethodNote(trimToNull(invoice.getPaymentMethodNote()));
        invoice.setNotes(trimToNull(invoice.getNotes()));
    }

    private String normalizeReference(String reference) {
        String normalized = trimToNull(reference);
        return normalized == null ? null : normalized.toUpperCase();
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
