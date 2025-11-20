package com.sentechcare.one.payment.mapper;

import com.sentechcare.one.payment.dto.PaymentRequestDto;
import com.sentechcare.one.payment.dto.PaymentResponseDto;
import com.sentechcare.one.payment.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PaymentMapper {

    @Mapping(target = "invoiceId", source = "invoice.id")
    @Mapping(target = "clientId", source = "invoice.client.id")
    PaymentResponseDto toResponseDto(Payment entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "invoice", ignore = true)
    @Mapping(target = "client", ignore = true)
    Payment toEntity(PaymentRequestDto requestDto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "invoice", ignore = true)
    @Mapping(target = "client", ignore = true)
    void updateEntityFromDto(PaymentRequestDto requestDto, @MappingTarget Payment entity);
}
