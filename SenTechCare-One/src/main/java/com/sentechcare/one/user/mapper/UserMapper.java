package com.sentechcare.one.user.mapper;

import com.sentechcare.one.user.dto.UserRequestDto;
import com.sentechcare.one.user.dto.UserResponseDto;
import com.sentechcare.one.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "roleId", source = "role.id")
    @Mapping(target = "roleName", source = "role.name")
    UserResponseDto toResponseDto(User entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "assignedInterventions", ignore = true)
    @Mapping(target = "assignedTickets", ignore = true)
    User toEntity(UserRequestDto requestDto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "assignedInterventions", ignore = true)
    @Mapping(target = "assignedTickets", ignore = true)
    void updateEntityFromDto(UserRequestDto requestDto, @MappingTarget User entity);
}
