import * as inventaireService from '../services/inventaire.service.js';

export async function listInventaires(req, res) {
  const data = await inventaireService.listInventaires();
  res.json({ success: true, data });
}

export async function getInventaire(req, res) {
  const data = await inventaireService.getInventaireById(Number(req.params.id));
  res.json({ success: true, data });
}

export async function createInventaire(req, res) {
  const data = await inventaireService.createInventaire(req.body);
  res.status(201).json({ success: true, data });
}

export async function addInventaireItems(req, res) {
  const data = await inventaireService.addInventaireItems(Number(req.params.id), req.body);
  res.status(201).json({ success: true, data });
}
