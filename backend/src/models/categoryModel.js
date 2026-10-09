const db = require('../config/db');

const CategoryModel = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  },

  create: async (data) => {
    const { name, description } = data;
    const [result] = await db.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    return {
      id: result.insertId,
      name,
      description
    };
  },

  update: async (id, data) => {
    const { name, description } = data;
    const [result] = await db.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    if (result.affectedRows === 0) return null;
    return CategoryModel.getById(id);
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = CategoryModel;
