import * as mouvementService from '../services/mouvement.service.js';

export async function listMouvements(req, res) {
  const data = await mouvementService.listMouvements();
  res.json({ success: true, data });
}

export async function getMouvement(req, res) {
  const data = await mouvementService.getMouvementById(Number(req.params.id));
  res.json({ success: true, data });
}

export async function createMouvement(req, res) {
  const data = await mouvementService.createMouvement(req.body);
  res.status(201).json({ success: true, data });
}
