import db from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const sanitize = (value) => (typeof value === 'string' ? value.trim() : value);

const buildCategoryPayload = (body) => ({
  name: sanitize(body.name),
  category_type: sanitize(body.category_type) || null,
  description: sanitize(body.description) || null
});

export const getCategories = asyncHandler(async (req, res) => {
  const { q, category_type } = req.query;

  const whereClauses = [];
  const params = [];

  if (q) {
    whereClauses.push('(c.name LIKE ? OR c.description LIKE ?)');
    const search = `%${q}%`;
    params.push(search, search);
  }

  if (category_type) {
    whereClauses.push('c.category_type = ?');
    params.push(category_type);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const [rows] = await db.query(
    `
      SELECT
        c.*,
        COUNT(DISTINCT h.id) AS hardware_count,
        COUNT(DISTINCT s.id) AS software_count
      FROM categories c
      LEFT JOIN hardware h ON h.category_id = c.id
      LEFT JOIN software s ON s.category_id = c.id
      ${whereSql}
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `,
    params
  );

  res.json({
    success: true,
    data: rows
  });
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query(
    `
      SELECT
        c.*,
        COUNT(DISTINCT h.id) AS hardware_count,
        COUNT(DISTINCT s.id) AS software_count
      FROM categories c
      LEFT JOIN hardware h ON h.category_id = c.id
      LEFT JOIN software s ON s.category_id = c.id
      WHERE c.id = ?
      GROUP BY c.id
    `,
    [id]
  );

  const category = rows[0];

  if (!category) {
    throw new HttpError(404, 'Category not found');
  }

  res.json({
    success: true,
    data: category
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const payload = buildCategoryPayload(req.body);

  if (!payload.name) {
    throw new HttpError(400, 'Category name is required');
  }

  const [result] = await db.query(
    `
      INSERT INTO categories (name, category_type, description)
      VALUES (?, ?, ?)
    `,
    [payload.name, payload.category_type, payload.description]
  );

  const [createdRows] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: createdRows[0]
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existingRows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
  const existing = existingRows[0];

  if (!existing) {
    throw new HttpError(404, 'Category not found');
  }

  const incoming = buildCategoryPayload(req.body);

  const payload = {
    name: incoming.name ?? existing.name,
    category_type: incoming.category_type ?? existing.category_type,
    description: incoming.description ?? existing.description
  };

  if (!payload.name) {
    throw new HttpError(400, 'Category name is required');
  }

  await db.query(
    `
      UPDATE categories
      SET name = ?, category_type = ?, description = ?
      WHERE id = ?
    `,
    [payload.name, payload.category_type, payload.description, id]
  );

  const [updatedRows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: updatedRows[0]
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existingRows] = await db.query('SELECT id FROM categories WHERE id = ?', [id]);
  if (!existingRows[0]) {
    throw new HttpError(404, 'Category not found');
  }

  try {
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new HttpError(409, 'Cannot delete category linked to hardware or software');
    }
    throw error;
  }

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});
