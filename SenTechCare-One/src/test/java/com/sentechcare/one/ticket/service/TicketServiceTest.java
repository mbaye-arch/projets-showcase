package com.sentechcare.one.ticket.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.sentechcare.one.client.entity.Client;
import com.sentechcare.one.client.repository.ClientRepository;
import com.sentechcare.one.common.enums.InterventionStatus;
import com.sentechcare.one.common.enums.InterventionType;
import com.sentechcare.one.common.enums.PriorityLevel;
import com.sentechcare.one.common.enums.TicketStatus;
import com.sentechcare.one.intervention.entity.Intervention;
import com.sentechcare.one.intervention.repository.InterventionRepository;
import com.sentechcare.one.role.entity.Role;
import com.sentechcare.one.ticket.dto.TicketToInterventionRequestDto;
import com.sentechcare.one.ticket.dto.TicketToInterventionResponseDto;
import com.sentechcare.one.ticket.entity.Ticket;
import com.sentechcare.one.ticket.mapper.TicketMapper;
import com.sentechcare.one.ticket.repository.TicketRepository;
import com.sentechcare.one.user.entity.User;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketMapper ticketMapper;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private InterventionRepository interventionRepository;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private TicketService ticketService;

    @Captor
    private ArgumentCaptor<Intervention> interventionCaptor;

    @Captor
    private ArgumentCaptor<Ticket> ticketCaptor;

    @Test
    void convertToIntervention_shouldCreateInterventionAndCloseTicket() {
        Client client = Client.builder().id(2L).build();

        Ticket ticket = Ticket.builder()
            .id(10L)
            .client(client)
            .subject(" Network issue ")
            .description(" No internet ")
            .priority(PriorityLevel.HIGH)
            .status(TicketStatus.OPEN)
            .build();

        User technician = User.builder()
            .id(7L)
            .active(true)
            .role(Role.builder().name("TECHNICIAN").build())
            .build();

        TicketToInterventionRequestDto request = TicketToInterventionRequestDto.builder()
            .interventionType(InterventionType.TROUBLESHOOTING)
            .assignedTechnicianId(7L)
            .plannedDate(LocalDateTime.now().plusDays(1))
            .closeTicket(Boolean.TRUE)
            .build();

        when(ticketRepository.findById(10L)).thenReturn(Optional.of(ticket));
        when(entityManager.find(User.class, 7L)).thenReturn(technician);
        when(interventionRepository.save(any(Intervention.class))).thenAnswer(invocation -> {
            Intervention intervention = invocation.getArgument(0);
            intervention.setId(99L);
            return intervention;
        });
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TicketToInterventionResponseDto response = ticketService.convertToIntervention(10L, request);

        verify(interventionRepository).save(interventionCaptor.capture());
        Intervention created = interventionCaptor.getValue();

        assertThat(created.getClient()).isSameAs(client);
        assertThat(created.getAssignedTechnician()).isSameAs(technician);
        assertThat(created.getType()).isEqualTo(InterventionType.TROUBLESHOOTING);
        assertThat(created.getStatus()).isEqualTo(InterventionStatus.PENDING);
        assertThat(created.getPriority()).isEqualTo(PriorityLevel.HIGH);
        assertThat(created.getCost()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(created.getProblemDescription()).isEqualTo("Network issue - No internet");

        verify(ticketRepository).save(ticketCaptor.capture());
        Ticket updatedTicket = ticketCaptor.getValue();

        assertThat(updatedTicket.getStatus()).isEqualTo(TicketStatus.CLOSED);
        assertThat(updatedTicket.getResolvedAt()).isNotNull();
        assertThat(updatedTicket.getResolutionComment()).isEqualTo("Converted to intervention #99");

        assertThat(response.getTicketId()).isEqualTo(10L);
        assertThat(response.getInterventionId()).isEqualTo(99L);
        assertThat(response.getTicketStatus()).isEqualTo(TicketStatus.CLOSED);
        assertThat(response.getInterventionStatus()).isEqualTo(InterventionStatus.PENDING);
    }

    @Test
    void convertToIntervention_shouldRejectClosedTicket() {
        Ticket closedTicket = Ticket.builder()
            .id(11L)
            .status(TicketStatus.CLOSED)
            .build();

        TicketToInterventionRequestDto request = TicketToInterventionRequestDto.builder()
            .interventionType(InterventionType.VISIT)
            .closeTicket(Boolean.TRUE)
            .build();

        when(ticketRepository.findById(11L)).thenReturn(Optional.of(closedTicket));

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> ticketService.convertToIntervention(11L, request)
        );

        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(exception.getReason()).isEqualTo("Cannot convert a CLOSED ticket");
        verify(interventionRepository, never()).save(any(Intervention.class));
    }
}
