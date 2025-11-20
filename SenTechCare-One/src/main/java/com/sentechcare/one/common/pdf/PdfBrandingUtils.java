package com.sentechcare.one.common.pdf;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import java.io.IOException;
import java.io.InputStream;
import org.springframework.core.io.ClassPathResource;

public final class PdfBrandingUtils {

    private static final String LOGO_CLASSPATH = "pdf/logo.png";

    private PdfBrandingUtils() {
    }

    public static void addBrandHeader(Document document, String title) throws DocumentException {
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Font fallbackLogoFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

        PdfPTable brandTable = new PdfPTable(2);
        brandTable.setWidthPercentage(100);
        brandTable.setWidths(new float[] {30f, 70f});

        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        logoCell.setVerticalAlignment(PdfPCell.ALIGN_MIDDLE);

        Image logo = loadLogo();
        if (logo != null) {
            logo.scaleToFit(145f, 45f);
            logoCell.addElement(logo);
        } else {
            logoCell.addElement(new Paragraph("SenTechCare", fallbackLogoFont));
        }

        PdfPCell titleCell = new PdfPCell();
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setVerticalAlignment(PdfPCell.ALIGN_MIDDLE);
        titleCell.addElement(new Paragraph(title, titleFont));

        brandTable.addCell(logoCell);
        brandTable.addCell(titleCell);

        document.add(brandTable);
        document.add(new Paragraph(" "));
    }

    private static Image loadLogo() {
        ClassPathResource resource = new ClassPathResource(LOGO_CLASSPATH);
        if (!resource.exists()) {
            return null;
        }

        try (InputStream inputStream = resource.getInputStream()) {
            return Image.getInstance(inputStream.readAllBytes());
        } catch (IOException | com.lowagie.text.BadElementException e) {
            return null;
        }
    }
}
