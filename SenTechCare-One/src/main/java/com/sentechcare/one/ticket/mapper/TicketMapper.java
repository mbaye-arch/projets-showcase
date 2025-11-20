package com.sentechcare.one.ticket.mapper;

import com.sentechcare.one.ticket.dto.TicketRequestDto;
import com.sentechcare.one.ticket.dto.TicketResponseDto;
import com.sentechcare.one.ticket.entity.Ticket;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TicketMapper {

    @Mapping(target = "clientId", source = "client.id")
    @Mapping(target = "assignedTechnicianId", source = "assignedTechnician.id")
    @Mapping(target = "assignedTechnicianFirstName", source = "assignedTechnician.firstName")
    @Mapping(target = "assignedTechnicianLastName", source = "assignedTechnician.lastName")
    TicketResponseDto toResponseDto(Ticket entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "assignedTechnician", ignore = true)
    Ticket toEntity(TicketRequestDto requestDto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "assignedTechnician", ignore = true)
    void updateEntityFromDto(TicketRequestDto requestDto, @MappingTarget Ticket entity);
}
