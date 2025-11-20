package com.sentechcare.one.quote.mapper;

import com.sentechcare.one.quote.dto.QuoteItemRequestDto;
import com.sentechcare.one.quote.dto.QuoteItemResponseDto;
import com.sentechcare.one.quote.dto.QuoteRequestDto;
import com.sentechcare.one.quote.dto.QuoteResponseDto;
import com.sentechcare.one.quote.entity.Quote;
import com.sentechcare.one.quote.entity.QuoteItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface QuoteMapper {

    @Mapping(target = "clientId", source = "client.id")
    QuoteResponseDto toResponseDto(Quote entity);

    QuoteItemResponseDto toItemResponseDto(QuoteItem entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "subtotal", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    Quote toEntity(QuoteRequestDto requestDto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "subtotal", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    void updateEntityFromDto(QuoteRequestDto requestDto, @MappingTarget Quote entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "quote", ignore = true)
    @Mapping(target = "lineTotal", ignore = true)
    QuoteItem toItemEntity(QuoteItemRequestDto requestDto);
}
