package com.sentechcare.one.intervention.service;

import com.sentechcare.one.client.entity.Client;
import com.sentechcare.one.client.repository.ClientRepository;
import com.sentechcare.one.common.constants.RoleConstants;
import com.sentechcare.one.common.enums.InterventionStatus;
import com.sentechcare.one.common.enums.InterventionType;
import com.sentechcare.one.common.enums.PriorityLevel;
import com.sentechcare.one.intervention.dto.InterventionRequestDto;
import com.sentechcare.one.intervention.dto.InterventionResponseDto;
import com.sentechcare.one.intervention.entity.Intervention;
import com.sentechcare.one.intervention.mapper.InterventionMapper;
import com.sentechcare.one.intervention.repository.InterventionRepository;
import com.sentechcare.one.user.entity.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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
public class InterventionService {

    private final InterventionRepository interventionRepository;
    private final InterventionMapper interventionMapper;
    private final ClientRepository clientRepository;
    private final EntityManager entityManager;

    @Transactional
    public InterventionResponseDto create(InterventionRequestDto requestDto) {
        validateRequest(requestDto);

        Client client = findClientById(requestDto.getClientId());
        User technician = findTechnicianIfProvided(requestDto.getAssignedTechnicianId());

        Intervention entity = interventionMapper.toEntity(requestDto);
        entity.setClient(client);
        entity.setAssignedTechnician(technician);
        normalize(entity);

        if (entity.getStatus() == null) {
            entity.setStatus(InterventionStatus.PENDING);
        }

        if (entity.getPriority() == null) {
            entity.setPriority(PriorityLevel.NORMAL);
        }

        if (entity.getCost() == null) {
            entity.setCost(BigDecimal.ZERO);
        }

        Intervention saved = interventionRepository.save(entity);
        return interventionMapper.toResponseDto(saved);
    }

    @Transactional
    public InterventionResponseDto update(Long id, InterventionRequestDto requestDto) {
        validateRequest(requestDto);

        Intervention entity = findEntityById(id);
        Client client = findClientById(requestDto.getClientId());
        User technician = findTechnicianIfProvided(requestDto.getAssignedTechnicianId());

        InterventionStatus currentStatus = entity.getStatus();
        PriorityLevel currentPriority = entity.getPriority();
        BigDecimal currentCost = entity.getCost();

        interventionMapper.updateEntityFromDto(requestDto, entity);
        entity.setClient(client);
        entity.setAssignedTechnician(technician);
        normalize(entity);

        if (requestDto.getStatus() == null) {
            entity.setStatus(currentStatus == null ? InterventionStatus.PENDING : currentStatus);
        }

        if (requestDto.getPriority() == null) {
            entity.setPriority(currentPriority == null ? PriorityLevel.NORMAL : currentPriority);
        }

        if (requestDto.getCost() == null) {
            entity.setCost(currentCost == null ? BigDecimal.ZERO : currentCost);
        }

        Intervention saved = interventionRepository.save(entity);
        return interventionMapper.toResponseDto(saved);
    }

    public InterventionResponseDto getById(Long id) {
        return interventionMapper.toResponseDto(findEntityById(id));
    }

    public Page<InterventionResponseDto> getAll(
        Pageable pageable,
        Long clientId,
        Long assignedTechnicianId,
        InterventionStatus status,
        PriorityLevel priority,
        InterventionType type,
        LocalDateTime plannedFrom,
        LocalDateTime plannedTo,
        LocalDateTime actualFrom,
        LocalDateTime actualTo,
        String search
    ) {
        validateFilters(plannedFrom, plannedTo, actualFrom, actualTo);

        if (assignedTechnicianId != null) {
            findTechnicianById(assignedTechnicianId);
        }

        Specification<Intervention> specification = buildSpecification(
            clientId,
            assignedTechnicianId,
            status,
            priority,
            type,
            plannedFrom,
            plannedTo,
            actualFrom,
            actualTo,
            search
        );

        return interventionRepository.findAll(specification, pageable)
            .map(interventionMapper::toResponseDto);
    }

    public Page<InterventionResponseDto> getByTechnician(Long assignedTechnicianId, Pageable pageable) {
        findTechnicianById(assignedTechnicianId);
        return interventionRepository.findByAssignedTechnicianId(assignedTechnicianId, pageable)
            .map(interventionMapper::toResponseDto);
    }

    @Transactional
    public void delete(Long id) {
        Intervention entity = findEntityById(id);
        entity.setStatus(InterventionStatus.CANCELLED);
        interventionRepository.save(entity);
    }

    private Intervention findEntityById(Long id) {
        return interventionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Intervention not found with id: " + id
            ));
    }

    private Client findClientById(Long clientId) {
        return clientRepository.findById(clientId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Client not found with id: " + clientId
            ));
    }

    private User findTechnicianIfProvided(Long technicianId) {
        if (technicianId == null) {
            return null;
        }
        return findTechnicianById(technicianId);
    }

    private User findTechnicianById(Long technicianId) {
        User user = entityManager.find(User.class, technicianId);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Technician not found with id: " + technicianId);
        }

        if (Boolean.FALSE.equals(user.getActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned technician must be active");
        }

        if (user.getRole() == null || !RoleConstants.TECHNICIAN.equalsIgnoreCase(user.getRole().getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned user must have TECHNICIAN role");
        }

        return user;
    }

    private void validateRequest(InterventionRequestDto requestDto) {
        if (requestDto.getCost() != null && requestDto.getCost().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "cost cannot be negative");
        }

        if (requestDto.getDurationMinutes() != null && requestDto.getDurationMinutes() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "durationMinutes must be greater than 0");
        }

        if (requestDto.getPlannedDate() != null
            && requestDto.getActualDate() != null
            && requestDto.getActualDate().isBefore(requestDto.getPlannedDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "actualDate must be greater than or equal to plannedDate");
        }
    }

    private void validateFilters(
        LocalDateTime plannedFrom,
        LocalDateTime plannedTo,
        LocalDateTime actualFrom,
        LocalDateTime actualTo
    ) {
        if (plannedFrom != null && plannedTo != null && plannedFrom.isAfter(plannedTo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "plannedFrom must be before or equal to plannedTo");
        }

        if (actualFrom != null && actualTo != null && actualFrom.isAfter(actualTo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "actualFrom must be before or equal to actualTo");
        }
    }

    private Specification<Intervention> buildSpecification(
        Long clientId,
        Long assignedTechnicianId,
        InterventionStatus status,
        PriorityLevel priority,
        InterventionType type,
        LocalDateTime plannedFrom,
        LocalDateTime plannedTo,
        LocalDateTime actualFrom,
        LocalDateTime actualTo,
        String search
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (clientId != null) {
                predicates.add(criteriaBuilder.equal(root.get("client").get("id"), clientId));
            }

            if (assignedTechnicianId != null) {
                predicates.add(criteriaBuilder.equal(root.get("assignedTechnician").get("id"), assignedTechnicianId));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (priority != null) {
                predicates.add(criteriaBuilder.equal(root.get("priority"), priority));
            }

            if (type != null) {
                predicates.add(criteriaBuilder.equal(root.get("type"), type));
            }

            if (plannedFrom != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("plannedDate"), plannedFrom));
            }

            if (plannedTo != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("plannedDate"), plannedTo));
            }

            if (actualFrom != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("actualDate"), actualFrom));
            }

            if (actualTo != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("actualDate"), actualTo));
            }

            if (StringUtils.hasText(search)) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("problemDescription")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("diagnosis")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("solutionProvided")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("closingNotes")), like)
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private void normalize(Intervention entity) {
        entity.setProblemDescription(trimToNull(entity.getProblemDescription()));
        entity.setDiagnosis(trimToNull(entity.getDiagnosis()));
        entity.setSolutionProvided(trimToNull(entity.getSolutionProvided()));
        entity.setClosingNotes(trimToNull(entity.getClosingNotes()));
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
