package com.sentechcare.one.equipment.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import java.time.LocalDate;
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
class EquipmentServiceTest {

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private EquipmentMapper equipmentMapper;

    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private EquipmentService equipmentService;

    @Captor
    private ArgumentCaptor<Equipment> equipmentCaptor;

    @Test
    void create_shouldDefaultStatusAndSourceAndNormalizeSerial() {
        EquipmentRequestDto request = EquipmentRequestDto.builder()
            .clientId(2L)
            .category(EquipmentCategory.ROUTER)
            .serialNumber(" sn-001 ")
            .build();

        Equipment entity = Equipment.builder()
            .category(request.getCategory())
            .serialNumber(request.getSerialNumber())
            .status(null)
            .source(null)
            .build();

        when(clientRepository.findById(2L)).thenReturn(Optional.of(Client.builder().id(2L).build()));
        when(equipmentMapper.toEntity(request)).thenReturn(entity);
        when(equipmentRepository.save(any(Equipment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(equipmentMapper.toResponseDto(any(Equipment.class))).thenReturn(new EquipmentResponseDto());

        equipmentService.create(request);

        verify(equipmentRepository).save(equipmentCaptor.capture());
        Equipment saved = equipmentCaptor.getValue();

        assertThat(saved.getSerialNumber()).isEqualTo("SN-001");
        assertThat(saved.getStatus()).isEqualTo(EquipmentStatus.ACTIVE);
        assertThat(saved.getSource()).isEqualTo(EquipmentSource.CLIENT);
    }

    @Test
    void create_shouldRejectInvalidWarrantyDates() {
        EquipmentRequestDto request = EquipmentRequestDto.builder()
            .clientId(2L)
            .category(EquipmentCategory.PC)
            .warrantyStartDate(LocalDate.of(2026, 2, 1))
            .warrantyEndDate(LocalDate.of(2026, 1, 31))
            .build();

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> equipmentService.create(request));

        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(exception.getReason()).isEqualTo("warrantyEndDate must be greater than or equal to warrantyStartDate");
    }

    @Test
    void delete_shouldSetOutOfService() {
        Equipment equipment = Equipment.builder().id(3L).status(EquipmentStatus.ACTIVE).build();

        when(equipmentRepository.findById(3L)).thenReturn(Optional.of(equipment));
        when(equipmentRepository.save(any(Equipment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        equipmentService.delete(3L);

        verify(equipmentRepository).save(equipmentCaptor.capture());
        assertThat(equipmentCaptor.getValue().getStatus()).isEqualTo(EquipmentStatus.OUT_OF_SERVICE);
    }
}
