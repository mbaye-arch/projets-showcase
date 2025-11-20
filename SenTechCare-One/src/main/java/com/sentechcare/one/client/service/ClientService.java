package com.sentechcare.one.client.service;

import com.sentechcare.one.client.dto.ClientRequestDto;
import com.sentechcare.one.client.dto.ClientResponseDto;
import com.sentechcare.one.client.entity.Client;
import com.sentechcare.one.client.mapper.ClientMapper;
import com.sentechcare.one.client.repository.ClientRepository;
import com.sentechcare.one.common.enums.ClientType;
import jakarta.persistence.criteria.Predicate;
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
public class ClientService {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;

    @Transactional
    public ClientResponseDto create(ClientRequestDto requestDto) {
        validateIdentity(requestDto);

        Client entity = clientMapper.toEntity(requestDto);
        normalize(entity);

        if (entity.getActive() == null) {
            entity.setActive(Boolean.TRUE);
        }

        Client saved = clientRepository.save(entity);
        return clientMapper.toResponseDto(saved);
    }

    @Transactional
    public ClientResponseDto update(Long id, ClientRequestDto requestDto) {
        validateIdentity(requestDto);

        Client entity = findEntityById(id);
        Boolean currentActive = entity.getActive();

        clientMapper.updateEntityFromDto(requestDto, entity);
        normalize(entity);

        if (requestDto.getActive() == null) {
            entity.setActive(currentActive);
        }

        Client saved = clientRepository.save(entity);
        return clientMapper.toResponseDto(saved);
    }

    public ClientResponseDto getById(Long id) {
        return clientMapper.toResponseDto(findEntityById(id));
    }

    public ClientResponseDto getByEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email must not be blank");
        }

        Client entity = clientRepository.findByEmailIgnoreCase(email.trim())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found for email: " + email));

        return clientMapper.toResponseDto(entity);
    }

    public Page<ClientResponseDto> getAll(Pageable pageable, Boolean active, ClientType clientType, String search) {
        Specification<Client> specification = buildSpecification(active, clientType, search);
        return clientRepository.findAll(specification, pageable)
            .map(clientMapper::toResponseDto);
    }

    public Page<ClientResponseDto> getActive(Pageable pageable) {
        return clientRepository.findByActiveTrue(pageable)
            .map(clientMapper::toResponseDto);
    }

    @Transactional
    public void delete(Long id) {
        Client entity = findEntityById(id);
        entity.setActive(Boolean.FALSE);
        clientRepository.save(entity);
    }

    private Client findEntityById(Long id) {
        return clientRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found with id: " + id));
    }

    private void validateIdentity(ClientRequestDto requestDto) {
        boolean hasCompany = StringUtils.hasText(requestDto.getCompanyName());
        boolean hasPerson = StringUtils.hasText(requestDto.getFirstName())
            && StringUtils.hasText(requestDto.getLastName());

        if (!hasCompany && !hasPerson) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Either companyName or both firstName and lastName must be provided"
            );
        }
    }

    private Specification<Client> buildSpecification(Boolean active, ClientType clientType, String search) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (active != null) {
                predicates.add(criteriaBuilder.equal(root.get("active"), active));
            }

            if (clientType != null) {
                predicates.add(criteriaBuilder.equal(root.get("clientType"), clientType));
            }

            if (StringUtils.hasText(search)) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("companyName")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("firstName")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("lastName")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("phone")), like)
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private void normalize(Client client) {
        client.setCompanyName(trimToNull(client.getCompanyName()));
        client.setFirstName(trimToNull(client.getFirstName()));
        client.setLastName(trimToNull(client.getLastName()));
        client.setPhone(trimToNull(client.getPhone()));
        client.setEmail(toLowerCase(trimToNull(client.getEmail())));
        client.setAddress(trimToNull(client.getAddress()));
        client.setCity(trimToNull(client.getCity()));
        client.setCountry(trimToNull(client.getCountry()));
        client.setContactPerson(trimToNull(client.getContactPerson()));
        client.setNotes(trimToNull(client.getNotes()));
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private String toLowerCase(String value) {
        return value == null ? null : value.toLowerCase();
    }
}
