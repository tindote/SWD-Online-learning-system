const db = require('../config/db');

const CourseModel = {
  // Retrieve courses with filtering, search, sorting and metrics
  getAll: async (options = {}) => {
    const {
      search,
      category,
      isFree,
      status = 'published',
      allStatus = false,
      instructor_id,
      sortBy = 'newest'
    } = options;

    let query = `
      SELECT c.*,
             u.name AS instructor_name,
             u.avatar AS instructor_avatar,
             u.bio AS instructor_bio,
             COUNT(DISTINCT l.id) AS lessons_count,
             COUNT(DISTINCT e.id) AS enrollments_count,
             COALESCE(AVG(r.rating), 0) AS average_rating,
             COUNT(DISTINCT r.id) AS reviews_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN lessons l ON c.id = l.course_id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN reviews r ON c.id = r.course_id
      WHERE 1=1
    `;
    const params = [];

    // Filter by status (unless allStatus is requested by admin)
    if (!allStatus && status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (category && category !== 'All' && category !== 'Tất cả') {
      query += ' AND c.category = ?';
      params.push(category);
    }

    if (isFree === true || isFree === 'true') {
      query += ' AND c.price = 0';
    } else if (isFree === false || isFree === 'false') {
      query += ' AND c.price > 0';
    }

    if (instructor_id) {
      query += ' AND c.instructor_id = ?';
      params.push(instructor_id);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ' AND (c.title LIKE ? OR c.description LIKE ? OR c.instructor LIKE ? OR c.category LIKE ?)';
      params.push(term, term, term, term);
    }

    query += ' GROUP BY c.id';

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        query += ' ORDER BY c.price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY c.price DESC';
        break;
      case 'rating':
        query += ' ORDER BY average_rating DESC';
        break;
      case 'title':
        query += ' ORDER BY c.title ASC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY c.created_at DESC';
        break;
    }

    const [rows] = await db.query(query, params);
    return rows;
  },

  // Retrieve a single course with instructor details, lessons, and statistics
  getById: async (id) => {
    const [rows] = await db.query(`
      SELECT c.*,
             u.name AS instructor_name,
             u.avatar AS instructor_avatar,
             u.bio AS instructor_bio,
             COUNT(DISTINCT l.id) AS lessons_count,
             COUNT(DISTINCT e.id) AS enrollments_count,
             COALESCE(AVG(r.rating), 0) AS average_rating,
             COUNT(DISTINCT r.id) AS reviews_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN lessons l ON c.id = l.course_id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN reviews r ON c.id = r.course_id
      WHERE c.id = ?
      GROUP BY c.id
    `, [id]);

    return rows[0] || null;
  },

  // Create a new course
  create: async (courseData) => {
    const { title, description, instructor, instructor_id, price, category, thumbnail, status } = courseData;
    const [result] = await db.query(
      `INSERT INTO courses (title, description, instructor, instructor_id, price, category, thumbnail, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        instructor,
        instructor_id || null,
        parseFloat(price) || 0.00,
        category,
        thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
        status || 'published'
      ]
    );

    return CourseModel.getById(result.insertId);
  },

  // Update course
  update: async (id, courseData) => {
    const { title, description, instructor, instructor_id, price, category, thumbnail, status } = courseData;
    
    const fields = [];
    const params = [];

    if (title !== undefined) {
      fields.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      fields.push('description = ?');
      params.push(description);
    }
    if (instructor !== undefined) {
      fields.push('instructor = ?');
      params.push(instructor);
    }
    if (instructor_id !== undefined) {
      fields.push('instructor_id = ?');
      params.push(instructor_id);
    }
    if (price !== undefined) {
      fields.push('price = ?');
      params.push(parseFloat(price) || 0.00);
    }
    if (category !== undefined) {
      fields.push('category = ?');
      params.push(category);
    }
    if (thumbnail !== undefined) {
      fields.push('thumbnail = ?');
      params.push(thumbnail);
    }
    if (status !== undefined) {
      fields.push('status = ?');
      params.push(status);
    }

    if (fields.length === 0) return CourseModel.getById(id);

    params.push(id);
    const [result] = await db.query(
      `UPDATE courses SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) return null;
    return CourseModel.getById(id);
  },

  // Delete a course
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM courses WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = CourseModel;
