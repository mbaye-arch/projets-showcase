import { Router } from 'express';
import {
  createClientType,
  deleteClientType,
  getClientTypes,
  updateClientType
} from '../controllers/clientTypesController.js';

const router = Router();

router.get('/', getClientTypes);
router.post('/', createClientType);
router.put('/:id', updateClientType);
router.delete('/:id', deleteClientType);

export default router;
