const db = require('../config/db');

const NotificationModel = {
  // Get notifications for a user (most recent 30)
  getByUserId: async (userId, limit = 30) => {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );
    return rows;
  },

  // Create a new notification
  create: async (data) => {
    const { user_id, title, message } = data;
    const [result] = await db.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [user_id, title, message]
    );
    return {
      id: result.insertId,
      user_id,
      title,
      message,
      is_read: 0
    };
  },

  // Mark a specific notification as read for a user
  markAsRead: async (id, userId) => {
    const [result] = await db.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },

  // Mark all notifications as read for a user
  markAllAsRead: async (userId) => {
    const [result] = await db.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }
};

module.exports = NotificationModel;
