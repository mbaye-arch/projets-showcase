import { rechercheMaterielByValue } from '../services/recherche.service.js';

export async function rechercheMateriel(req, res) {
  const data = await rechercheMaterielByValue(req.params.value);
  res.json({ success: true, data });
}
