import db from '../config/db.js';

export const getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { otherUserId = 2, productId = 1 } = req.query;

    const messages = await db.all(`
      SELECT 
        m.*,
        sender.name as sender_name,
        sender.avatar_url as sender_avatar
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) 
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [userId, otherUserId, otherUserId, userId]);

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { receiverId = 2, productId = 1, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
    }

    const insertSql = `
      INSERT INTO messages (sender_id, receiver_id, product_id, content)
      VALUES (?, ?, ?, ?)
      RETURNING id
    `;

    const result = await db.run(insertSql, [senderId, Number(receiverId), Number(productId), content.trim()]);
    const messageId = result.lastInsertRowid || result.rows?.[0]?.id;

    const message = await db.get(`
      SELECT 
        m.*,
        sender.name as sender_name,
        sender.avatar_url as sender_avatar
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      WHERE m.id = ?
    `, [messageId]);

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};
