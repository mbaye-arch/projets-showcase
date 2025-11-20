import * as materielService from '../services/materiel.service.js';

export async function listMateriels(req, res) {
  const data = await materielService.listMateriels();
  res.json({ success: true, data });
}

export async function getMateriel(req, res) {
  const data = await materielService.getMaterielById(Number(req.params.id));
  res.json({ success: true, data });
}

export async function createMateriel(req, res) {
  const data = await materielService.createMateriel(req.body);
  res.status(201).json({ success: true, data });
}

export async function updateMateriel(req, res) {
  const data = await materielService.updateMateriel(Number(req.params.id), req.body);
  res.json({ success: true, data });
}

export async function deleteMateriel(req, res) {
  const data = await materielService.deleteMateriel(Number(req.params.id));
  res.json({ success: true, data });
}
