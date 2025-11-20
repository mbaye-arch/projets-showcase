import { Router } from 'express';
import {
  listMateriels,
  getMateriel,
  createMateriel,
  updateMateriel,
  deleteMateriel
} from '../controllers/materiel.controller.js';
import { validate } from '../validation/validate.js';
import { materielSchema, materielUpdateSchema } from '../validation/schemas.js';

const router = Router();

router.get('/', listMateriels);
router.get('/:id', getMateriel);
router.post('/', validate(materielSchema), createMateriel);
router.put('/:id', validate(materielUpdateSchema), updateMateriel);
router.delete('/:id', deleteMateriel);

export default router;
