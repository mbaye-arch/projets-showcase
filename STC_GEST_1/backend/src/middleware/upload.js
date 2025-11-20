import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 50);

    cb(null, `${Date.now()}-${safeName}${ext}`);
  }
});

const imageMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
const videoMimeTypes = ['video/mp4', 'video/webm'];

const fileFilter = (req, file, cb) => {
  const isVideoField = file.fieldname === 'video';

  if (isVideoField && videoMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  if (!isVideoField && imageMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  const error = new Error('Unsupported file format. Allowed: jpg, jpeg, png, webp, mp4, webm');
  error.statusCode = 400;
  return cb(error);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_SIZE || 50 * 1024 * 1024) // 50MB default
  }
});

export default upload;
