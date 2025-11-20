package com.sentechcare.one.quote.service;

import com.sentechcare.one.client.entity.Client;
import com.sentechcare.one.client.repository.ClientRepository;
import com.sentechcare.one.common.enums.InvoiceStatus;
import com.sentechcare.one.common.enums.QuoteStatus;
import com.sentechcare.one.invoice.entity.Invoice;
import com.sentechcare.one.invoice.entity.InvoiceItem;
import com.sentechcare.one.invoice.repository.InvoiceRepository;
import com.sentechcare.one.quote.dto.QuoteItemRequestDto;
import com.sentechcare.one.quote.dto.QuoteItemResponseDto;
import com.sentechcare.one.quote.dto.QuoteRequestDto;
import com.sentechcare.one.quote.dto.QuoteResponseDto;
import com.sentechcare.one.quote.dto.QuoteToInvoiceResponseDto;
import com.sentechcare.one.quote.entity.Quote;
import com.sentechcare.one.quote.entity.QuoteItem;
import com.sentechcare.one.quote.mapper.QuoteMapper;
import com.sentechcare.one.quote.repository.QuoteRepository;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
public class QuoteService {

    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

    private final QuoteRepository quoteRepository;
    private final QuoteMapper quoteMapper;
    private final ClientRepository clientRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional
    public QuoteResponseDto create(QuoteRequestDto requestDto) {
        validateRequest(requestDto);

        String normalizedReference = normalizeReference(requestDto.getReference());
        if (quoteRepository.existsByReferenceIgnoreCase(normalizedReference)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quote reference already exists");
        }

        Client client = findClientById(requestDto.getClientId());

        Quote quote = quoteMapper.toEntity(requestDto);
        quote.setReference(normalizedReference);
        quote.setClient(client);
        normalize(quote);

        if (quote.getStatus() == null) {
            quote.setStatus(QuoteStatus.DRAFT);
        }

        rebuildItemsAndAmounts(quote, requestDto.getItems(), requestDto.getDiscountAmount());

        Quote saved = quoteRepository.save(quote);
        return toResponse(saved);
    }

    @Transactional
    public QuoteResponseDto update(Long id, QuoteRequestDto requestDto) {
        validateRequest(requestDto);

        Quote quote = findEntityById(id);
        String normalizedReference = normalizeReference(requestDto.getReference());

        if (quoteRepository.existsByReferenceIgnoreCaseAndIdNot(normalizedReference, id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quote reference already exists");
        }

        Client client = findClientById(requestDto.getClientId());

        QuoteStatus currentStatus = quote.getStatus();

        quoteMapper.updateEntityFromDto(requestDto, quote);
        quote.setReference(normalizedReference);
        quote.setClient(client);
        normalize(quote);

        if (requestDto.getStatus() == null) {
            quote.setStatus(currentStatus == null ? QuoteStatus.DRAFT : currentStatus);
        }

        rebuildItemsAndAmounts(quote, requestDto.getItems(), requestDto.getDiscountAmount());

        Quote saved = quoteRepository.save(quote);
        return toResponse(saved);
    }

    public QuoteResponseDto getById(Long id) {
        return toResponse(findEntityById(id));
    }

    public QuoteResponseDto getByReference(String reference) {
        if (!StringUtils.hasText(reference)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "reference must not be blank");
        }

        Quote quote = quoteRepository.findByReferenceIgnoreCase(reference.trim())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote not found for reference: " + reference));

        return toResponse(quote);
    }

    public Page<QuoteResponseDto> getAll(
        Pageable pageable,
        Long clientId,
        QuoteStatus status,
        LocalDate dateFrom,
        LocalDate dateTo,
        String search
    ) {
        if (dateFrom != null && dateTo != null && dateFrom.isAfter(dateTo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dateFrom must be before or equal to dateTo");
        }

        Specification<Quote> specification = buildSpecification(clientId, status, dateFrom, dateTo, search);

        return quoteRepository.findAll(specification, pageable)
            .map(this::toResponse);
    }

    @Transactional
    public void delete(Long id) {
        Quote quote = findEntityById(id);
        quote.setStatus(QuoteStatus.EXPIRED);
        quoteRepository.save(quote);
    }

    @Transactional
    public QuoteToInvoiceResponseDto convertToInvoice(Long quoteId) {
        Quote quote = findEntityById(quoteId);

        if (quote.getItems() == null || quote.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot convert quote without items");
        }

        BigDecimal discountAmount = scale(quote.getDiscountAmount());
        if (discountAmount.compareTo(ZERO) > 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Cannot convert quote with discount automatically; create invoice manually"
            );
        }

        String invoiceReference = generateInvoiceReference(quote.getReference());
        LocalDate issueDate = LocalDate.now();
        Invoice invoice = Invoice.builder()
            .reference(invoiceReference)
            .client(quote.getClient())
            .issueDate(issueDate)
            .dueDate(issueDate.plusDays(30))
            .paymentMethodNote(null)
            .notes(buildInvoiceNotes(quote))
            .build();

        Set<InvoiceItem> invoiceItems = new LinkedHashSet<>();
        BigDecimal totalAmount = ZERO;
        quote.getItems().stream()
            .sorted(Comparator.comparing(QuoteItem::getId, Comparator.nullsLast(Comparator.naturalOrder())))
            .forEach(quoteItem -> {
                BigDecimal quantity = scale(quoteItem.getQuantity());
                BigDecimal unitPrice = scale(quoteItem.getUnitPrice());
                BigDecimal lineTotal = scale(quantity.multiply(unitPrice));

                InvoiceItem invoiceItem = InvoiceItem.builder()
                    .invoice(invoice)
                    .description(trimToNull(quoteItem.getDescription()))
                    .quantity(quantity)
                    .unitPrice(unitPrice)
                    .lineTotal(lineTotal)
                    .build();
                invoiceItems.add(invoiceItem);
            });

        for (InvoiceItem invoiceItem : invoiceItems) {
            totalAmount = totalAmount.add(scale(invoiceItem.getLineTotal()));
        }

        totalAmount = scale(totalAmount);

        invoice.getItems().clear();
        invoice.getItems().addAll(invoiceItems);
        invoice.setTotalAmount(totalAmount);
        invoice.setPaidAmount(ZERO);
        invoice.setRemainingAmount(totalAmount);
        invoice.setStatus(totalAmount.compareTo(ZERO) == 0 ? InvoiceStatus.PAID : InvoiceStatus.UNPAID);

        Invoice savedInvoice = invoiceRepository.save(invoice);

        if (quote.getStatus() != QuoteStatus.ACCEPTED) {
            quote.setStatus(QuoteStatus.ACCEPTED);
            quoteRepository.save(quote);
        }

        return QuoteToInvoiceResponseDto.builder()
            .quoteId(quote.getId())
            .quoteReference(quote.getReference())
            .invoiceId(savedInvoice.getId())
            .invoiceReference(savedInvoice.getReference())
            .convertedAt(LocalDateTime.now())
            .message("Quote converted successfully")
            .build();
    }

    private Quote findEntityById(Long id) {
        return quoteRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote not found with id: " + id));
    }

    private Client findClientById(Long clientId) {
        return clientRepository.findById(clientId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found with id: " + clientId));
    }

    private void validateRequest(QuoteRequestDto requestDto) {
        if (requestDto.getItems() == null || requestDto.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one quote item is required");
        }

        if (requestDto.getDiscountAmount() != null && requestDto.getDiscountAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "discountAmount cannot be negative");
        }
    }

    private void rebuildItemsAndAmounts(Quote quote, List<QuoteItemRequestDto> itemDtos, BigDecimal discountAmountInput) {
        Set<QuoteItem> rebuiltItems = new LinkedHashSet<>();
        BigDecimal subtotal = ZERO;

        for (QuoteItemRequestDto itemDto : itemDtos) {
            validateItem(itemDto);

            QuoteItem item = quoteMapper.toItemEntity(itemDto);
            item.setDescription(trimToNull(item.getDescription()));
            item.setQuote(quote);

            BigDecimal quantity = scale(item.getQuantity());
            BigDecimal unitPrice = scale(item.getUnitPrice());
            BigDecimal lineTotal = scale(quantity.multiply(unitPrice));

            item.setQuantity(quantity);
            item.setUnitPrice(unitPrice);
            item.setLineTotal(lineTotal);

            subtotal = subtotal.add(lineTotal);
            rebuiltItems.add(item);
        }

        BigDecimal discountAmount = discountAmountInput == null ? ZERO : scale(discountAmountInput);
        if (discountAmount.compareTo(subtotal) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "discountAmount cannot exceed subtotal");
        }

        BigDecimal totalAmount = scale(subtotal.subtract(discountAmount));

        quote.getItems().clear();
        quote.getItems().addAll(rebuiltItems);
        quote.setSubtotal(scale(subtotal));
        quote.setDiscountAmount(discountAmount);
        quote.setTotalAmount(totalAmount);
    }

    private void validateItem(QuoteItemRequestDto itemDto) {
        if (!StringUtils.hasText(itemDto.getDescription())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quote item description is required");
        }

        if (itemDto.getQuantity() == null || itemDto.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quote item quantity must be greater than 0");
        }

        if (itemDto.getUnitPrice() == null || itemDto.getUnitPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quote item unitPrice must be greater than or equal to 0");
        }
    }

    private Specification<Quote> buildSpecification(
        Long clientId,
        QuoteStatus status,
        LocalDate dateFrom,
        LocalDate dateTo,
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

            if (dateFrom != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("quoteDate"), dateFrom));
            }

            if (dateTo != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("quoteDate"), dateTo));
            }

            if (StringUtils.hasText(search)) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("reference")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("notes")), like)
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private QuoteResponseDto toResponse(Quote quote) {
        QuoteResponseDto response = quoteMapper.toResponseDto(quote);

        List<QuoteItemResponseDto> items = quote.getItems().stream()
            .sorted(Comparator.comparing(QuoteItem::getId, Comparator.nullsLast(Comparator.naturalOrder())))
            .map(quoteMapper::toItemResponseDto)
            .toList();

        response.setItems(items);
        return response;
    }

    private void normalize(Quote quote) {
        quote.setReference(normalizeReference(quote.getReference()));
        quote.setNotes(trimToNull(quote.getNotes()));
    }

    private String normalizeReference(String reference) {
        String normalized = trimToNull(reference);
        return normalized == null ? null : normalized.toUpperCase();
    }

    private String generateInvoiceReference(String quoteReference) {
        String normalizedQuoteReference = normalizeReference(quoteReference);
        String baseReference;

        if (!StringUtils.hasText(normalizedQuoteReference)) {
            baseReference = "FAC-" + LocalDate.now();
        } else if (normalizedQuoteReference.startsWith("DV-")) {
            baseReference = "FAC-" + normalizedQuoteReference.substring(3);
        } else {
            baseReference = "FAC-" + normalizedQuoteReference;
        }

        String candidate = baseReference;
        int sequence = 1;
        while (invoiceRepository.existsByReferenceIgnoreCase(candidate)) {
            candidate = baseReference + "-" + sequence;
            sequence++;
        }
        return candidate;
    }

    private String buildInvoiceNotes(Quote quote) {
        String quoteRef = normalizeReference(quote.getReference());
        String baseNote = "Converted from quote: " + (quoteRef == null ? quote.getId() : quoteRef);
        String quoteNotes = trimToNull(quote.getNotes());

        if (!StringUtils.hasText(quoteNotes)) {
            return baseNote;
        }

        return baseNote + "\n" + quoteNotes;
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
