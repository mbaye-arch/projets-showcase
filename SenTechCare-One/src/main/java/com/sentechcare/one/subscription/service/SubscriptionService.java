package com.sentechcare.one.subscription.service;

import com.sentechcare.one.client.entity.Client;
import com.sentechcare.one.client.repository.ClientRepository;
import com.sentechcare.one.common.enums.PlanType;
import com.sentechcare.one.common.enums.SubscriptionStatus;
import com.sentechcare.one.subscription.dto.SubscriptionRequestDto;
import com.sentechcare.one.subscription.dto.SubscriptionResponseDto;
import com.sentechcare.one.subscription.entity.Subscription;
import com.sentechcare.one.subscription.mapper.SubscriptionMapper;
import com.sentechcare.one.subscription.repository.SubscriptionRepository;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
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
public class SubscriptionService {

    private static final Set<String> ALLOWED_FREQUENCIES = Set.of(
        "MONTHLY",
        "QUARTERLY",
        "SEMI_ANNUAL",
        "ANNUAL"
    );

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionMapper subscriptionMapper;
    private final ClientRepository clientRepository;

    @Transactional
    public SubscriptionResponseDto create(SubscriptionRequestDto requestDto) {
        validateRequest(requestDto);

        Client client = findClientById(requestDto.getClientId());

        Subscription entity = subscriptionMapper.toEntity(requestDto);
        entity.setClient(client);
        normalize(entity);

        if (entity.getBillingFrequency() == null) {
            entity.setBillingFrequency("MONTHLY");
        }

        if (entity.getStatus() == null) {
            entity.setStatus(SubscriptionStatus.ACTIVE);
        }

        Subscription saved = subscriptionRepository.save(entity);
        return subscriptionMapper.toResponseDto(saved);
    }

    @Transactional
    public SubscriptionResponseDto update(Long id, SubscriptionRequestDto requestDto) {
        validateRequest(requestDto);

        Subscription entity = findEntityById(id);
        Client client = findClientById(requestDto.getClientId());

        String currentFrequency = entity.getBillingFrequency();
        SubscriptionStatus currentStatus = entity.getStatus();

        subscriptionMapper.updateEntityFromDto(requestDto, entity);
        entity.setClient(client);
        normalize(entity);

        if (requestDto.getBillingFrequency() == null) {
            entity.setBillingFrequency(currentFrequency);
        }

        if (!StringUtils.hasText(entity.getBillingFrequency())) {
            entity.setBillingFrequency("MONTHLY");
        }

        if (requestDto.getStatus() == null) {
            entity.setStatus(currentStatus == null ? SubscriptionStatus.ACTIVE : currentStatus);
        }

        Subscription saved = subscriptionRepository.save(entity);
        return subscriptionMapper.toResponseDto(saved);
    }

    public SubscriptionResponseDto getById(Long id) {
        return subscriptionMapper.toResponseDto(findEntityById(id));
    }

    public Page<SubscriptionResponseDto> getAll(
        Pageable pageable,
        Long clientId,
        SubscriptionStatus status,
        PlanType planType,
        Boolean expired
    ) {
        Specification<Subscription> specification = buildSpecification(clientId, status, planType, expired);
        return subscriptionRepository.findAll(specification, pageable)
            .map(subscriptionMapper::toResponseDto);
    }

    public Page<SubscriptionResponseDto> getActive(Pageable pageable) {
        LocalDate today = LocalDate.now();
        Specification<Subscription> specification = (root, query, criteriaBuilder) -> criteriaBuilder.and(
            criteriaBuilder.equal(root.get("status"), SubscriptionStatus.ACTIVE),
            criteriaBuilder.or(
                criteriaBuilder.isNull(root.get("endDate")),
                criteriaBuilder.greaterThanOrEqualTo(root.get("endDate"), today)
            )
        );
        return subscriptionRepository.findAll(specification, pageable)
            .map(subscriptionMapper::toResponseDto);
    }

    public Page<SubscriptionResponseDto> getExpired(Pageable pageable) {
        LocalDate today = LocalDate.now();
        Specification<Subscription> specification = (root, query, criteriaBuilder) -> criteriaBuilder.and(
            criteriaBuilder.isNotNull(root.get("endDate")),
            criteriaBuilder.lessThan(root.get("endDate"), today)
        );
        return subscriptionRepository.findAll(specification, pageable)
            .map(subscriptionMapper::toResponseDto);
    }

    @Transactional
    public void delete(Long id) {
        Subscription entity = findEntityById(id);
        entity.setStatus(SubscriptionStatus.CANCELLED);
        if (entity.getEndDate() == null) {
            entity.setEndDate(LocalDate.now());
        }
        subscriptionRepository.save(entity);
    }

    private Subscription findEntityById(Long id) {
        return subscriptionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Subscription not found with id: " + id
            ));
    }

    private Client findClientById(Long clientId) {
        return clientRepository.findById(clientId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Client not found with id: " + clientId
            ));
    }

    private void validateRequest(SubscriptionRequestDto requestDto) {
        if (requestDto.getMonthlyPrice() != null
            && requestDto.getMonthlyPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "monthlyPrice cannot be negative");
        }

        if (requestDto.getStartDate() != null
            && requestDto.getEndDate() != null
            && requestDto.getEndDate().isBefore(requestDto.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endDate must be greater than or equal to startDate");
        }

        if (StringUtils.hasText(requestDto.getBillingFrequency())) {
            String normalizedFrequency = requestDto.getBillingFrequency().trim().toUpperCase();
            if (!ALLOWED_FREQUENCIES.contains(normalizedFrequency)) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "billingFrequency must be one of: MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL"
                );
            }
        }
    }

    private Specification<Subscription> buildSpecification(
        Long clientId,
        SubscriptionStatus status,
        PlanType planType,
        Boolean expired
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (clientId != null) {
                predicates.add(criteriaBuilder.equal(root.get("client").get("id"), clientId));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (planType != null) {
                predicates.add(criteriaBuilder.equal(root.get("planType"), planType));
            }

            if (expired != null) {
                LocalDate today = LocalDate.now();
                if (Boolean.TRUE.equals(expired)) {
                    predicates.add(criteriaBuilder.and(
                        criteriaBuilder.isNotNull(root.get("endDate")),
                        criteriaBuilder.lessThan(root.get("endDate"), today)
                    ));
                } else {
                    predicates.add(criteriaBuilder.or(
                        criteriaBuilder.isNull(root.get("endDate")),
                        criteriaBuilder.greaterThanOrEqualTo(root.get("endDate"), today)
                    ));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private void normalize(Subscription entity) {
        entity.setBillingFrequency(toUpperCase(trimToNull(entity.getBillingFrequency())));
        entity.setDescription(trimToNull(entity.getDescription()));
        entity.setNotes(trimToNull(entity.getNotes()));
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private String toUpperCase(String value) {
        return value == null ? null : value.toUpperCase();
    }
}
