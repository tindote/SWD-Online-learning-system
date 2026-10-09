const db = require('../config/db');

const NotificationController = {
  getNotifications: async (req, res) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
        [req.user.id]
      );

      const unreadCount = rows.filter(n => !n.is_read).length;

      return res.status(200).json({
        success: true,
        data: rows,
        unreadCount
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tải thông báo',
        error: error.message
      });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query(
        'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
        [id, req.user.id]
      );

      return res.status(200).json({
        success: true,
        message: 'Đã đánh dấu thông báo đã đọc'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật thông báo'
      });
    }
  },

  markAllAsRead: async (req, res) => {
    try {
      await db.query(
        'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
        [req.user.id]
      );

      return res.status(200).json({
        success: true,
        message: 'Đã đánh dấu tất cả thông báo đã đọc'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật tất cả thông báo'
      });
    }
  }
};

module.exports = NotificationController;
