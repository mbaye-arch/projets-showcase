package com.sentechcare.one.ticket.service;

import com.sentechcare.one.client.entity.Client;
import com.sentechcare.one.client.repository.ClientRepository;
import com.sentechcare.one.common.constants.RoleConstants;
import com.sentechcare.one.common.enums.InterventionStatus;
import com.sentechcare.one.common.enums.PriorityLevel;
import com.sentechcare.one.common.enums.TicketChannel;
import com.sentechcare.one.common.enums.TicketStatus;
import com.sentechcare.one.intervention.entity.Intervention;
import com.sentechcare.one.intervention.repository.InterventionRepository;
import com.sentechcare.one.ticket.dto.TicketRequestDto;
import com.sentechcare.one.ticket.dto.TicketResponseDto;
import com.sentechcare.one.ticket.dto.TicketToInterventionRequestDto;
import com.sentechcare.one.ticket.dto.TicketToInterventionResponseDto;
import com.sentechcare.one.ticket.entity.Ticket;
import com.sentechcare.one.ticket.mapper.TicketMapper;
import com.sentechcare.one.ticket.repository.TicketRepository;
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
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketMapper ticketMapper;
    private final ClientRepository clientRepository;
    private final InterventionRepository interventionRepository;
    private final EntityManager entityManager;

    @Transactional
    public TicketResponseDto create(TicketRequestDto requestDto) {
        validateRequest(requestDto);

        Client client = findClientById(requestDto.getClientId());
        User technician = findTechnicianIfProvided(requestDto.getAssignedTechnicianId());

        Ticket entity = ticketMapper.toEntity(requestDto);
        entity.setClient(client);
        entity.setAssignedTechnician(technician);
        normalize(entity);

        if (entity.getStatus() == null) {
            entity.setStatus(TicketStatus.OPEN);
        }

        if (entity.getPriority() == null) {
            entity.setPriority(PriorityLevel.NORMAL);
        }

        if (isResolvedLikeStatus(entity.getStatus()) && entity.getResolvedAt() == null) {
            entity.setResolvedAt(LocalDateTime.now());
        }

        validateResolvedConsistency(entity.getStatus(), entity.getResolvedAt());

        Ticket saved = ticketRepository.save(entity);
        return ticketMapper.toResponseDto(saved);
    }

    @Transactional
    public TicketResponseDto update(Long id, TicketRequestDto requestDto) {
        validateRequest(requestDto);

        Ticket entity = findEntityById(id);
        Client client = findClientById(requestDto.getClientId());
        User technician = findTechnicianIfProvided(requestDto.getAssignedTechnicianId());

        TicketStatus currentStatus = entity.getStatus();
        PriorityLevel currentPriority = entity.getPriority();
        LocalDateTime currentResolvedAt = entity.getResolvedAt();

        ticketMapper.updateEntityFromDto(requestDto, entity);
        entity.setClient(client);
        entity.setAssignedTechnician(technician);
        normalize(entity);

        if (requestDto.getStatus() == null) {
            entity.setStatus(currentStatus == null ? TicketStatus.OPEN : currentStatus);
        }

        if (requestDto.getPriority() == null) {
            entity.setPriority(currentPriority == null ? PriorityLevel.NORMAL : currentPriority);
        }

        if (requestDto.getResolvedAt() == null) {
            entity.setResolvedAt(currentResolvedAt);
        }

        if (isResolvedLikeStatus(entity.getStatus()) && entity.getResolvedAt() == null) {
            entity.setResolvedAt(LocalDateTime.now());
        }

        validateResolvedConsistency(entity.getStatus(), entity.getResolvedAt());

        Ticket saved = ticketRepository.save(entity);
        return ticketMapper.toResponseDto(saved);
    }

    public TicketResponseDto getById(Long id) {
        return ticketMapper.toResponseDto(findEntityById(id));
    }

    public Page<TicketResponseDto> getAll(
        Pageable pageable,
        Long clientId,
        Long assignedTechnicianId,
        TicketStatus status,
        PriorityLevel priority,
        TicketChannel channel,
        LocalDateTime createdFrom,
        LocalDateTime createdTo,
        LocalDateTime resolvedFrom,
        LocalDateTime resolvedTo,
        String search
    ) {
        validateFilters(createdFrom, createdTo, resolvedFrom, resolvedTo);

        if (assignedTechnicianId != null) {
            findTechnicianById(assignedTechnicianId);
        }

        Specification<Ticket> specification = buildSpecification(
            clientId,
            assignedTechnicianId,
            status,
            priority,
            channel,
            createdFrom,
            createdTo,
            resolvedFrom,
            resolvedTo,
            search
        );

        return ticketRepository.findAll(specification, pageable)
            .map(ticketMapper::toResponseDto);
    }

    public Page<TicketResponseDto> getByTechnician(Long assignedTechnicianId, Pageable pageable) {
        findTechnicianById(assignedTechnicianId);
        return ticketRepository.findByAssignedTechnicianId(assignedTechnicianId, pageable)
            .map(ticketMapper::toResponseDto);
    }

    @Transactional
    public void delete(Long id) {
        Ticket entity = findEntityById(id);
        entity.setStatus(TicketStatus.CLOSED);
        if (entity.getResolvedAt() == null) {
            entity.setResolvedAt(LocalDateTime.now());
        }
        ticketRepository.save(entity);
    }

    @Transactional
    public TicketToInterventionResponseDto convertToIntervention(Long ticketId, TicketToInterventionRequestDto requestDto) {
        Ticket ticket = findEntityById(ticketId);
        validateConversionRequest(requestDto);

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot convert a CLOSED ticket");
        }

        User technician = resolveTechnicianForConversion(ticket, requestDto.getAssignedTechnicianId());

        Intervention intervention = Intervention.builder()
            .client(ticket.getClient())
            .assignedTechnician(technician)
            .type(requestDto.getInterventionType())
            .plannedDate(requestDto.getPlannedDate())
            .status(InterventionStatus.PENDING)
            .priority(ticket.getPriority())
            .problemDescription(buildProblemDescription(ticket))
            .cost(BigDecimal.ZERO)
            .build();

        Intervention savedIntervention = interventionRepository.save(intervention);

        String conversionMessage = "Converted to intervention #" + savedIntervention.getId();
        if (StringUtils.hasText(requestDto.getResolutionComment())) {
            conversionMessage = requestDto.getResolutionComment().trim();
        }

        if (Boolean.TRUE.equals(requestDto.getCloseTicket())) {
            ticket.setStatus(TicketStatus.CLOSED);
            ticket.setResolvedAt(LocalDateTime.now());
        } else {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
            ticket.setResolvedAt(null);
        }

        ticket.setResolutionComment(conversionMessage);
        ticketRepository.save(ticket);

        return TicketToInterventionResponseDto.builder()
            .ticketId(ticket.getId())
            .ticketStatus(ticket.getStatus())
            .interventionId(savedIntervention.getId())
            .interventionStatus(savedIntervention.getStatus())
            .convertedAt(LocalDateTime.now())
            .message("Ticket converted successfully")
            .build();
    }

    private Ticket findEntityById(Long id) {
        return ticketRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found with id: " + id));
    }

    private Client findClientById(Long clientId) {
        return clientRepository.findById(clientId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found with id: " + clientId));
    }

    private User findTechnicianIfProvided(Long technicianId) {
        if (technicianId == null) {
            return null;
        }
        return findTechnicianById(technicianId);
    }

    private User resolveTechnicianForConversion(Ticket ticket, Long overrideTechnicianId) {
        if (overrideTechnicianId != null) {
            return findTechnicianById(overrideTechnicianId);
        }

        if (ticket.getAssignedTechnician() != null) {
            return findTechnicianById(ticket.getAssignedTechnician().getId());
        }

        return null;
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

    private void validateRequest(TicketRequestDto requestDto) {
        if (requestDto.getResolvedAt() != null && requestDto.getResolvedAt().isAfter(LocalDateTime.now().plusMinutes(1))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "resolvedAt is not valid");
        }
    }

    private void validateResolvedConsistency(TicketStatus status, LocalDateTime resolvedAt) {
        if (!isResolvedLikeStatus(status) && resolvedAt != null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "resolvedAt must be null when status is not RESOLVED or CLOSED"
            );
        }
    }

    private void validateConversionRequest(TicketToInterventionRequestDto requestDto) {
        if (requestDto.getPlannedDate() != null && requestDto.getPlannedDate().isBefore(LocalDateTime.now().minusYears(10))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "plannedDate is not valid");
        }

        if (requestDto.getInterventionType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "interventionType is required");
        }
    }

    private void validateFilters(
        LocalDateTime createdFrom,
        LocalDateTime createdTo,
        LocalDateTime resolvedFrom,
        LocalDateTime resolvedTo
    ) {
        if (createdFrom != null && createdTo != null && createdFrom.isAfter(createdTo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "createdFrom must be before or equal to createdTo");
        }

        if (resolvedFrom != null && resolvedTo != null && resolvedFrom.isAfter(resolvedTo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "resolvedFrom must be before or equal to resolvedTo");
        }
    }

    private Specification<Ticket> buildSpecification(
        Long clientId,
        Long assignedTechnicianId,
        TicketStatus status,
        PriorityLevel priority,
        TicketChannel channel,
        LocalDateTime createdFrom,
        LocalDateTime createdTo,
        LocalDateTime resolvedFrom,
        LocalDateTime resolvedTo,
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

            if (channel != null) {
                predicates.add(criteriaBuilder.equal(root.get("channel"), channel));
            }

            if (createdFrom != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), createdFrom));
            }

            if (createdTo != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), createdTo));
            }

            if (resolvedFrom != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("resolvedAt"), resolvedFrom));
            }

            if (resolvedTo != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("resolvedAt"), resolvedTo));
            }

            if (StringUtils.hasText(search)) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("subject")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("resolutionComment")), like)
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private boolean isResolvedLikeStatus(TicketStatus status) {
        return status == TicketStatus.RESOLVED || status == TicketStatus.CLOSED;
    }

    private String buildProblemDescription(Ticket ticket) {
        String subject = trimToNull(ticket.getSubject());
        String description = trimToNull(ticket.getDescription());

        if (subject == null && description == null) {
            return "Issue reported from ticket";
        }

        if (subject == null) {
            return description;
        }

        if (description == null) {
            return subject;
        }

        return subject + " - " + description;
    }

    private void normalize(Ticket entity) {
        entity.setSubject(trimToNull(entity.getSubject()));
        entity.setDescription(trimToNull(entity.getDescription()));
        entity.setResolutionComment(trimToNull(entity.getResolutionComment()));
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
