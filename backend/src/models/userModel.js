const db = require('../config/db');
const bcrypt = require('bcryptjs');

const UserModel = {
  // Get all users (Safe: never expose password)
  getAll: async (filter = {}) => {
    let query = 'SELECT id, name, email, role, avatar, bio, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (filter.role) {
      query += ' AND role = ?';
      params.push(filter.role);
    }

    if (filter.search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${filter.search}%`, `%${filter.search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query, params);
    return rows;
  },

  // Get user by ID (Safe: never expose password)
  getById: async (id) => {
    const [rows] = await db.query(
      'SELECT id, name, email, role, avatar, bio, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // Get user by email with password hash (strictly for authentication login verify)
  getByEmailWithPassword: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  // Get user by email (Safe)
  getByEmail: async (email) => {
    const [rows] = await db.query(
      'SELECT id, name, email, role, avatar, bio, created_at, updated_at FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  // Create new user (used in registration or admin create)
  create: async (userData) => {
    const { name, email, password, role, avatar, bio } = userData;
    const userRole = role || 'student';
    
    // Hash password with bcrypt
    const rawPassword = password || 'Password123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, userRole, avatar || null, bio || null]
    );

    return {
      id: result.insertId,
      name,
      email,
      role: userRole,
      avatar: avatar || null,
      bio: bio || null
    };
  },

  // Update user information (by admin or self)
  update: async (id, userData) => {
    const { name, email, role, avatar, bio } = userData;
    
    // Check if fields are provided
    const fields = [];
    const params = [];

    if (name !== undefined) {
      fields.push('name = ?');
      params.push(name);
    }
    if (email !== undefined) {
      fields.push('email = ?');
      params.push(email);
    }
    if (role !== undefined) {
      fields.push('role = ?');
      params.push(role);
    }
    if (avatar !== undefined) {
      fields.push('avatar = ?');
      params.push(avatar);
    }
    if (bio !== undefined) {
      fields.push('bio = ?');
      params.push(bio);
    }

    if (fields.length === 0) return UserModel.getById(id);

    params.push(id);
    const [result] = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) return null;
    return UserModel.getById(id);
  },

  // Update password safely
  updatePassword: async (id, newPassword) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const [result] = await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  },

  // Update self profile
  updateProfile: async (id, profileData) => {
    const { name, avatar, bio } = profileData;
    const [result] = await db.query(
      'UPDATE users SET name = COALESCE(?, name), avatar = COALESCE(?, avatar), bio = COALESCE(?, bio) WHERE id = ?',
      [name, avatar, bio, id]
    );
    if (result.affectedRows === 0) return null;
    return UserModel.getById(id);
  },

  // Count number of admins
  countAdmins: async () => {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
    return rows[0].count;
  },

  // Delete a user
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = UserModel;
