import * as stockService from '../services/stock.service.js';

export async function listStocks(req, res) {
  const data = await stockService.listStocks();
  res.json({ success: true, data });
}

export async function getStock(req, res) {
  const data = await stockService.getStockById(Number(req.params.id));
  res.json({ success: true, data });
}

export async function getStockByMateriel(req, res) {
  const data = await stockService.getStockByMaterielId(Number(req.params.materielId));
  res.json({ success: true, data });
}

export async function createStock(req, res) {
  const data = await stockService.createStock(req.body);
  res.status(201).json({ success: true, data });
}

export async function updateStock(req, res) {
  const data = await stockService.updateStock(Number(req.params.id), req.body);
  res.json({ success: true, data });
}
