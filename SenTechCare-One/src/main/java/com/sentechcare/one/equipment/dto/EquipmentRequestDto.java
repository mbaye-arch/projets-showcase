package com.sentechcare.one.equipment.dto;

import com.sentechcare.one.common.enums.EquipmentCategory;
import com.sentechcare.one.common.enums.EquipmentSource;
import com.sentechcare.one.common.enums.EquipmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
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
public class EquipmentRequestDto {

    @NotNull(message = "clientId is required")
    private Long clientId;

    @NotNull(message = "category is required")
    private EquipmentCategory category;

    @Size(max = 100, message = "brand must not exceed 100 characters")
    private String brand;

    @Size(max = 120, message = "model must not exceed 120 characters")
    private String model;

    @Size(max = 120, message = "serialNumber must not exceed 120 characters")
    private String serialNumber;

    private LocalDate installationDate;

    private EquipmentStatus status;

    private EquipmentSource source;

    private LocalDate warrantyStartDate;

    private LocalDate warrantyEndDate;

    @Size(max = 255, message = "locationDetails must not exceed 255 characters")
    private String locationDetails;

    private String notes;
}
