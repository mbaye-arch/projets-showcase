package com.sentechcare.one.common.pdf;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class PdfFormatUtils {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private PdfFormatUtils() {
    }

    public static String safe(String value) {
        return value == null || value.isBlank() ? "-" : value.trim();
    }

    public static String amount(BigDecimal value) {
        BigDecimal scaled = value == null ? BigDecimal.ZERO : value.setScale(2, RoundingMode.HALF_UP);
        return scaled.toPlainString();
    }

    public static String date(LocalDate value) {
        return value == null ? "-" : DATE_FORMATTER.format(value);
    }

    public static String dateTime(LocalDateTime value) {
        return value == null ? "-" : DATE_TIME_FORMATTER.format(value);
    }

    public static String fileSafe(String value) {
        String normalized = safe(value).replace(' ', '_');
        return normalized.replaceAll("[^a-zA-Z0-9._-]", "");
    }
}
