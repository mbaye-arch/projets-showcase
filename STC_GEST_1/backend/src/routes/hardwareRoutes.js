import { Router } from 'express';
import upload from '../middleware/upload.js';
import {
  createHardware,
  deleteHardware,
  deleteHardwareImage,
  getHardwareById,
  getHardwareList,
  updateHardware
} from '../controllers/hardwareController.js';

const router = Router();

const uploadHardwareMedia = upload.fields([
  { name: 'main_image', maxCount: 1 },
  { name: 'gallery', maxCount: 12 },
  { name: 'video', maxCount: 1 }
]);

router.get('/', getHardwareList);
router.get('/:id', getHardwareById);
router.post('/', uploadHardwareMedia, createHardware);
router.put('/:id', uploadHardwareMedia, updateHardware);
router.delete('/:id', deleteHardware);
router.delete('/:id/images/:imageId', deleteHardwareImage);

export default router;
