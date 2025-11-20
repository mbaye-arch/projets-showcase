import db from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [supplierRows] = await db.query('SELECT COUNT(*) AS total_suppliers FROM suppliers');
  const [categoryRows] = await db.query('SELECT COUNT(*) AS total_categories FROM categories');
  const [hardwareRows] = await db.query('SELECT COUNT(*) AS total_hardware FROM hardware');
  const [softwareRows] = await db.query('SELECT COUNT(*) AS total_software FROM software');

  const [conditionRows] = await db.query(
    `
      SELECT
        SUM(CASE WHEN condition_state = 'neuf' THEN 1 ELSE 0 END) AS new_hardware,
        SUM(CASE WHEN condition_state = 'reconditionné' THEN 1 ELSE 0 END) AS refurbished_hardware,
        SUM(CASE WHEN condition_state = 'occasion' THEN 1 ELSE 0 END) AS used_hardware
      FROM hardware
    `
  );

  const [productsByType] = await db.query(
    `
      SELECT type, source, total FROM (
        SELECT hardware_type AS type, 'hardware' AS source, COUNT(*) AS total
        FROM hardware
        GROUP BY hardware_type

        UNION ALL

        SELECT software_type AS type, 'software' AS source, COUNT(*) AS total
        FROM software
        GROUP BY software_type
      ) grouped
      WHERE type IS NOT NULL
      ORDER BY source, total DESC
    `
  );

  res.json({
    success: true,
    data: {
      totals: {
        suppliers: supplierRows[0].total_suppliers,
        categories: categoryRows[0].total_categories,
        hardware: hardwareRows[0].total_hardware,
        software: softwareRows[0].total_software
      },
      hardwareByCondition: {
        new: Number(conditionRows[0].new_hardware || 0),
        refurbished: Number(conditionRows[0].refurbished_hardware || 0),
        used: Number(conditionRows[0].used_hardware || 0)
      },
      productsByType
    }
  });
});
