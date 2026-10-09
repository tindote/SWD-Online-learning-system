const db = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const [[courses]] = await db.query('SELECT COUNT(*) as count FROM courses');
    const [[users]] = await db.query('SELECT COUNT(*) as count FROM users');
    const [[students]] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "student"');
    const [[instructors]] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "instructor"');
    const [[categories]] = await db.query('SELECT COUNT(*) as count FROM categories');
    const [[lessons]] = await db.query('SELECT COUNT(*) as count FROM lessons');
    const [[enrollments]] = await db.query('SELECT COUNT(*) as count FROM enrollments');
    const [[assignments]] = await db.query('SELECT COUNT(*) as count FROM assignments');
    const [[submissions]] = await db.query('SELECT COUNT(*) as count FROM submissions');
    const [[reviews]] = await db.query('SELECT COUNT(*) as count FROM reviews');

    // Recent enrollments
    const [recentEnrollments] = await db.query(`
      SELECT e.id, e.status, e.enrolled_at, u.name AS user_name, u.email AS user_email, c.title AS course_title
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN courses c ON e.course_id = c.id
      ORDER BY e.enrolled_at DESC
      LIMIT 5
    `);

    // Recent submissions
    const [recentSubmissions] = await db.query(`
      SELECT s.id, s.grade, s.submitted_at, u.name AS user_name, a.title AS assignment_title, c.title AS course_title
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      ORDER BY s.submitted_at DESC
      LIMIT 5
    `);

    return res.status(200).json({
      success: true,
      data: {
        totalCourses: courses.count,
        totalUsers: users.count,
        totalStudents: students.count,
        totalInstructors: instructors.count,
        totalCategories: categories.count,
        totalLessons: lessons.count,
        totalEnrollments: enrollments.count,
        totalAssignments: assignments.count,
        totalSubmissions: submissions.count,
        totalReviews: reviews.count,
        recentEnrollments,
        recentSubmissions
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy thống kê tổng quan',
      error: error.message
    });
  }
};

const getInstructorStats = async (req, res) => {
  try {
    const instructorId = req.user.id;

    // Courses by this instructor
    const [[courses]] = await db.query(
      'SELECT COUNT(*) as count FROM courses WHERE instructor_id = ?',
      [instructorId]
    );

    // Total distinct students enrolled in instructor's courses
    const [[students]] = await db.query(`
      SELECT COUNT(DISTINCT e.user_id) as count
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.instructor_id = ?
    `, [instructorId]);

    // Total assignments created by instructor
    const [[assignments]] = await db.query(`
      SELECT COUNT(DISTINCT a.id) as count
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE c.instructor_id = ?
    `, [instructorId]);

    // Submissions and pending grading count
    const [[submissions]] = await db.query(`
      SELECT COUNT(DISTINCT s.id) as total,
             COUNT(CASE WHEN s.grade IS NULL THEN 1 END) as pending
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE c.instructor_id = ?
    `, [instructorId]);

    // Average rating
    const [[rating]] = await db.query(`
      SELECT COALESCE(AVG(r.rating), 0) as avg_rating
      FROM reviews r
      JOIN courses c ON r.course_id = c.id
      WHERE c.instructor_id = ?
    `, [instructorId]);

    // Submissions pending grading
    const [pendingSubmissions] = await db.query(`
      SELECT s.id, s.submitted_at, s.content, u.name AS user_name, a.title AS assignment_title, c.title AS course_title
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE c.instructor_id = ? AND s.grade IS NULL
      ORDER BY s.submitted_at ASC
      LIMIT 10
    `, [instructorId]);

    return res.status(200).json({
      success: true,
      data: {
        totalCourses: courses.count,
        totalStudents: students.count,
        totalAssignments: assignments.count,
        totalSubmissions: submissions.total,
        pendingGradingCount: submissions.pending,
        averageRating: Number(Number(rating.avg_rating).toFixed(1)),
        pendingSubmissions
      }
    });
  } catch (error) {
    console.error('Error fetching instructor stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy thống kê giảng viên',
      error: error.message
    });
  }
};

const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Enrolled courses count & status
    const [[enrollments]] = await db.query(`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
             COUNT(CASE WHEN status = 'active' THEN 1 END) as active
      FROM enrollments
      WHERE user_id = ?
    `, [studentId]);

    // Average grade on completed submissions
    const [[grades]] = await db.query(`
      SELECT COALESCE(AVG(grade), 0) as avg_grade, COUNT(*) as total_submitted
      FROM submissions
      WHERE user_id = ? AND grade IS NOT NULL
    `, [studentId]);

    // Total lessons completed
    const [[lessonsCompleted]] = await db.query(
      'SELECT COUNT(*) as count FROM lesson_progress WHERE user_id = ? AND completed = 1',
      [studentId]
    );

    // Upcoming assignments for enrolled courses
    const [upcomingAssignments] = await db.query(`
      SELECT a.id, a.title, a.due_date, c.title AS course_title, s.grade, s.id AS submission_id
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id AND e.user_id = ? AND e.status = 'active'
      LEFT JOIN submissions s ON a.id = s.assignment_id AND s.user_id = ?
      WHERE a.due_date >= NOW() OR a.due_date IS NULL
      ORDER BY a.due_date ASC
      LIMIT 5
    `, [studentId, studentId]);

    return res.status(200).json({
      success: true,
      data: {
        enrolledCount: enrollments.total,
        completedCoursesCount: enrollments.completed,
        activeCoursesCount: enrollments.active,
        averageGrade: Number(Number(grades.avg_grade).toFixed(1)),
        totalSubmitted: grades.total_submitted,
        completedLessonsCount: lessonsCompleted.count,
        upcomingAssignments
      }
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy thống kê học viên',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getInstructorStats,
  getStudentStats
};
