import { Router } from 'express';
import {
  getParametresController,
  updateParametresController
} from '../controllers/parametre.controller.js';
import { validate } from '../validation/validate.js';
import { settingsSchema } from '../validation/schemas.js';

const router = Router();

router.get('/', getParametresController);
router.put('/', validate(settingsSchema), updateParametresController);

export default router;
