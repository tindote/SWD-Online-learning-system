const NotificationModel = require('../models/notificationModel');

const NotificationController = {
  getNotifications: async (req, res) => {
    try {
      const rows = await NotificationModel.getByUserId(req.user.id, 30);
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
      await NotificationModel.markAsRead(id, req.user.id);

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
      await NotificationModel.markAllAsRead(req.user.id);

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
