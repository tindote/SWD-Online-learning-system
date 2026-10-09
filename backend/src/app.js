const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const learningRoutes = require('./routes/learningRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 5000;

// CORS configuration (hỗ trợ gọi API từ localhost và các thiết bị khác trong mạng LAN)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['*'];

const corsOptions = {
  origin: (origin, callback) => {
    // Cho phép các request không có header origin (ví dụ curl, Postman, mobile apps)
    if (!origin) return callback(null, true);

    // Cho phép tất cả origin nếu cấu hình '*'
    if (allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // Cho phép nếu origin nằm trong danh sách được cấu hình
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin '${origin}' not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check / Root route
app.get('/', (req, res) => {
  res.json({ message: 'Online Learning System API is running...' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/progress', learningRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Đã xảy ra lỗi máy chủ' : err.message
  });
});

// Start Server when run directly
if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT} (host: ${HOST})`);
    console.log(`- Local API:   http://localhost:${PORT}/api`);
    console.log(`- Network API: http://<LAN-IP>:${PORT}/api`);
  });
}

module.exports = app;
