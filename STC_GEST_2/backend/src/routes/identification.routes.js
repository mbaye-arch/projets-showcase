import { Router } from 'express';
import {
  generateInventoryNumber,
  generateBarcode,
  generateQrCode,
  labelPreview,
  labelPdf
} from '../controllers/identification.controller.js';

const router = Router();

router.post('/:id/generate-inventory-number', generateInventoryNumber);
router.post('/:id/generate-barcode', generateBarcode);
router.post('/:id/generate-qrcode', generateQrCode);
router.get('/:id/label-preview', labelPreview);
router.get('/:id/label-pdf', labelPdf);

export default router;
