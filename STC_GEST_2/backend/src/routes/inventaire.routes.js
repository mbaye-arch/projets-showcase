import { Router } from 'express';
import {
  listInventaires,
  getInventaire,
  createInventaire,
  addInventaireItems
} from '../controllers/inventaire.controller.js';
import { validate } from '../validation/validate.js';
import { inventaireSchema, inventaireItemsSchema } from '../validation/schemas.js';

const router = Router();

router.get('/', listInventaires);
router.get('/:id', getInventaire);
router.post('/', validate(inventaireSchema), createInventaire);
router.post('/:id/items', validate(inventaireItemsSchema), addInventaireItems);

export default router;
