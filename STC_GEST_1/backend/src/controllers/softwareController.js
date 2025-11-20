import db from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const sanitize = (value) => (typeof value === 'string' ? value.trim() : value);

const parseNullableNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
};

const parseNullableInt = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const number = Number.parseInt(value, 10);
  return Number.isNaN(number) ? null : number;
};

const parseBooleanTinyInt = (value) => {
  if (typeof value === 'boolean') return value ? 1 : 0;
  const normalized = String(value || '').trim().toLowerCase();
  return ['1', 'true', 'yes', 'oui'].includes(normalized) ? 1 : 0;
};

export const getSoftwareList = asyncHandler(async (req, res) => {
  const { q, software_type, category_id, has_license } = req.query;

  const whereClauses = [];
  const params = [];

  if (q) {
    whereClauses.push('(sw.name LIKE ? OR sw.vendor_name LIKE ? OR sw.compatibility LIKE ? OR sw.description LIKE ?)');
    const search = `%${q}%`;
    params.push(search, search, search, search);
  }

  if (software_type) {
    whereClauses.push('sw.software_type = ?');
    params.push(software_type);
  }

  if (category_id) {
    whereClauses.push('sw.category_id = ?');
    params.push(category_id);
  }

  if (has_license !== undefined && has_license !== '') {
    whereClauses.push('sw.has_license = ?');
    params.push(parseBooleanTinyInt(has_license));
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const [rows] = await db.query(
    `
      SELECT
        sw.*,
        c.name AS category_name,
        c.category_type
      FROM software sw
      LEFT JOIN categories c ON c.id = sw.category_id
      ${whereSql}
      ORDER BY sw.created_at DESC
    `,
    params
  );

  res.json({
    success: true,
    data: rows
  });
});

export const getSoftwareById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query(
    `
      SELECT
        sw.*,
        c.name AS category_name,
        c.category_type
      FROM software sw
      LEFT JOIN categories c ON c.id = sw.category_id
      WHERE sw.id = ?
    `,
    [id]
  );

  const software = rows[0];

  if (!software) {
    throw new HttpError(404, 'Software not found');
  }

  res.json({
    success: true,
    data: software
  });
});

export const createSoftware = asyncHandler(async (req, res) => {
  const payload = {
    name: sanitize(req.body.name),
    software_type: sanitize(req.body.software_type) || null,
    category_id: parseNullableInt(req.body.category_id),
    description: sanitize(req.body.description) || null,
    usage_purpose: sanitize(req.body.usage_purpose) || null,
    has_license: parseBooleanTinyInt(req.body.has_license),
    price: parseNullableNumber(req.body.price),
    vendor_name: sanitize(req.body.vendor_name) || null,
    compatibility: sanitize(req.body.compatibility) || null,
    notes: sanitize(req.body.notes) || null
  };

  if (!payload.name) {
    throw new HttpError(400, 'Software name is required');
  }

  const [result] = await db.query(
    `
      INSERT INTO software (
        name,
        software_type,
        category_id,
        description,
        usage_purpose,
        has_license,
        price,
        vendor_name,
        compatibility,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.name,
      payload.software_type,
      payload.category_id,
      payload.description,
      payload.usage_purpose,
      payload.has_license,
      payload.price,
      payload.vendor_name,
      payload.compatibility,
      payload.notes
    ]
  );

  const [createdRows] = await db.query('SELECT * FROM software WHERE id = ?', [result.insertId]);

  res.status(201).json({
    success: true,
    message: 'Software created successfully',
    data: createdRows[0]
  });
});

export const updateSoftware = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existingRows] = await db.query('SELECT * FROM software WHERE id = ?', [id]);
  const existing = existingRows[0];

  if (!existing) {
    throw new HttpError(404, 'Software not found');
  }

  const payload = {
    name: sanitize(req.body.name) ?? existing.name,
    software_type: sanitize(req.body.software_type) ?? existing.software_type,
    category_id:
      req.body.category_id === undefined ? existing.category_id : parseNullableInt(req.body.category_id),
    description: sanitize(req.body.description) ?? existing.description,
    usage_purpose: sanitize(req.body.usage_purpose) ?? existing.usage_purpose,
    has_license: req.body.has_license === undefined ? existing.has_license : parseBooleanTinyInt(req.body.has_license),
    price: req.body.price === undefined ? existing.price : parseNullableNumber(req.body.price),
    vendor_name: sanitize(req.body.vendor_name) ?? existing.vendor_name,
    compatibility: sanitize(req.body.compatibility) ?? existing.compatibility,
    notes: sanitize(req.body.notes) ?? existing.notes
  };

  if (!payload.name) {
    throw new HttpError(400, 'Software name is required');
  }

  await db.query(
    `
      UPDATE software
      SET
        name = ?,
        software_type = ?,
        category_id = ?,
        description = ?,
        usage_purpose = ?,
        has_license = ?,
        price = ?,
        vendor_name = ?,
        compatibility = ?,
        notes = ?
      WHERE id = ?
    `,
    [
      payload.name,
      payload.software_type,
      payload.category_id,
      payload.description,
      payload.usage_purpose,
      payload.has_license,
      payload.price,
      payload.vendor_name,
      payload.compatibility,
      payload.notes,
      id
    ]
  );

  const [updatedRows] = await db.query('SELECT * FROM software WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'Software updated successfully',
    data: updatedRows[0]
  });
});

export const deleteSoftware = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existingRows] = await db.query('SELECT id FROM software WHERE id = ?', [id]);
  if (!existingRows[0]) {
    throw new HttpError(404, 'Software not found');
  }

  await db.query('DELETE FROM software WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'Software deleted successfully'
  });
});
