package com.sentechcare.one.invoice.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.sentechcare.one.common.exception.GlobalExceptionHandler;
import com.sentechcare.one.common.pdf.PdfFile;
import com.sentechcare.one.invoice.service.InvoicePdfService;
import com.sentechcare.one.invoice.service.InvoiceService;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class InvoiceControllerTest {

    @Mock
    private InvoiceService invoiceService;

    @Mock
    private InvoicePdfService invoicePdfService;

    @InjectMocks
    private InvoiceController invoiceController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.standaloneSetup(invoiceController)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    }

    @Test
    void downloadPdf_shouldReturnPdfAttachment() throws Exception {
        byte[] content = "PDF-CONTENT".getBytes();

        when(invoicePdfService.generate(7L))
            .thenReturn(PdfFile.builder().fileName("facture-INV-007.pdf").content(content).build());

        mockMvc.perform(get("/api/invoices/7/pdf"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_PDF))
            .andExpect(header().string("Content-Disposition", Matchers.containsString("facture-INV-007.pdf")))
            .andExpect(content().bytes(content));
    }
}
