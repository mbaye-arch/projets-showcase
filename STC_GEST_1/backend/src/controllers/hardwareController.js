import db from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { removeUploadedFile } from '../utils/fileUtils.js';

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

const toMediaPath = (file) => (file?.filename ? `uploads/${file.filename}` : null);

const fetchHardwareDetail = async (id) => {
  const [rows] = await db.query(
    `
      SELECT
        h.*,
        c.name AS category_name,
        c.category_type,
        s.name AS supplier_name,
        s.platform AS supplier_platform,
        s.country AS supplier_country
      FROM hardware h
      LEFT JOIN categories c ON c.id = h.category_id
      LEFT JOIN suppliers s ON s.id = h.supplier_id
      WHERE h.id = ?
    `,
    [id]
  );

  const hardware = rows[0];
  if (!hardware) return null;

  const [images] = await db.query(
    'SELECT id, hardware_id, image_path, created_at FROM hardware_images WHERE hardware_id = ? ORDER BY created_at DESC',
    [id]
  );

  return {
    ...hardware,
    gallery: images
  };
};

export const getHardwareList = asyncHandler(async (req, res) => {
  const { q, hardware_type, condition_state, category_id, supplier_id, min_price, max_price } = req.query;

  const whereClauses = [];
  const params = [];

  if (q) {
    whereClauses.push('(h.name LIKE ? OR h.reference LIKE ? OR h.brand LIKE ? OR h.model LIKE ? OR h.description LIKE ?)');
    const search = `%${q}%`;
    params.push(search, search, search, search, search);
  }

  if (hardware_type) {
    whereClauses.push('h.hardware_type = ?');
    params.push(hardware_type);
  }

  if (condition_state) {
    whereClauses.push('h.condition_state = ?');
    params.push(condition_state);
  }

  if (category_id) {
    whereClauses.push('h.category_id = ?');
    params.push(category_id);
  }

  if (supplier_id) {
    whereClauses.push('h.supplier_id = ?');
    params.push(supplier_id);
  }

  if (min_price) {
    whereClauses.push('h.sale_price >= ?');
    params.push(Number(min_price));
  }

  if (max_price) {
    whereClauses.push('h.sale_price <= ?');
    params.push(Number(max_price));
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const [rows] = await db.query(
    `
      SELECT
        h.*,
        c.name AS category_name,
        c.category_type,
        s.name AS supplier_name,
        s.platform AS supplier_platform,
        (
          SELECT COUNT(*)
          FROM hardware_images hi
          WHERE hi.hardware_id = h.id
        ) AS gallery_count
      FROM hardware h
      LEFT JOIN categories c ON c.id = h.category_id
      LEFT JOIN suppliers s ON s.id = h.supplier_id
      ${whereSql}
      ORDER BY h.created_at DESC
    `,
    params
  );

  res.json({
    success: true,
    data: rows
  });
});

export const getHardwareById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const hardware = await fetchHardwareDetail(id);

  if (!hardware) {
    throw new HttpError(404, 'Hardware not found');
  }

  res.json({
    success: true,
    data: hardware
  });
});

export const createHardware = asyncHandler(async (req, res) => {
  const files = req.files || {};

  const payload = {
    name: sanitize(req.body.name),
    reference: sanitize(req.body.reference) || null,
    brand: sanitize(req.body.brand) || null,
    model: sanitize(req.body.model) || null,
    description: sanitize(req.body.description) || null,
    hardware_type: sanitize(req.body.hardware_type) || null,
    category_id: parseNullableInt(req.body.category_id),
    supplier_id: parseNullableInt(req.body.supplier_id),
    purchase_price: parseNullableNumber(req.body.purchase_price),
    sale_price: parseNullableNumber(req.body.sale_price),
    quantity: parseNullableInt(req.body.quantity),
    condition_state: sanitize(req.body.condition_state) || null,
    source_country: sanitize(req.body.source_country) || null,
    estimated_delay: sanitize(req.body.estimated_delay) || null,
    notes: sanitize(req.body.notes) || null,
    main_image: toMediaPath(files.main_image?.[0]),
    video_path: toMediaPath(files.video?.[0])
  };

  if (!payload.name) {
    throw new HttpError(400, 'Hardware name is required');
  }

  const [result] = await db.query(
    `
      INSERT INTO hardware (
        name,
        reference,
        brand,
        model,
        description,
        hardware_type,
        category_id,
        supplier_id,
        purchase_price,
        sale_price,
        quantity,
        condition_state,
        source_country,
        estimated_delay,
        notes,
        main_image,
        video_path
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.name,
      payload.reference,
      payload.brand,
      payload.model,
      payload.description,
      payload.hardware_type,
      payload.category_id,
      payload.supplier_id,
      payload.purchase_price,
      payload.sale_price,
      payload.quantity,
      payload.condition_state,
      payload.source_country,
      payload.estimated_delay,
      payload.notes,
      payload.main_image,
      payload.video_path
    ]
  );

  const hardwareId = result.insertId;
  const galleryFiles = files.gallery || [];

  if (galleryFiles.length) {
    const values = galleryFiles.map((file) => [hardwareId, toMediaPath(file)]);
    await db.query('INSERT INTO hardware_images (hardware_id, image_path) VALUES ?', [values]);
  }

  const hardware = await fetchHardwareDetail(hardwareId);

  res.status(201).json({
    success: true,
    message: 'Hardware created successfully',
    data: hardware
  });
});

export const updateHardware = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const files = req.files || {};

  const [existingRows] = await db.query('SELECT * FROM hardware WHERE id = ?', [id]);
  const existing = existingRows[0];

  if (!existing) {
    throw new HttpError(404, 'Hardware not found');
  }

  let mainImagePath = existing.main_image;
  let videoPath = existing.video_path;

  if (files.main_image?.[0]) {
    mainImagePath = toMediaPath(files.main_image[0]);
    await removeUploadedFile(existing.main_image);
  }

  if (files.video?.[0]) {
    videoPath = toMediaPath(files.video[0]);
    await removeUploadedFile(existing.video_path);
  }

  const payload = {
    name: sanitize(req.body.name) ?? existing.name,
    reference: sanitize(req.body.reference) ?? existing.reference,
    brand: sanitize(req.body.brand) ?? existing.brand,
    model: sanitize(req.body.model) ?? existing.model,
    description: sanitize(req.body.description) ?? existing.description,
    hardware_type: sanitize(req.body.hardware_type) ?? existing.hardware_type,
    category_id:
      req.body.category_id === undefined ? existing.category_id : parseNullableInt(req.body.category_id),
    supplier_id:
      req.body.supplier_id === undefined ? existing.supplier_id : parseNullableInt(req.body.supplier_id),
    purchase_price:
      req.body.purchase_price === undefined
        ? existing.purchase_price
        : parseNullableNumber(req.body.purchase_price),
    sale_price:
      req.body.sale_price === undefined ? existing.sale_price : parseNullableNumber(req.body.sale_price),
    quantity: req.body.quantity === undefined ? existing.quantity : parseNullableInt(req.body.quantity),
    condition_state: sanitize(req.body.condition_state) ?? existing.condition_state,
    source_country: sanitize(req.body.source_country) ?? existing.source_country,
    estimated_delay: sanitize(req.body.estimated_delay) ?? existing.estimated_delay,
    notes: sanitize(req.body.notes) ?? existing.notes,
    main_image: mainImagePath,
    video_path: videoPath
  };

  if (!payload.name) {
    throw new HttpError(400, 'Hardware name is required');
  }

  if (String(req.body.clear_gallery).toLowerCase() === 'true') {
    const [oldImages] = await db.query('SELECT image_path FROM hardware_images WHERE hardware_id = ?', [id]);
    await db.query('DELETE FROM hardware_images WHERE hardware_id = ?', [id]);

    await Promise.all(oldImages.map((image) => removeUploadedFile(image.image_path)));
  }

  const galleryFiles = files.gallery || [];
  if (galleryFiles.length) {
    const values = galleryFiles.map((file) => [Number(id), toMediaPath(file)]);
    await db.query('INSERT INTO hardware_images (hardware_id, image_path) VALUES ?', [values]);
  }

  await db.query(
    `
      UPDATE hardware
      SET
        name = ?,
        reference = ?,
        brand = ?,
        model = ?,
        description = ?,
        hardware_type = ?,
        category_id = ?,
        supplier_id = ?,
        purchase_price = ?,
        sale_price = ?,
        quantity = ?,
        condition_state = ?,
        source_country = ?,
        estimated_delay = ?,
        notes = ?,
        main_image = ?,
        video_path = ?
      WHERE id = ?
    `,
    [
      payload.name,
      payload.reference,
      payload.brand,
      payload.model,
      payload.description,
      payload.hardware_type,
      payload.category_id,
      payload.supplier_id,
      payload.purchase_price,
      payload.sale_price,
      payload.quantity,
      payload.condition_state,
      payload.source_country,
      payload.estimated_delay,
      payload.notes,
      payload.main_image,
      payload.video_path,
      id
    ]
  );

  const hardware = await fetchHardwareDetail(id);

  res.json({
    success: true,
    message: 'Hardware updated successfully',
    data: hardware
  });
});

export const deleteHardware = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existingRows] = await db.query('SELECT id, main_image, video_path FROM hardware WHERE id = ?', [id]);
  const existing = existingRows[0];

  if (!existing) {
    throw new HttpError(404, 'Hardware not found');
  }

  const [images] = await db.query('SELECT image_path FROM hardware_images WHERE hardware_id = ?', [id]);

  await db.query('DELETE FROM hardware WHERE id = ?', [id]);

  await removeUploadedFile(existing.main_image);
  await removeUploadedFile(existing.video_path);
  await Promise.all(images.map((image) => removeUploadedFile(image.image_path)));

  res.json({
    success: true,
    message: 'Hardware deleted successfully'
  });
});

export const deleteHardwareImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;

  const [rows] = await db.query('SELECT * FROM hardware_images WHERE id = ? AND hardware_id = ?', [imageId, id]);
  const image = rows[0];

  if (!image) {
    throw new HttpError(404, 'Hardware image not found');
  }

  await db.query('DELETE FROM hardware_images WHERE id = ?', [imageId]);
  await removeUploadedFile(image.image_path);

  res.json({
    success: true,
    message: 'Hardware image deleted successfully'
  });
});
