package com.sentechcare.one.payment.controller;

import com.sentechcare.one.common.enums.PaymentMethod;
import com.sentechcare.one.common.pdf.PdfFile;
import com.sentechcare.one.common.util.FileDownloadUtils;
import com.sentechcare.one.payment.dto.PaymentRequestDto;
import com.sentechcare.one.payment.dto.PaymentResponseDto;
import com.sentechcare.one.payment.service.PaymentReceiptPdfService;
import com.sentechcare.one.payment.service.PaymentService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import org.springframework.core.io.ByteArrayResource;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentReceiptPdfService paymentReceiptPdfService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponseDto create(@Valid @RequestBody PaymentRequestDto requestDto) {
        return paymentService.create(requestDto);
    }

    @PutMapping("/{id}")
    public PaymentResponseDto update(@PathVariable Long id, @Valid @RequestBody PaymentRequestDto requestDto) {
        return paymentService.update(id, requestDto);
    }

    @GetMapping("/{id}")
    public PaymentResponseDto getById(@PathVariable Long id) {
        return paymentService.getById(id);
    }

    @GetMapping
    public Page<PaymentResponseDto> getAll(
        Pageable pageable,
        @RequestParam(required = false) Long invoiceId,
        @RequestParam(required = false) Long clientId,
        @RequestParam(required = false) PaymentMethod method,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate paymentDateFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate paymentDateTo,
        @RequestParam(required = false) String search
    ) {
        return paymentService.getAll(
            pageable,
            invoiceId,
            clientId,
            method,
            paymentDateFrom,
            paymentDateTo,
            search
        );
    }

    @GetMapping("/invoice/{invoiceId}")
    public Page<PaymentResponseDto> getByInvoice(@PathVariable Long invoiceId, Pageable pageable) {
        return paymentService.getByInvoice(invoiceId, pageable);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        paymentService.delete(id);
    }

    @GetMapping("/{id}/receipt/pdf")
    public ResponseEntity<ByteArrayResource> downloadReceiptPdf(@PathVariable Long id) {
        PdfFile pdfFile = paymentReceiptPdfService.generate(id);
        return FileDownloadUtils.pdf(pdfFile);
    }
}
