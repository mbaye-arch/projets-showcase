import { Router } from 'express';
import upload from '../middleware/upload.js';
import {
  addCatalogueItems,
  createCatalogue,
  createCatalogueSection,
  deleteCatalogue,
  deleteCatalogueItem,
  deleteCatalogueSection,
  duplicateCatalogue,
  exportCataloguePdf,
  getCatalogueById,
  getCataloguePreview,
  getCatalogues,
  updateCatalogue,
  updateCatalogueItem,
  updateCatalogueSection
} from '../controllers/cataloguesController.js';

const router = Router();

const catalogueMediaUpload = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'image_couverture', maxCount: 1 }
]);

const catalogueItemImageUpload = upload.single('image_specifique');

router.get('/', getCatalogues);
router.get('/:id', getCatalogueById);
router.post('/', catalogueMediaUpload, createCatalogue);
router.put('/:id', catalogueMediaUpload, updateCatalogue);
router.delete('/:id', deleteCatalogue);
router.post('/:id/duplicate', duplicateCatalogue);
router.get('/:id/preview', getCataloguePreview);
router.get('/:id/export-pdf', exportCataloguePdf);

router.post('/:id/sections', createCatalogueSection);
router.put('/:id/sections/:sectionId', updateCatalogueSection);
router.delete('/:id/sections/:sectionId', deleteCatalogueSection);

router.post('/:id/items', catalogueItemImageUpload, addCatalogueItems);
router.put('/:id/items/:itemId', catalogueItemImageUpload, updateCatalogueItem);
router.delete('/:id/items/:itemId', deleteCatalogueItem);

export default router;
