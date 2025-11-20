package com.sentechcare.one.client.mapper;

import com.sentechcare.one.client.dto.ClientRequestDto;
import com.sentechcare.one.client.dto.ClientResponseDto;
import com.sentechcare.one.client.entity.Client;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ClientMapper {

    ClientResponseDto toResponseDto(Client entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "subscriptions", ignore = true)
    @Mapping(target = "equipments", ignore = true)
    @Mapping(target = "interventions", ignore = true)
    @Mapping(target = "tickets", ignore = true)
    @Mapping(target = "quotes", ignore = true)
    @Mapping(target = "invoices", ignore = true)
    @Mapping(target = "payments", ignore = true)
    Client toEntity(ClientRequestDto requestDto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "subscriptions", ignore = true)
    @Mapping(target = "equipments", ignore = true)
    @Mapping(target = "interventions", ignore = true)
    @Mapping(target = "tickets", ignore = true)
    @Mapping(target = "quotes", ignore = true)
    @Mapping(target = "invoices", ignore = true)
    @Mapping(target = "payments", ignore = true)
    void updateEntityFromDto(ClientRequestDto requestDto, @MappingTarget Client entity);
}
