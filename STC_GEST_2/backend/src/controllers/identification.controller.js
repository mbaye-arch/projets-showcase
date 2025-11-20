import * as stockService from '../services/stock.service.js';

export async function generateInventoryNumber(req, res) {
  const data = await stockService.generateInventoryNumberForStock(Number(req.params.id), {
    prefix: req.body.prefix,
    manualValue: req.body.manualValue
  });

  res.json({ success: true, data });
}

export async function generateBarcode(req, res) {
  const data = await stockService.generateBarcodeForStock(Number(req.params.id));
  res.json({ success: true, data });
}

export async function generateQrCode(req, res) {
  const data = await stockService.generateQrCodeForStock(Number(req.params.id));
  res.json({ success: true, data });
}

export async function labelPreview(req, res) {
  const format = (req.query.format || 'SMALL').toUpperCase();
  const content = (req.query.content || 'BOTH').toUpperCase();

  const data = await stockService.getLabelPreview(Number(req.params.id), { format, content });
  res.json({ success: true, data });
}

export async function labelPdf(req, res) {
  const format = (req.query.format || 'SMALL').toUpperCase();
  const content = (req.query.content || 'BOTH').toUpperCase();

  const data = await stockService.getLabelPdf(Number(req.params.id), { format, content });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="label-${data.stock.numeroInventaire}.pdf"`);
  res.send(data.pdf);
}
