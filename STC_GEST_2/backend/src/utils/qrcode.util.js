import QRCode from 'qrcode';

export async function generateQrCodeDataUrl(value, options = {}) {
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 240,
    ...options
  });
}

export function buildQrCodeValue({ strategy, inventoryNumber, baseUrl }) {
  if (strategy === 'INTERNAL_URL') {
    const sanitizedBase = (baseUrl || '').replace(/\/$/, '');
    return `${sanitizedBase}/${encodeURIComponent(inventoryNumber)}`;
  }

  return inventoryNumber;
}
