import db from '../config/db.js';

export const getCategories = (req, res, next) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(p.id) as live_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      GROUP BY c.id
      ORDER BY c.item_count DESC
    `).all();

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};
