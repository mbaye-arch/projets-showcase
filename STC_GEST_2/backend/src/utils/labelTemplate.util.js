const LABEL_SIZE = {
  TINY: { width: 40, height: 20 },
  SMALL: { width: 60, height: 35 },
  STANDARD: { width: 90, height: 50 }
};

export function buildLabelHtml({
  materiel,
  stock,
  barcodeSvg,
  qrCodeDataUrl,
  format = 'SMALL',
  content = 'BOTH'
}) {
  const size = LABEL_SIZE[format] || LABEL_SIZE.SMALL;
  const showBarcode = content === 'BOTH' || content === 'BARCODE';
  const showQrCode = content === 'BOTH' || content === 'QRCODE';

  const compactTitle = [materiel.nom, materiel.marque, materiel.modele].filter(Boolean).join(' · ');

  return `
  <!DOCTYPE html>
  <html lang="fr">
    <head>
      <meta charset="utf-8" />
      <style>
        @page {
          size: ${size.width}mm ${size.height}mm;
          margin: 0;
        }

        * { box-sizing: border-box; }

        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #111827;
        }

        .label {
          width: ${size.width}mm;
          height: ${size.height}mm;
          border: 0.25mm solid #d1d5db;
          border-radius: 1.5mm;
          padding: 1.5mm;
          display: grid;
          grid-template-columns: ${showQrCode && showBarcode ? '1fr 22mm' : '1fr'};
          gap: 1.5mm;
          background: #ffffff;
        }

        .left {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .title {
          font-size: 2.7mm;
          font-weight: 700;
          margin: 0;
          line-height: 1.15;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sub {
          margin-top: 0.7mm;
          font-size: 2.15mm;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #374151;
        }

        .inv {
          margin-top: 0.8mm;
          font-size: 2.4mm;
          font-weight: 700;
          color: #0f766e;
          letter-spacing: 0.1mm;
        }

        .barcode {
          margin-top: auto;
          width: 100%;
          display: flex;
          align-items: flex-end;
        }

        .barcode svg {
          width: 100%;
          height: auto;
          max-height: ${showQrCode ? '11.5mm' : '16mm'};
        }

        .right {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .right img {
          width: 100%;
          height: auto;
          max-height: ${size.height - 5}mm;
          object-fit: contain;
        }
      </style>
    </head>
    <body>
      <div class="label">
        <div class="left">
          <p class="title">${compactTitle}</p>
          <p class="sub">Ref: ${materiel.reference || 'N/A'}</p>
          <p class="inv">${stock.numeroInventaire}</p>
          ${showBarcode ? `<div class="barcode">${barcodeSvg}</div>` : ''}
        </div>
        ${showQrCode ? `<div class="right"><img src="${qrCodeDataUrl}" alt="QR Code" /></div>` : ''}
      </div>
    </body>
  </html>
  `;
}
