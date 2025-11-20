package com.sentechcare.one.common.util;

import com.sentechcare.one.common.pdf.PdfFile;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

public final class FileDownloadUtils {

    private FileDownloadUtils() {
    }

    public static ResponseEntity<ByteArrayResource> pdf(PdfFile pdfFile) {
        ByteArrayResource resource = new ByteArrayResource(pdfFile.getContent());

        ContentDisposition disposition = ContentDisposition.attachment()
            .filename(pdfFile.getFileName())
            .build();

        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
            .contentLength(pdfFile.getContent().length)
            .body(resource);
    }
}
