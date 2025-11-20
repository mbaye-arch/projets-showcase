package com.sentechcare.one.invoice.service;

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
import com.sentechcare.one.invoice.entity.InvoiceItem;
import com.sentechcare.one.invoice.repository.InvoiceRepository;
import com.sentechcare.one.payment.entity.Payment;
import java.io.ByteArrayOutputStream;
import java.util.Comparator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InvoicePdfService {

    private final InvoiceRepository invoiceRepository;

    public PdfFile generate(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found with id: " + invoiceId));

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 9);

            PdfBrandingUtils.addBrandHeader(document, "SenTechCare - Facture");

            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[] {55f, 45f});

            Client client = invoice.getClient();
            String clientName = client.getCompanyName() != null
                ? client.getCompanyName()
                : (PdfFormatUtils.safe(client.getFirstName()) + " " + PdfFormatUtils.safe(client.getLastName())).trim();

            PdfPCell left = new PdfPCell();
            left.setBorder(Rectangle.NO_BORDER);
            left.addElement(new Paragraph("Client: " + PdfFormatUtils.safe(clientName), textFont));
            left.addElement(new Paragraph("Telephone: " + PdfFormatUtils.safe(client.getPhone()), smallFont));
            left.addElement(new Paragraph("Email: " + PdfFormatUtils.safe(client.getEmail()), smallFont));
            left.addElement(new Paragraph("Adresse: " + PdfFormatUtils.safe(client.getAddress()), smallFont));
            headerTable.addCell(left);

            PdfPCell right = new PdfPCell();
            right.setBorder(Rectangle.NO_BORDER);
            right.addElement(new Paragraph("Reference: " + PdfFormatUtils.safe(invoice.getReference()), textFont));
            right.addElement(new Paragraph("Date emission: " + PdfFormatUtils.date(invoice.getIssueDate()), textFont));
            right.addElement(new Paragraph("Date echeance: " + PdfFormatUtils.date(invoice.getDueDate()), textFont));
            right.addElement(new Paragraph("Statut: " + invoice.getStatus(), textFont));
            headerTable.addCell(right);

            document.add(headerTable);
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Lignes de facture", sectionFont));
            document.add(new Paragraph(" "));

            PdfPTable itemsTable = new PdfPTable(4);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[] {50f, 15f, 17f, 18f});
            addHeaderCell(itemsTable, "Description");
            addHeaderCell(itemsTable, "Qte");
            addHeaderCell(itemsTable, "Prix unitaire");
            addHeaderCell(itemsTable, "Total ligne");

            invoice.getItems().stream()
                .sorted(Comparator.comparing(InvoiceItem::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                .forEach(item -> {
                    addBodyCell(itemsTable, PdfFormatUtils.safe(item.getDescription()));
                    addBodyCell(itemsTable, PdfFormatUtils.amount(item.getQuantity()));
                    addBodyCell(itemsTable, PdfFormatUtils.amount(item.getUnitPrice()));
                    addBodyCell(itemsTable, PdfFormatUtils.amount(item.getLineTotal()));
                });

            document.add(itemsTable);
            document.add(new Paragraph(" "));

            PdfPTable totals = new PdfPTable(2);
            totals.setHorizontalAlignment(PdfPTable.ALIGN_RIGHT);
            totals.setWidthPercentage(45);
            totals.setWidths(new float[] {55f, 45f});
            addTotalCell(totals, "Total");
            addTotalCell(totals, PdfFormatUtils.amount(invoice.getTotalAmount()));
            addTotalCell(totals, "Paye");
            addTotalCell(totals, PdfFormatUtils.amount(invoice.getPaidAmount()));
            addTotalCell(totals, "Reste");
            addTotalCell(totals, PdfFormatUtils.amount(invoice.getRemainingAmount()));
            document.add(totals);

            if (!invoice.getPayments().isEmpty()) {
                document.add(new Paragraph(" "));
                document.add(new Paragraph("Paiements", sectionFont));
                document.add(new Paragraph(" "));

                PdfPTable paymentsTable = new PdfPTable(4);
                paymentsTable.setWidthPercentage(100);
                paymentsTable.setWidths(new float[] {18f, 18f, 34f, 30f});
                addHeaderCell(paymentsTable, "Date");
                addHeaderCell(paymentsTable, "Montant");
                addHeaderCell(paymentsTable, "Methode");
                addHeaderCell(paymentsTable, "Reference");

                invoice.getPayments().stream()
                    .sorted(Comparator.comparing(Payment::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                    .forEach(payment -> {
                        addBodyCell(paymentsTable, PdfFormatUtils.date(payment.getPaymentDate()));
                        addBodyCell(paymentsTable, PdfFormatUtils.amount(payment.getAmount()));
                        addBodyCell(paymentsTable, payment.getMethod().name());
                        addBodyCell(paymentsTable, PdfFormatUtils.safe(payment.getPaymentReference()));
                    });

                document.add(paymentsTable);
            }

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Notes: " + PdfFormatUtils.safe(invoice.getNotes()), smallFont));

            document.close();
            return PdfFile.builder()
                .fileName("facture-" + PdfFormatUtils.fileSafe(invoice.getReference()) + ".pdf")
                .content(out.toByteArray())
                .build();
        } catch (DocumentException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to generate invoice PDF", e);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to generate invoice PDF", e);
        }
    }

    private void addHeaderCell(PdfPTable table, String value) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        PdfPCell cell = new PdfPCell(new Phrase(value, font));
        cell.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
        cell.setPadding(6f);
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String value) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA, 10);
        PdfPCell cell = new PdfPCell(new Phrase(value, font));
        cell.setPadding(5f);
        table.addCell(cell);
    }

    private void addTotalCell(PdfPTable table, String value) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        PdfPCell cell = new PdfPCell(new Phrase(value, font));
        cell.setPadding(5f);
        table.addCell(cell);
    }
}
