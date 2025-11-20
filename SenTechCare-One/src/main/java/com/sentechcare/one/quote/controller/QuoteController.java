package com.sentechcare.one.quote.controller;

import com.sentechcare.one.common.enums.QuoteStatus;
import com.sentechcare.one.common.pdf.PdfFile;
import com.sentechcare.one.common.util.FileDownloadUtils;
import com.sentechcare.one.quote.dto.QuoteRequestDto;
import com.sentechcare.one.quote.dto.QuoteResponseDto;
import com.sentechcare.one.quote.dto.QuoteToInvoiceResponseDto;
import com.sentechcare.one.quote.service.QuotePdfService;
import com.sentechcare.one.quote.service.QuoteService;
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
@RequestMapping("/api/quotes")
public class QuoteController {

    private final QuoteService quoteService;
    private final QuotePdfService quotePdfService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public QuoteResponseDto create(@Valid @RequestBody QuoteRequestDto requestDto) {
        return quoteService.create(requestDto);
    }

    @PutMapping("/{id}")
    public QuoteResponseDto update(@PathVariable Long id, @Valid @RequestBody QuoteRequestDto requestDto) {
        return quoteService.update(id, requestDto);
    }

    @GetMapping("/{id}")
    public QuoteResponseDto getById(@PathVariable Long id) {
        return quoteService.getById(id);
    }

    @GetMapping
    public Page<QuoteResponseDto> getAll(
        Pageable pageable,
        @RequestParam(required = false) Long clientId,
        @RequestParam(required = false) QuoteStatus status,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate dateFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate dateTo,
        @RequestParam(required = false) String search
    ) {
        return quoteService.getAll(pageable, clientId, status, dateFrom, dateTo, search);
    }

    @GetMapping("/by-reference")
    public QuoteResponseDto getByReference(@RequestParam String reference) {
        return quoteService.getByReference(reference);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        quoteService.delete(id);
    }

    @PostMapping("/{id}/convert-to-invoice")
    public QuoteToInvoiceResponseDto convertToInvoice(@PathVariable Long id) {
        return quoteService.convertToInvoice(id);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<ByteArrayResource> downloadPdf(@PathVariable Long id) {
        PdfFile pdfFile = quotePdfService.generate(id);
        return FileDownloadUtils.pdf(pdfFile);
    }
}
