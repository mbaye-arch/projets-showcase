package com.sentechcare.one.equipment.mapper;

import com.sentechcare.one.equipment.dto.EquipmentRequestDto;
import com.sentechcare.one.equipment.dto.EquipmentResponseDto;
import com.sentechcare.one.equipment.entity.Equipment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EquipmentMapper {

    @Mapping(target = "clientId", source = "client.id")
    EquipmentResponseDto toResponseDto(Equipment entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "client", ignore = true)
    Equipment toEntity(EquipmentRequestDto requestDto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "client", ignore = true)
    void updateEntityFromDto(EquipmentRequestDto requestDto, @MappingTarget Equipment entity);
}
