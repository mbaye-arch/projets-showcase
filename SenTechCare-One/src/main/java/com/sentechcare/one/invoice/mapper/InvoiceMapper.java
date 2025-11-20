package com.sentechcare.one.invoice.mapper;

import com.sentechcare.one.invoice.dto.InvoiceItemRequestDto;
import com.sentechcare.one.invoice.dto.InvoiceItemResponseDto;
import com.sentechcare.one.invoice.dto.InvoiceRequestDto;
import com.sentechcare.one.invoice.dto.InvoiceResponseDto;
import com.sentechcare.one.invoice.entity.Invoice;
import com.sentechcare.one.invoice.entity.InvoiceItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface InvoiceMapper {

    @Mapping(target = "clientId", source = "client.id")
    InvoiceResponseDto toResponseDto(Invoice entity);

    InvoiceItemResponseDto toItemResponseDto(InvoiceItem entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "payments", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "paidAmount", ignore = true)
    @Mapping(target = "remainingAmount", ignore = true)
    Invoice toEntity(InvoiceRequestDto requestDto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "payments", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "paidAmount", ignore = true)
    @Mapping(target = "remainingAmount", ignore = true)
    void updateEntityFromDto(InvoiceRequestDto requestDto, @MappingTarget Invoice entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "invoice", ignore = true)
    @Mapping(target = "lineTotal", ignore = true)
    InvoiceItem toItemEntity(InvoiceItemRequestDto requestDto);
}
