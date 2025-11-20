import { Router } from 'express';
import { listMouvements, getMouvement, createMouvement } from '../controllers/mouvement.controller.js';
import { validate } from '../validation/validate.js';
import { movementSchema } from '../validation/schemas.js';

const router = Router();

router.get('/', listMouvements);
router.get('/:id', getMouvement);
router.post('/', validate(movementSchema), createMouvement);

export default router;
