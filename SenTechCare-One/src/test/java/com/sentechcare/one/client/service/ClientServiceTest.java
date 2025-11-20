package com.sentechcare.one.client.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.sentechcare.one.client.dto.ClientRequestDto;
import com.sentechcare.one.client.dto.ClientResponseDto;
import com.sentechcare.one.client.entity.Client;
import com.sentechcare.one.client.mapper.ClientMapper;
import com.sentechcare.one.client.repository.ClientRepository;
import com.sentechcare.one.common.enums.ClientType;
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
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private ClientMapper clientMapper;

    @InjectMocks
    private ClientService clientService;

    @Captor
    private ArgumentCaptor<Client> clientCaptor;

    @Test
    void create_shouldNormalizeAndDefaultActive() {
        ClientRequestDto request = ClientRequestDto.builder()
            .clientType(ClientType.SME)
            .companyName("  Acme Corp  ")
            .phone(" +221770000000 ")
            .email("  CONTACT@ACME.COM ")
            .build();

        Client entity = Client.builder()
            .clientType(request.getClientType())
            .companyName(request.getCompanyName())
            .phone(request.getPhone())
            .email(request.getEmail())
            .active(null)
            .build();

        when(clientMapper.toEntity(request)).thenReturn(entity);
        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(clientMapper.toResponseDto(any(Client.class))).thenReturn(new ClientResponseDto());

        clientService.create(request);

        verify(clientRepository).save(clientCaptor.capture());
        Client saved = clientCaptor.getValue();

        assertThat(saved.getCompanyName()).isEqualTo("Acme Corp");
        assertThat(saved.getPhone()).isEqualTo("+221770000000");
        assertThat(saved.getEmail()).isEqualTo("contact@acme.com");
        assertThat(saved.getActive()).isTrue();
    }

    @Test
    void create_shouldRejectWhenNoCompanyAndNoPersonIdentity() {
        ClientRequestDto request = ClientRequestDto.builder()
            .clientType(ClientType.SME)
            .phone("+221770000000")
            .build();

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> clientService.create(request));

        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(exception.getReason()).isEqualTo("Either companyName or both firstName and lastName must be provided");
    }

    @Test
    void delete_shouldSoftDeleteClient() {
        Client existing = Client.builder().id(5L).active(true).build();

        when(clientRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> invocation.getArgument(0));

        clientService.delete(5L);

        verify(clientRepository).save(clientCaptor.capture());
        assertThat(clientCaptor.getValue().getActive()).isFalse();
    }
}
