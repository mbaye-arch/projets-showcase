import db from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const sanitize = (value) => (typeof value === 'string' ? value.trim() : value);

export const getClientTypes = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const where = [];
  const params = [];

  if (q) {
    where.push('(tc.nom LIKE ? OR tc.description LIKE ?)');
    const search = `%${q}%`;
    params.push(search, search);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [rows] = await db.query(
    `
      SELECT
        tc.*,
        (
          SELECT COUNT(*)
          FROM catalogues c
          WHERE c.type_client_id = tc.id
        ) AS catalogues_count
      FROM types_clients tc
      ${whereSql}
      ORDER BY tc.nom ASC
    `,
    params
  );

  res.json({
    success: true,
    data: rows
  });
});

export const createClientType = asyncHandler(async (req, res) => {
  const nom = sanitize(req.body.nom);
  const description = sanitize(req.body.description) || null;

  if (!nom) {
    throw new HttpError(400, 'Le nom du type client est requis');
  }

  try {
    const [result] = await db.query(
      `
        INSERT INTO types_clients (nom, description)
        VALUES (?, ?)
      `,
      [nom, description]
    );

    const [rows] = await db.query('SELECT * FROM types_clients WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Type client créé avec succès',
      data: rows[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'Ce type client existe déjà');
    }
    throw error;
  }
});

export const updateClientType = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existingRows] = await db.query('SELECT * FROM types_clients WHERE id = ?', [id]);
  const existing = existingRows[0];

  if (!existing) {
    throw new HttpError(404, 'Type client introuvable');
  }

  const nom = sanitize(req.body.nom) ?? existing.nom;
  const description = sanitize(req.body.description) ?? existing.description;

  if (!nom) {
    throw new HttpError(400, 'Le nom du type client est requis');
  }

  try {
    await db.query(
      `
        UPDATE types_clients
        SET nom = ?, description = ?
        WHERE id = ?
      `,
      [nom, description, id]
    );
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'Ce type client existe déjà');
    }
    throw error;
  }

  const [rows] = await db.query('SELECT * FROM types_clients WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'Type client mis à jour',
    data: rows[0]
  });
});

export const deleteClientType = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existingRows] = await db.query('SELECT * FROM types_clients WHERE id = ?', [id]);
  if (!existingRows[0]) {
    throw new HttpError(404, 'Type client introuvable');
  }

  await db.query('DELETE FROM types_clients WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'Type client supprimé'
  });
});
