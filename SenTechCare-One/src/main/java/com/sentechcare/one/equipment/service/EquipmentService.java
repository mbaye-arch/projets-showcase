package com.sentechcare.one.equipment.service;

import com.sentechcare.one.client.entity.Client;
import com.sentechcare.one.client.repository.ClientRepository;
import com.sentechcare.one.common.enums.EquipmentCategory;
import com.sentechcare.one.common.enums.EquipmentSource;
import com.sentechcare.one.common.enums.EquipmentStatus;
import com.sentechcare.one.equipment.dto.EquipmentRequestDto;
import com.sentechcare.one.equipment.dto.EquipmentResponseDto;
import com.sentechcare.one.equipment.entity.Equipment;
import com.sentechcare.one.equipment.mapper.EquipmentMapper;
import com.sentechcare.one.equipment.repository.EquipmentRepository;
import jakarta.persistence.criteria.Predicate;
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
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentMapper equipmentMapper;
    private final ClientRepository clientRepository;

    @Transactional
    public EquipmentResponseDto create(EquipmentRequestDto requestDto) {
        validateRequest(requestDto);

        Client client = findClientById(requestDto.getClientId());

        Equipment entity = equipmentMapper.toEntity(requestDto);
        entity.setClient(client);
        normalize(entity);

        if (entity.getStatus() == null) {
            entity.setStatus(EquipmentStatus.ACTIVE);
        }

        if (entity.getSource() == null) {
            entity.setSource(EquipmentSource.CLIENT);
        }

        Equipment saved = equipmentRepository.save(entity);
        return equipmentMapper.toResponseDto(saved);
    }

    @Transactional
    public EquipmentResponseDto update(Long id, EquipmentRequestDto requestDto) {
        validateRequest(requestDto);

        Equipment entity = findEntityById(id);
        Client client = findClientById(requestDto.getClientId());

        EquipmentStatus currentStatus = entity.getStatus();
        EquipmentSource currentSource = entity.getSource();

        equipmentMapper.updateEntityFromDto(requestDto, entity);
        entity.setClient(client);
        normalize(entity);

        if (requestDto.getStatus() == null) {
            entity.setStatus(currentStatus == null ? EquipmentStatus.ACTIVE : currentStatus);
        }

        if (requestDto.getSource() == null) {
            entity.setSource(currentSource == null ? EquipmentSource.CLIENT : currentSource);
        }

        Equipment saved = equipmentRepository.save(entity);
        return equipmentMapper.toResponseDto(saved);
    }

    public EquipmentResponseDto getById(Long id) {
        return equipmentMapper.toResponseDto(findEntityById(id));
    }

    public EquipmentResponseDto getByExactSerialNumber(String serialNumber) {
        if (!StringUtils.hasText(serialNumber)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "serialNumber must not be blank");
        }

        Equipment entity = equipmentRepository.findFirstBySerialNumberIgnoreCase(serialNumber.trim())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Equipment not found for serial number: " + serialNumber
            ));

        return equipmentMapper.toResponseDto(entity);
    }

    public Page<EquipmentResponseDto> getAll(
        Pageable pageable,
        Long clientId,
        EquipmentStatus status,
        EquipmentCategory category,
        EquipmentSource source,
        String search
    ) {
        Specification<Equipment> specification = buildSpecification(clientId, status, category, source, search);
        return equipmentRepository.findAll(specification, pageable)
            .map(equipmentMapper::toResponseDto);
    }

    public Page<EquipmentResponseDto> getByClient(Long clientId, Pageable pageable) {
        return equipmentRepository.findByClientId(clientId, pageable)
            .map(equipmentMapper::toResponseDto);
    }

    @Transactional
    public void delete(Long id) {
        Equipment entity = findEntityById(id);
        entity.setStatus(EquipmentStatus.OUT_OF_SERVICE);
        equipmentRepository.save(entity);
    }

    private Equipment findEntityById(Long id) {
        return equipmentRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Equipment not found with id: " + id
            ));
    }

    private Client findClientById(Long clientId) {
        return clientRepository.findById(clientId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Client not found with id: " + clientId
            ));
    }

    private void validateRequest(EquipmentRequestDto requestDto) {
        if (requestDto.getWarrantyStartDate() != null
            && requestDto.getWarrantyEndDate() != null
            && requestDto.getWarrantyEndDate().isBefore(requestDto.getWarrantyStartDate())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "warrantyEndDate must be greater than or equal to warrantyStartDate"
            );
        }

        if (requestDto.getInstallationDate() != null && requestDto.getInstallationDate().isAfter(LocalDate.now().plusDays(1))) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "installationDate is not valid"
            );
        }
    }

    private Specification<Equipment> buildSpecification(
        Long clientId,
        EquipmentStatus status,
        EquipmentCategory category,
        EquipmentSource source,
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

            if (category != null) {
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }

            if (source != null) {
                predicates.add(criteriaBuilder.equal(root.get("source"), source));
            }

            if (StringUtils.hasText(search)) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("brand")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("model")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("serialNumber")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("locationDetails")), like)
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private void normalize(Equipment entity) {
        entity.setBrand(trimToNull(entity.getBrand()));
        entity.setModel(trimToNull(entity.getModel()));
        entity.setSerialNumber(toUpperCase(trimToNull(entity.getSerialNumber())));
        entity.setLocationDetails(trimToNull(entity.getLocationDetails()));
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
