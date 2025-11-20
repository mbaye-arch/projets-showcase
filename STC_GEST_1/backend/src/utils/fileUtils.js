import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../../');

export const removeUploadedFile = async (relativePath) => {
  if (!relativePath || typeof relativePath !== 'string') return;

  // Avoid deleting arbitrary filesystem paths by restricting to uploads/.
  if (!relativePath.startsWith('uploads/')) return;

  const absolutePath = path.join(backendRoot, relativePath);

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      // Non-fatal for API workflow, but useful for diagnostics.
      console.error(`Could not delete file: ${absolutePath}`, error.message);
    }
  }
};
