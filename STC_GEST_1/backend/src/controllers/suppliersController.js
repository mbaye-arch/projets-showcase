import db from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const sanitize = (value) => (typeof value === 'string' ? value.trim() : value);

const buildSupplierPayload = (body) => ({
  name: sanitize(body.name),
  country: sanitize(body.country) || null,
  city: sanitize(body.city) || null,
  phone: sanitize(body.phone) || null,
  email: sanitize(body.email) || null,
  supplier_type: sanitize(body.supplier_type) || null,
  platform: sanitize(body.platform) || null,
  delivery_delay: sanitize(body.delivery_delay) || null,
  reliability_level: sanitize(body.reliability_level) || null,
  notes: sanitize(body.notes) || null
});

export const getSuppliers = asyncHandler(async (req, res) => {
  const { q, platform, supplier_type, country } = req.query;

  const whereClauses = [];
  const params = [];

  if (q) {
    whereClauses.push('(s.name LIKE ? OR s.city LIKE ? OR s.country LIKE ? OR s.email LIKE ? OR s.platform LIKE ?)');
    const search = `%${q}%`;
    params.push(search, search, search, search, search);
  }

  if (platform) {
    whereClauses.push('s.platform = ?');
    params.push(platform);
  }

  if (supplier_type) {
    whereClauses.push('s.supplier_type = ?');
    params.push(supplier_type);
  }

  if (country) {
    whereClauses.push('s.country = ?');
    params.push(country);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const [rows] = await db.query(
    `
      SELECT
        s.*,
        COUNT(h.id) AS hardware_count
      FROM suppliers s
      LEFT JOIN hardware h ON h.supplier_id = s.id
      ${whereSql}
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `,
    params
  );

  res.json({
    success: true,
    data: rows
  });
});

export const getSupplierById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [supplierRows] = await db.query('SELECT * FROM suppliers WHERE id = ?', [id]);
  const supplier = supplierRows[0];

  if (!supplier) {
    throw new HttpError(404, 'Supplier not found');
  }

  const [hardwareRows] = await db.query(
    `
      SELECT
        h.id,
        h.name,
        h.reference,
        h.brand,
        h.model,
        h.sale_price,
        h.condition_state,
        h.main_image,
        c.name AS category_name
      FROM hardware h
      LEFT JOIN categories c ON c.id = h.category_id
      WHERE h.supplier_id = ?
      ORDER BY h.created_at DESC
    `,
    [id]
  );

  res.json({
    success: true,
    data: {
      supplier,
      hardwareItems: hardwareRows
    }
  });
});

export const createSupplier = asyncHandler(async (req, res) => {
  const payload = buildSupplierPayload(req.body);

  if (!payload.name) {
    throw new HttpError(400, 'Supplier name is required');
  }

  const [result] = await db.query(
    `
      INSERT INTO suppliers (
        name,
        country,
        city,
        phone,
        email,
        supplier_type,
        platform,
        delivery_delay,
        reliability_level,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.name,
      payload.country,
      payload.city,
      payload.phone,
      payload.email,
      payload.supplier_type,
      payload.platform,
      payload.delivery_delay,
      payload.reliability_level,
      payload.notes
    ]
  );

  const [createdRows] = await db.query('SELECT * FROM suppliers WHERE id = ?', [result.insertId]);

  res.status(201).json({
    success: true,
    message: 'Supplier created successfully',
    data: createdRows[0]
  });
});

export const updateSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existingRows] = await db.query('SELECT * FROM suppliers WHERE id = ?', [id]);
  const existing = existingRows[0];

  if (!existing) {
    throw new HttpError(404, 'Supplier not found');
  }

  const incoming = buildSupplierPayload(req.body);

  const payload = {
    name: incoming.name ?? existing.name,
    country: incoming.country ?? existing.country,
    city: incoming.city ?? existing.city,
    phone: incoming.phone ?? existing.phone,
    email: incoming.email ?? existing.email,
    supplier_type: incoming.supplier_type ?? existing.supplier_type,
    platform: incoming.platform ?? existing.platform,
    delivery_delay: incoming.delivery_delay ?? existing.delivery_delay,
    reliability_level: incoming.reliability_level ?? existing.reliability_level,
    notes: incoming.notes ?? existing.notes
  };

  if (!payload.name) {
    throw new HttpError(400, 'Supplier name is required');
  }

  await db.query(
    `
      UPDATE suppliers
      SET
        name = ?,
        country = ?,
        city = ?,
        phone = ?,
        email = ?,
        supplier_type = ?,
        platform = ?,
        delivery_delay = ?,
        reliability_level = ?,
        notes = ?
      WHERE id = ?
    `,
    [
      payload.name,
      payload.country,
      payload.city,
      payload.phone,
      payload.email,
      payload.supplier_type,
      payload.platform,
      payload.delivery_delay,
      payload.reliability_level,
      payload.notes,
      id
    ]
  );

  const [updatedRows] = await db.query('SELECT * FROM suppliers WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'Supplier updated successfully',
    data: updatedRows[0]
  });
});

export const deleteSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existingRows] = await db.query('SELECT id FROM suppliers WHERE id = ?', [id]);
  if (!existingRows[0]) {
    throw new HttpError(404, 'Supplier not found');
  }

  try {
    await db.query('DELETE FROM suppliers WHERE id = ?', [id]);
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new HttpError(409, 'Cannot delete supplier linked to hardware items');
    }
    throw error;
  }

  res.json({
    success: true,
    message: 'Supplier deleted successfully'
  });
});
