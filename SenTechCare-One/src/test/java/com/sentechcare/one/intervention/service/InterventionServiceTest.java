package com.sentechcare.one.intervention.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.sentechcare.one.client.entity.Client;
import com.sentechcare.one.client.repository.ClientRepository;
import com.sentechcare.one.common.enums.InterventionType;
import com.sentechcare.one.common.enums.PriorityLevel;
import com.sentechcare.one.intervention.dto.InterventionRequestDto;
import com.sentechcare.one.intervention.dto.InterventionResponseDto;
import com.sentechcare.one.intervention.entity.Intervention;
import com.sentechcare.one.intervention.mapper.InterventionMapper;
import com.sentechcare.one.intervention.repository.InterventionRepository;
import com.sentechcare.one.role.entity.Role;
import com.sentechcare.one.user.entity.User;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class InterventionServiceTest {

    @Mock
    private InterventionRepository interventionRepository;

    @Mock
    private InterventionMapper interventionMapper;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private InterventionService interventionService;

    @Captor
    private ArgumentCaptor<Intervention> interventionCaptor;

    @Test
    void create_shouldDefaultFieldsAndNormalizeText() {
        InterventionRequestDto request = InterventionRequestDto.builder()
            .clientId(2L)
            .assignedTechnicianId(7L)
            .type(InterventionType.MAINTENANCE)
            .problemDescription("  Slow network  ")
            .build();

        Intervention entity = Intervention.builder()
            .type(request.getType())
            .problemDescription(request.getProblemDescription())
            .status(null)
            .priority(null)
            .cost(null)
            .build();

        User technician = User.builder()
            .id(7L)
            .active(true)
            .role(Role.builder().name("TECHNICIAN").build())
            .build();

        when(clientRepository.findById(2L)).thenReturn(Optional.of(Client.builder().id(2L).build()));
        when(entityManager.find(User.class, 7L)).thenReturn(technician);
        when(interventionMapper.toEntity(request)).thenReturn(entity);
        when(interventionRepository.save(any(Intervention.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(interventionMapper.toResponseDto(any(Intervention.class))).thenReturn(new InterventionResponseDto());

        interventionService.create(request);

        verify(interventionRepository).save(interventionCaptor.capture());
        Intervention saved = interventionCaptor.getValue();

        assertThat(saved.getStatus().name()).isEqualTo("PENDING");
        assertThat(saved.getPriority()).isEqualTo(PriorityLevel.NORMAL);
        assertThat(saved.getCost()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(saved.getProblemDescription()).isEqualTo("Slow network");
    }

    @Test
    void create_shouldRejectWhenAssignedUserIsNotTechnician() {
        InterventionRequestDto request = InterventionRequestDto.builder()
            .clientId(2L)
            .assignedTechnicianId(8L)
            .type(InterventionType.VISIT)
            .problemDescription("Issue")
            .build();

        User notTechnician = User.builder()
            .id(8L)
            .active(true)
            .role(Role.builder().name("ADMIN").build())
            .build();

        when(clientRepository.findById(2L)).thenReturn(Optional.of(Client.builder().id(2L).build()));
        when(entityManager.find(User.class, 8L)).thenReturn(notTechnician);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> interventionService.create(request));

        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(exception.getReason()).isEqualTo("Assigned user must have TECHNICIAN role");
    }

    @Test
    void delete_shouldSetCancelledStatus() {
        Intervention intervention = Intervention.builder().id(9L).build();

        when(interventionRepository.findById(9L)).thenReturn(Optional.of(intervention));
        when(interventionRepository.save(any(Intervention.class))).thenAnswer(invocation -> invocation.getArgument(0));

        interventionService.delete(9L);

        verify(interventionRepository).save(interventionCaptor.capture());
        assertThat(interventionCaptor.getValue().getStatus().name()).isEqualTo("CANCELLED");
    }
}
