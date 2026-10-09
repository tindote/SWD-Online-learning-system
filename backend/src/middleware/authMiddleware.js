const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_online_learning_2026_fa';

// Authenticate JWT Token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Yêu cầu đăng nhập để truy cập tài nguyên này'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn'
      });
    }

    // Fetch user from database to ensure user still exists and role is fresh
    const [rows] = await db.query(
      'SELECT id, name, email, role, avatar, bio, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không còn tồn tại trên hệ thống'
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực người dùng'
    });
  }
};

// Optional Authentication (does not block if unauthenticated)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      req.user = null;
      return next();
    }

    const [rows] = await db.query(
      'SELECT id, name, email, role, avatar, bio, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    req.user = rows[0] || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Authorize roles (Role-Based Access Control)
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập'
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này (403 Forbidden)'
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize
};
