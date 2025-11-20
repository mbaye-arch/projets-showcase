package com.sentechcare.one.subscription.mapper;

import com.sentechcare.one.subscription.dto.SubscriptionRequestDto;
import com.sentechcare.one.subscription.dto.SubscriptionResponseDto;
import com.sentechcare.one.subscription.entity.Subscription;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SubscriptionMapper {

    @Mapping(target = "clientId", source = "client.id")
    SubscriptionResponseDto toResponseDto(Subscription entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "client", ignore = true)
    Subscription toEntity(SubscriptionRequestDto requestDto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "client", ignore = true)
    void updateEntityFromDto(SubscriptionRequestDto requestDto, @MappingTarget Subscription entity);
}
