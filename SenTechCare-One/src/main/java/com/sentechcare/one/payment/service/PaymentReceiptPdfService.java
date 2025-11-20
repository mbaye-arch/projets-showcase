package com.sentechcare.one.payment.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.sentechcare.one.client.entity.Client;
import com.sentechcare.one.common.pdf.PdfBrandingUtils;
import com.sentechcare.one.common.pdf.PdfFile;
import com.sentechcare.one.common.pdf.PdfFormatUtils;
import com.sentechcare.one.invoice.entity.Invoice;
import com.sentechcare.one.payment.entity.Payment;
import com.sentechcare.one.payment.repository.PaymentRepository;
import java.io.ByteArrayOutputStream;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentReceiptPdfService {

    private final PaymentRepository paymentRepository;

    public PdfFile generate(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found with id: " + paymentId));

        Invoice invoice = payment.getInvoice();
        Client client = payment.getClient();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

            PdfBrandingUtils.addBrandHeader(document, "SenTechCare - Recu de paiement");

            String clientName = client.getCompanyName() != null
                ? client.getCompanyName()
                : (PdfFormatUtils.safe(client.getFirstName()) + " " + PdfFormatUtils.safe(client.getLastName())).trim();

            PdfPTable details = new PdfPTable(2);
            details.setWidthPercentage(100);
            details.setWidths(new float[] {35f, 65f});

            addKeyValue(details, "Recu #", String.valueOf(payment.getId()), boldFont, textFont);
            addKeyValue(details, "Reference paiement", PdfFormatUtils.safe(payment.getPaymentReference()), boldFont, textFont);
            addKeyValue(details, "Date paiement", PdfFormatUtils.date(payment.getPaymentDate()), boldFont, textFont);
            addKeyValue(details, "Montant", PdfFormatUtils.amount(payment.getAmount()), boldFont, textFont);
            addKeyValue(details, "Methode", payment.getMethod().name(), boldFont, textFont);
            addKeyValue(details, "Client", PdfFormatUtils.safe(clientName), boldFont, textFont);
            addKeyValue(details, "Facture", PdfFormatUtils.safe(invoice.getReference()), boldFont, textFont);
            addKeyValue(details, "Total facture", PdfFormatUtils.amount(invoice.getTotalAmount()), boldFont, textFont);
            addKeyValue(details, "Total paye", PdfFormatUtils.amount(invoice.getPaidAmount()), boldFont, textFont);
            addKeyValue(details, "Reste", PdfFormatUtils.amount(invoice.getRemainingAmount()), boldFont, textFont);
            addKeyValue(details, "Notes", PdfFormatUtils.safe(payment.getNotes()), boldFont, textFont);

            document.add(details);
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Merci pour votre paiement.", textFont));

            document.close();
            return PdfFile.builder()
                .fileName("recu-paiement-" + payment.getId() + ".pdf")
                .content(out.toByteArray())
                .build();
        } catch (DocumentException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to generate payment receipt PDF", e);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to generate payment receipt PDF", e);
        }
    }

    private void addKeyValue(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell keyCell = new PdfPCell(new Phrase(label, labelFont));
        keyCell.setPadding(6f);
        keyCell.setBorder(Rectangle.BOX);
        table.addCell(keyCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setPadding(6f);
        valueCell.setBorder(Rectangle.BOX);
        table.addCell(valueCell);
    }
}
