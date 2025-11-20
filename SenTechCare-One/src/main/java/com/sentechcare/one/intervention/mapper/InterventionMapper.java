package com.sentechcare.one.intervention.mapper;

import com.sentechcare.one.intervention.dto.InterventionRequestDto;
import com.sentechcare.one.intervention.dto.InterventionResponseDto;
import com.sentechcare.one.intervention.entity.Intervention;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface InterventionMapper {

    @Mapping(target = "clientId", source = "client.id")
    @Mapping(target = "assignedTechnicianId", source = "assignedTechnician.id")
    @Mapping(target = "assignedTechnicianFirstName", source = "assignedTechnician.firstName")
    @Mapping(target = "assignedTechnicianLastName", source = "assignedTechnician.lastName")
    InterventionResponseDto toResponseDto(Intervention entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "assignedTechnician", ignore = true)
    Intervention toEntity(InterventionRequestDto requestDto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "assignedTechnician", ignore = true)
    void updateEntityFromDto(InterventionRequestDto requestDto, @MappingTarget Intervention entity);
}
