import db from '../config/db.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await db.all(`
      SELECT c.id, c.name, c.icon, c.item_count, COUNT(p.id) as live_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      GROUP BY c.id, c.name, c.icon, c.item_count
      ORDER BY c.item_count DESC
    `);

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};
