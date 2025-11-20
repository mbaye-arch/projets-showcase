package com.sentechcare.one.client.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sentechcare.one.client.dto.ClientRequestDto;
import com.sentechcare.one.client.dto.ClientResponseDto;
import com.sentechcare.one.client.service.ClientService;
import com.sentechcare.one.common.enums.ClientType;
import com.sentechcare.one.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@ExtendWith(MockitoExtension.class)
class ClientControllerTest {

    @Mock
    private ClientService clientService;

    @InjectMocks
    private ClientController clientController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        this.mockMvc = MockMvcBuilders.standaloneSetup(clientController)
            .setControllerAdvice(new GlobalExceptionHandler())
            .setValidator(validator)
            .build();
        this.objectMapper = new ObjectMapper();
    }

    @Test
    void create_shouldReturnCreatedClient() throws Exception {
        ClientRequestDto request = ClientRequestDto.builder()
            .clientType(ClientType.SME)
            .companyName("Acme")
            .phone("+221770000000")
            .email("contact@acme.com")
            .build();

        ClientResponseDto response = ClientResponseDto.builder()
            .id(1L)
            .clientType(ClientType.SME)
            .companyName("Acme")
            .phone("+221770000000")
            .email("contact@acme.com")
            .active(true)
            .build();

        when(clientService.create(any(ClientRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.companyName").value("Acme"));
    }

    @Test
    void create_shouldFailValidationWhenPhoneMissing() throws Exception {
        ClientRequestDto request = ClientRequestDto.builder()
            .clientType(ClientType.SME)
            .companyName("Acme")
            .phone(null)
            .build();

        mockMvc.perform(post("/api/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").exists())
            .andExpect(jsonPath("$.code").value(400));
    }
}
