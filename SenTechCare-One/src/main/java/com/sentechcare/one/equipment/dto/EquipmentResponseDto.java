package com.sentechcare.one.equipment.dto;

import com.sentechcare.one.common.enums.EquipmentCategory;
import com.sentechcare.one.common.enums.EquipmentSource;
import com.sentechcare.one.common.enums.EquipmentStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentResponseDto {

    private Long id;
    private Long clientId;
    private EquipmentCategory category;
    private String brand;
    private String model;
    private String serialNumber;
    private LocalDate installationDate;
    private EquipmentStatus status;
    private EquipmentSource source;
    private LocalDate warrantyStartDate;
    private LocalDate warrantyEndDate;
    private String locationDetails;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
