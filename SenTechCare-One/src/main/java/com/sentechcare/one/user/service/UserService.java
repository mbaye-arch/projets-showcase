package com.sentechcare.one.user.service;

import com.sentechcare.one.common.constants.RoleConstants;
import com.sentechcare.one.role.entity.Role;
import com.sentechcare.one.user.dto.UserRequestDto;
import com.sentechcare.one.user.dto.UserResponseDto;
import com.sentechcare.one.user.entity.User;
import com.sentechcare.one.user.mapper.UserMapper;
import com.sentechcare.one.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @Transactional
    public UserResponseDto create(UserRequestDto requestDto) {
        validateCreateRequest(requestDto);

        String normalizedEmail = normalizeEmail(requestDto.getEmail());
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User email already exists");
        }

        Role role = findRoleById(requestDto.getRoleId());

        User entity = userMapper.toEntity(requestDto);
        entity.setRole(role);
        entity.setEmail(normalizedEmail);
        normalize(entity);
        entity.setPassword(encodePassword(requestDto.getPassword()));

        if (entity.getActive() == null) {
            entity.setActive(Boolean.TRUE);
        }

        User saved = userRepository.save(entity);
        return userMapper.toResponseDto(saved);
    }

    @Transactional
    public UserResponseDto update(Long id, UserRequestDto requestDto) {
        validateUpdateRequest(requestDto);

        User entity = findEntityById(id);
        Role role = findRoleById(requestDto.getRoleId());

        String normalizedEmail = normalizeEmail(requestDto.getEmail());
        if (userRepository.existsByEmailIgnoreCaseAndIdNot(normalizedEmail, id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User email already exists");
        }

        Boolean currentActive = entity.getActive();
        String currentPassword = entity.getPassword();

        userMapper.updateEntityFromDto(requestDto, entity);
        entity.setRole(role);
        entity.setEmail(normalizedEmail);
        normalize(entity);

        if (requestDto.getActive() == null) {
            entity.setActive(currentActive);
        }

        if (StringUtils.hasText(requestDto.getPassword())) {
            entity.setPassword(encodePassword(requestDto.getPassword()));
        } else {
            entity.setPassword(currentPassword);
        }

        User saved = userRepository.save(entity);
        return userMapper.toResponseDto(saved);
    }

    public UserResponseDto getById(Long id) {
        return userMapper.toResponseDto(findEntityById(id));
    }

    public UserResponseDto getByEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email must not be blank");
        }

        User entity = userRepository.findByEmailIgnoreCase(email.trim())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found for email: " + email));

        return userMapper.toResponseDto(entity);
    }

    public Page<UserResponseDto> getAll(Pageable pageable, Boolean active, Long roleId, String search) {
        Specification<User> specification = buildSpecification(active, roleId, search);
        return userRepository.findAll(specification, pageable)
            .map(userMapper::toResponseDto);
    }

    public Page<UserResponseDto> getActive(Pageable pageable) {
        return userRepository.findByActiveTrue(pageable)
            .map(userMapper::toResponseDto);
    }

    public Page<UserResponseDto> getByRole(Long roleId, Pageable pageable) {
        findRoleById(roleId);
        return userRepository.findByRole_Id(roleId, pageable)
            .map(userMapper::toResponseDto);
    }

    public Page<UserResponseDto> getTechnicians(Pageable pageable, Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return userRepository.findByRole_NameAndActiveTrue(RoleConstants.TECHNICIAN, pageable)
                .map(userMapper::toResponseDto);
        }
        return userRepository.findByRole_Name(RoleConstants.TECHNICIAN, pageable)
            .map(userMapper::toResponseDto);
    }

    @Transactional
    public void delete(Long id) {
        User entity = findEntityById(id);
        entity.setActive(Boolean.FALSE);
        userRepository.save(entity);
    }

    private User findEntityById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + id));
    }

    private Role findRoleById(Long roleId) {
        Role role = entityManager.find(Role.class, roleId);
        if (role == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found with id: " + roleId);
        }
        return role;
    }

    private void validateCreateRequest(UserRequestDto requestDto) {
        if (!StringUtils.hasText(requestDto.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password is required");
        }
    }

    private void validateUpdateRequest(UserRequestDto requestDto) {
        if (!StringUtils.hasText(requestDto.getFirstName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "firstName is required");
        }
        if (!StringUtils.hasText(requestDto.getLastName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "lastName is required");
        }
        if (!StringUtils.hasText(requestDto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email is required");
        }
    }

    private Specification<User> buildSpecification(Boolean active, Long roleId, String search) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (active != null) {
                predicates.add(criteriaBuilder.equal(root.get("active"), active));
            }

            if (roleId != null) {
                predicates.add(criteriaBuilder.equal(root.get("role").get("id"), roleId));
            }

            if (StringUtils.hasText(search)) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("firstName")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("lastName")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("phone")), like)
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private void normalize(User user) {
        user.setFirstName(trimToNull(user.getFirstName()));
        user.setLastName(trimToNull(user.getLastName()));
        user.setPhone(trimToNull(user.getPhone()));
    }

    private String normalizeEmail(String email) {
        String normalized = trimToNull(email);
        return normalized == null ? null : normalized.toLowerCase();
    }

    private String encodePassword(String rawPassword) {
        String password = trimToNull(rawPassword);
        if (!StringUtils.hasText(password)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password is required");
        }
        return passwordEncoder.encode(password);
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
