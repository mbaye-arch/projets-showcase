package com.sentechcare.one.quote.service;

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
import com.sentechcare.one.quote.entity.Quote;
import com.sentechcare.one.quote.entity.QuoteItem;
import com.sentechcare.one.quote.repository.QuoteRepository;
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
public class QuotePdfService {

    private final QuoteRepository quoteRepository;

    public PdfFile generate(Long quoteId) {
        Quote quote = quoteRepository.findById(quoteId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote not found with id: " + quoteId));

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 9);

            PdfBrandingUtils.addBrandHeader(document, "SenTechCare - Devis");

            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[] {55f, 45f});

            Client client = quote.getClient();
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
            right.addElement(new Paragraph("Reference: " + PdfFormatUtils.safe(quote.getReference()), textFont));
            right.addElement(new Paragraph("Date: " + PdfFormatUtils.date(quote.getQuoteDate()), textFont));
            right.addElement(new Paragraph("Statut: " + quote.getStatus(), textFont));
            headerTable.addCell(right);

            document.add(headerTable);
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Lignes du devis", sectionFont));
            document.add(new Paragraph(" "));

            PdfPTable itemsTable = new PdfPTable(4);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[] {50f, 15f, 17f, 18f});
            addHeaderCell(itemsTable, "Description");
            addHeaderCell(itemsTable, "Qte");
            addHeaderCell(itemsTable, "Prix unitaire");
            addHeaderCell(itemsTable, "Total ligne");

            quote.getItems().stream()
                .sorted(Comparator.comparing(QuoteItem::getId, Comparator.nullsLast(Comparator.naturalOrder())))
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
            addTotalCell(totals, "Sous-total");
            addTotalCell(totals, PdfFormatUtils.amount(quote.getSubtotal()));
            addTotalCell(totals, "Remise");
            addTotalCell(totals, PdfFormatUtils.amount(quote.getDiscountAmount()));
            addTotalCell(totals, "Total");
            addTotalCell(totals, PdfFormatUtils.amount(quote.getTotalAmount()));
            document.add(totals);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Notes: " + PdfFormatUtils.safe(quote.getNotes()), smallFont));

            document.close();
            return PdfFile.builder()
                .fileName("devis-" + PdfFormatUtils.fileSafe(quote.getReference()) + ".pdf")
                .content(out.toByteArray())
                .build();
        } catch (DocumentException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to generate quote PDF", e);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to generate quote PDF", e);
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
