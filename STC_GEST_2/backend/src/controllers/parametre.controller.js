import { getParametres, updateParametres } from '../services/parametre.service.js';

export async function getParametresController(req, res) {
  const data = await getParametres();
  res.json({ success: true, data });
}

export async function updateParametresController(req, res) {
  const data = await updateParametres(req.body);
  res.json({ success: true, data });
}
