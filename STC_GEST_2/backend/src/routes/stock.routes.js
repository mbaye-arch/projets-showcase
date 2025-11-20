import { Router } from 'express';
import {
  listStocks,
  getStock,
  getStockByMateriel,
  createStock,
  updateStock
} from '../controllers/stock.controller.js';
import { validate } from '../validation/validate.js';
import { stockSchema, stockUpdateSchema } from '../validation/schemas.js';

const router = Router();

router.get('/', listStocks);
router.get('/materiel/:materielId', getStockByMateriel);
router.get('/:id', getStock);
router.post('/', validate(stockSchema), createStock);
router.put('/:id', validate(stockUpdateSchema), updateStock);

export default router;
