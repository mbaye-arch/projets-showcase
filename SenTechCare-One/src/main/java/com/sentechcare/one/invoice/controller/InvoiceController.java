package com.sentechcare.one.invoice.controller;

import com.sentechcare.one.common.enums.InvoiceStatus;
import com.sentechcare.one.common.pdf.PdfFile;
import com.sentechcare.one.common.util.FileDownloadUtils;
import com.sentechcare.one.invoice.dto.InvoiceRequestDto;
import com.sentechcare.one.invoice.dto.InvoiceResponseDto;
import com.sentechcare.one.invoice.service.InvoicePdfService;
import com.sentechcare.one.invoice.service.InvoiceService;
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
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final InvoicePdfService invoicePdfService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceResponseDto create(@Valid @RequestBody InvoiceRequestDto requestDto) {
        return invoiceService.create(requestDto);
    }

    @PutMapping("/{id}")
    public InvoiceResponseDto update(@PathVariable Long id, @Valid @RequestBody InvoiceRequestDto requestDto) {
        return invoiceService.update(id, requestDto);
    }

    @GetMapping("/{id}")
    public InvoiceResponseDto getById(@PathVariable Long id) {
        return invoiceService.getById(id);
    }

    @GetMapping
    public Page<InvoiceResponseDto> getAll(
        Pageable pageable,
        @RequestParam(required = false) Long clientId,
        @RequestParam(required = false) InvoiceStatus status,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate issueFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate issueTo,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate dueFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate dueTo,
        @RequestParam(required = false) String search
    ) {
        return invoiceService.getAll(pageable, clientId, status, issueFrom, issueTo, dueFrom, dueTo, search);
    }

    @GetMapping("/by-reference")
    public InvoiceResponseDto getByReference(@RequestParam String reference) {
        return invoiceService.getByReference(reference);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        invoiceService.delete(id);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<ByteArrayResource> downloadPdf(@PathVariable Long id) {
        PdfFile pdfFile = invoicePdfService.generate(id);
        return FileDownloadUtils.pdf(pdfFile);
    }
}
