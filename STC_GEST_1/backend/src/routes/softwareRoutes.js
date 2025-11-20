import { Router } from 'express';
import {
  createSoftware,
  deleteSoftware,
  getSoftwareById,
  getSoftwareList,
  updateSoftware
} from '../controllers/softwareController.js';

const router = Router();

router.get('/', getSoftwareList);
router.get('/:id', getSoftwareById);
router.post('/', createSoftware);
router.put('/:id', updateSoftware);
router.delete('/:id', deleteSoftware);

export default router;
