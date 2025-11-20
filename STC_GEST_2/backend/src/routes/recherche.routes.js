import { Router } from 'express';
import { rechercheMateriel } from '../controllers/recherche.controller.js';

const router = Router();

router.get('/materiel/:value', rechercheMateriel);

export default router;
