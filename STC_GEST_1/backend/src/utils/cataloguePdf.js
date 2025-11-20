import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../../');

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';

  const amount = Math.round(Number(value))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return `${amount} FCFA`;
};

const resolveMediaPath = (mediaPath) => {
  if (!mediaPath || typeof mediaPath !== 'string') return null;
  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) return null;

  if (mediaPath.startsWith('uploads/')) {
    return path.join(backendRoot, mediaPath);
  }

  if (path.isAbsolute(mediaPath)) {
    return mediaPath;
  }

  return path.join(backendRoot, mediaPath);
};

const safeImage = (doc, mediaPath, x, y, options) => {
  const resolved = resolveMediaPath(mediaPath);
  if (!resolved || !fs.existsSync(resolved)) return false;

  try {
    doc.image(resolved, x, y, options);
    return true;
  } catch {
    return false;
  }
};

const drawFooter = ({ doc, pageIndex, pageCount, catalogueName, piedDePage }) => {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const footerY = doc.page.height - doc.page.margins.bottom - 10;

  if (piedDePage) {
    doc
      .fillColor('#94A3B8')
      .font('Helvetica')
      .fontSize(7.5)
      .text(piedDePage, left, footerY - 14, {
        width: right - left,
        align: 'center',
        lineBreak: false
      });
  }

  doc
    .save()
    .moveTo(left, footerY - 8)
    .lineTo(right, footerY - 8)
    .lineWidth(0.6)
    .strokeColor('#CBD5E1')
    .stroke()
    .restore();

  doc.fillColor('#64748B').font('Helvetica').fontSize(8).text(catalogueName, left, footerY, {
    width: 250,
    lineBreak: false
  });

  doc
    .fillColor('#64748B')
    .font('Helvetica')
    .fontSize(8)
    .text(`Page ${pageIndex + 1}/${pageCount}`, right - 120, footerY, {
      width: 120,
      align: 'right',
      lineBreak: false
    });
};

export const streamCataloguePdf = ({ data, res }) => {
  const { catalogue, sections = [], totals = {} } = data;

  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: 34,
      bottom: 40,
      left: 34,
      right: 34
    },
    bufferPages: true
  });

  doc.info.Title = catalogue.titre || catalogue.nom || 'Catalogue';
  doc.info.Author = 'SenTechCare';
  doc.info.Subject = 'Catalogue client';
  doc.info.Creator = 'SenTechCare Internal Manager';

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="catalogue-${catalogue.id}.pdf"`);

  doc.pipe(res);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margins = doc.page.margins;
  const contentWidth = pageWidth - margins.left - margins.right;
  const totalVisible = Number(totals.total_visible || 0);

  const coverImageDrawn = safeImage(doc, catalogue.image_couverture, 0, 0, {
    width: pageWidth,
    height: pageHeight
  });

  if (coverImageDrawn) {
    doc.save();
    doc.rect(0, 0, pageWidth, pageHeight).fillOpacity(0.3).fill('#0F172A');
    doc.restore();
  } else {
    doc
      .save()
      .rect(0, 0, pageWidth, pageHeight)
      .fillColor('#F8FAFC')
      .fill()
      .restore();
  }

  doc
    .save()
    .roundedRect(margins.left, margins.top, contentWidth, 96, 12)
    .fillOpacity(0.95)
    .fill(coverImageDrawn ? '#0F172A' : '#0B1324')
    .restore();

  const logoX = margins.left + 14;
  const logoY = margins.top + 14;
  const logoSize = 68;

  doc
    .save()
    .roundedRect(logoX, logoY, logoSize, logoSize, 10)
    .fillColor('#FFFFFF')
    .fill()
    .restore();

  const logoDrawn = safeImage(doc, catalogue.logo, logoX + 6, logoY + 6, {
    fit: [logoSize - 12, logoSize - 12],
    align: 'center',
    valign: 'center'
  });
  if (!logoDrawn) {
    doc
      .fillColor('#0A9468')
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('STC', logoX + 18, logoY + 25, { width: 34, align: 'center' });
  }

  doc.fillColor('#E2E8F0').font('Helvetica').fontSize(9).text('SENTECHCARE', logoX + 84, logoY + 6, {
    width: contentWidth - 110
  });

  doc
    .fillColor('#FFFFFF')
    .font('Helvetica-Bold')
    .fontSize(24)
    .text(catalogue.titre || catalogue.nom, logoX + 84, logoY + 20, {
      width: contentWidth - 110
    });

  if (catalogue.sous_titre) {
    doc
      .fillColor('#E2E8F0')
      .font('Helvetica')
      .fontSize(11)
      .text(catalogue.sous_titre, logoX + 84, doc.y + 4, {
        width: contentWidth - 110
      });
  }

  doc
    .save()
    .roundedRect(margins.left, margins.top + 116, contentWidth, 118, 12)
    .fillOpacity(0.95)
    .fill('#FFFFFF')
    .restore();

  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(11).text('Résumé du catalogue', margins.left + 16, margins.top + 132);

  doc.font('Helvetica').fontSize(9.5).fillColor('#334155');
  doc.text(`Type client: ${catalogue.type_client_nom || '-'}`, margins.left + 16, margins.top + 152);
  doc.text(`Statut: ${catalogue.statut || 'brouillon'}`, margins.left + 16, margins.top + 168);
  doc.text(`Sections: ${sections.length}`, margins.left + 16, margins.top + 184);
  doc.text(`Produits visibles: ${totals.visible_items_with_price || 0}`, margins.left + 16, margins.top + 200);

  if (catalogue.afficher_prix) {
    doc
      .save()
      .roundedRect(margins.left + contentWidth - 220, margins.top + 146, 204, 74, 10)
      .fillColor('#ECFDF3')
      .fill()
      .restore();

    doc
      .fillColor('#047857')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('TOTAL CATALOGUE', margins.left + contentWidth - 208, margins.top + 156);

    doc
      .fillColor('#065F46')
      .font('Helvetica-Bold')
      .fontSize(21)
      .text(formatCurrency(totalVisible), margins.left + contentWidth - 208, margins.top + 173, {
        width: 190
      });
  }

  if (catalogue.description) {
    doc
      .font('Helvetica')
      .fontSize(9.5)
      .fillColor('#475569')
      .text(catalogue.description, margins.left, margins.top + 250, {
        width: contentWidth
      });
  }

  const contentBottom = pageHeight - margins.bottom - 16;
  let y = Math.max(doc.y + 26, margins.top + 300);

  if (y + 120 > contentBottom) {
    doc.addPage();
    y = margins.top;
  }

  const drawContentHeader = () => {
    const title = catalogue.titre || catalogue.nom;

    doc
      .save()
      .roundedRect(margins.left, y, contentWidth, 34, 8)
      .fillColor('#F1F5F9')
      .fill()
      .restore();

    safeImage(doc, catalogue.logo, margins.left + 8, y + 6, {
      fit: [22, 22],
      align: 'center',
      valign: 'center'
    });

    doc
      .fillColor('#0F172A')
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(title, margins.left + 36, y + 11, { width: contentWidth - 40 });

    y += 44;
  };

  const ensureSpace = (neededHeight) => {
    if (y + neededHeight <= contentBottom) return;
    doc.addPage();
    y = margins.top;
    drawContentHeader();
  };

  const drawSectionTitle = (sectionName) => {
    ensureSpace(28);
    doc.fillColor('#0A9468').font('Helvetica-Bold').fontSize(13).text(sectionName, margins.left, y, {
      width: contentWidth
    });
    y = doc.y + 5;
  };

  const drawItemRow = (item) => {
    const hasCharacteristics = catalogue.afficher_caracteristiques && item.display.characteristics;
    const hasNote = Boolean(item.note_commerciale);
    const rowHeight = hasNote ? 108 : hasCharacteristics ? 100 : 92;
    const imageSize = 54;

    ensureSpace(rowHeight + 8);

    doc
      .save()
      .roundedRect(margins.left, y, contentWidth, rowHeight, 8)
      .lineWidth(0.8)
      .fillAndStroke(item.mise_en_avant ? '#F0FDF4' : '#FFFFFF', '#D1D5DB')
      .restore();

    const imageX = margins.left + 10;
    const imageY = y + 10;
    const imageDrawn = safeImage(doc, item.display.image, imageX, imageY, {
      fit: [imageSize, imageSize],
      align: 'center',
      valign: 'center'
    });

    if (!imageDrawn) {
      doc
        .save()
        .roundedRect(imageX, imageY, imageSize, imageSize, 6)
        .fillColor('#F1F5F9')
        .fill()
        .restore();
      doc.fillColor('#64748B').font('Helvetica').fontSize(7.5).text('Image', imageX + 15, imageY + 22);
    }

    const textX = imageX + imageSize + 10;
    const rightZoneWidth = 126;
    const textWidth = contentWidth - (textX - margins.left) - rightZoneWidth - 8;
    const priceX = margins.left + contentWidth - rightZoneWidth;

    doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(10.5).text(item.display.title, textX, y + 10, {
      width: textWidth,
      height: 26
    });

    if (catalogue.afficher_references && item.display.reference) {
      doc.fillColor('#334155').font('Helvetica').fontSize(8.3).text(`Réf: ${item.display.reference}`, textX, y + 35, {
        width: textWidth
      });
    }

    doc
      .fillColor('#334155')
      .font('Helvetica')
      .fontSize(8.3)
      .text(item.display.description || '-', textX, y + 49, {
        width: textWidth,
        height: 30
      });

    if (hasCharacteristics) {
      doc.fillColor('#64748B').fontSize(7.6).text(item.display.characteristics, textX, y + 76, {
        width: textWidth,
        height: 20
      });
    }

    doc
      .save()
      .roundedRect(priceX, y + 8, rightZoneWidth - 8, rowHeight - 16, 8)
      .fillColor('#F8FAFC')
      .fill()
      .restore();

    doc.fillColor('#64748B').font('Helvetica').fontSize(7.6).text(item.display.type_label, priceX + 8, y + 16, {
      width: rightZoneWidth - 24
    });

    if (catalogue.afficher_prix) {
      doc
        .fillColor('#065F46')
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(formatCurrency(item.display.final_price), priceX + 8, y + 34, {
          width: rightZoneWidth - 24
        });

      if (item.remise) {
        doc
          .fillColor('#B45309')
          .font('Helvetica')
          .fontSize(7.5)
          .text(`Remise ${Number(item.remise).toFixed(2)}%`, priceX + 8, y + 50, {
            width: rightZoneWidth - 24
          });
      }
    } else {
      doc.fillColor('#64748B').font('Helvetica').fontSize(8).text('Prix masqué', priceX + 8, y + 36, {
        width: rightZoneWidth - 24
      });
    }

    if (hasNote) {
      doc.fillColor('#1D4ED8').font('Helvetica-Oblique').fontSize(7.5).text(item.note_commerciale, textX, y + rowHeight - 16, {
        width: textWidth + rightZoneWidth - 20
      });
    }

    y += rowHeight + 8;
  };

  drawContentHeader();

  let visibleItemsCount = 0;

  for (const section of sections) {
    const visibleItems = (section.items || []).filter((item) => item.visible);
    if (!visibleItems.length) continue;
    visibleItemsCount += visibleItems.length;

    drawSectionTitle(section.nom);
    for (const item of visibleItems) {
      drawItemRow(item);
    }
  }

  if (visibleItemsCount === 0) {
    ensureSpace(60);
    doc
      .fillColor('#334155')
      .font('Helvetica')
      .fontSize(10)
      .text('Aucun produit visible dans ce catalogue.', margins.left, y + 8);
    y += 24;
  }

  ensureSpace(90);

  doc
    .save()
    .roundedRect(margins.left, y, contentWidth, 62, 10)
    .fillColor('#F8FAFC')
    .fill()
    .restore();

  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(10).text('Synthèse du catalogue', margins.left + 12, y + 12);
  doc.fillColor('#334155').font('Helvetica').fontSize(8.7).text(`Produits visibles: ${visibleItemsCount}`, margins.left + 12, y + 28);

  if (catalogue.afficher_prix) {
    doc
      .fillColor('#047857')
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(formatCurrency(totalVisible), margins.left + contentWidth - 180, y + 22, {
        width: 168,
        align: 'right'
      });
  }

  y += 72;

  if (catalogue.message_final) {
    ensureSpace(56);
    doc
      .fillColor('#0F172A')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Message final', margins.left, y + 4, { width: contentWidth });

    doc
      .fillColor('#334155')
      .font('Helvetica')
      .fontSize(9)
      .text(catalogue.message_final, margins.left, y + 20, { width: contentWidth });
    y = doc.y + 10;
  }

  const range = doc.bufferedPageRange();
  for (let index = 0; index < range.count; index += 1) {
    doc.switchToPage(index);
    drawFooter({
      doc,
      pageIndex: index,
      pageCount: range.count,
      catalogueName: catalogue.nom || 'Catalogue',
      piedDePage: catalogue.pied_de_page
    });
  }

  doc.flushPages();
  doc.end();
};
