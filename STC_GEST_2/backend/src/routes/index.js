import { Router } from 'express';
import materielRoutes from './materiel.routes.js';
import stockRoutes from './stock.routes.js';
import mouvementRoutes from './mouvement.routes.js';
import inventaireRoutes from './inventaire.routes.js';
import identificationRoutes from './identification.routes.js';
import rechercheRoutes from './recherche.routes.js';
import parametreRoutes from './parametre.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API STC GETS opérationnelle' });
});

router.use('/materiels', materielRoutes);
router.use('/stocks', stockRoutes);
router.use('/mouvements-stock', mouvementRoutes);
router.use('/inventaires', inventaireRoutes);
router.use('/stocks', identificationRoutes);
router.use('/recherche', rechercheRoutes);
router.use('/parametres', parametreRoutes);

export default router;
