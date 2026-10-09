# Online Learning Platform (Hệ Thống Học Trực Tuyến E-Learning)

Một nền tảng học trực tuyến toàn diện, an toàn và sẵn sàng cho môi trường thực tế (production-style E-Learning web application) được xây dựng theo kiến trúc full-stack **React + TypeScript + Node.js + Express.js + MySQL**.

Hệ thống kết hợp hài hòa giữa cổng thông tin công khai (Public Portal), hệ thống xác thực bảo mật chuẩn JWT + bcrypt, phân quyền vai trò (Role-Based Access Control - RBAC: Admin, Instructor, Student), phòng học tương tác (Interactive Classroom) theo dõi tiến độ học tập (Progress Tracking), cùng luồng nộp bài và chấm điểm bài tập (Assignment Submissions & Grading).

---

## 1. Mục lục (Table of Contents)

1. [Kiến trúc & Công nghệ (Tech Stack & Architecture)](#2-kiến-trúc--công-nghệ)
2. [Cấu trúc Thư mục (Directory Structure)](#3-cấu-trúc-thư-mục)
3. [Mô hình Cơ sở Dữ liệu (Database Schema & ERD)](#4-mô-hình-cơ-sở-dữ-liệu)
4. [Tài khoản Thử nghiệm (Test Accounts & Seed Data)](#5-tài-khoản-thử-nghiệm)
5. [Cài đặt & Khởi chạy (Installation & Getting Started)](#6-cài-đặt--khởi-chạy)
6. [Biến Môi trường (Environment Variables)](#7-biến-môi-trường)
7. [Bảo mật & Phân quyền (Security & RBAC)](#8-bảo-mật--phân-quyền)
8. [Tài liệu API (REST API Documentation)](#9-tài-liệu-api)
9. [Các phân hệ chức năng (Key Features)](#10-các-phân-hệ-chức-năng)
10. [Kiểm thử & Khắc phục sự cố (Testing & Troubleshooting)](#11-kiểm-thử--khắc-phục-sự-cố)

---

## 2. Kiến trúc & Công nghệ

### 2.1 Kiến trúc tổng thể

```text
                  +----------------------------------------------+
                  |           Browser / Client (Vite SPA)        |
                  |  - Public Catalog, Hero, Course Details      |
                  |  - Student Dashboard & Learning Classroom    |
                  |  - Instructor Studio & Grading Workflow      |
                  |  - Admin Management Dashboard                |
                  +----------------------+-----------------------+
                                         |
                            HTTPS / REST JSON APIs
                            (JWT Bearer Authorization)
                                         |
                                         v
                  +----------------------------------------------+
                  |         Node.js + Express REST API           |
                  |  - Auth Middleware (JWT Verify & RBAC)       |
                  |  - Ownership Check & IDOR Protection         |
                  |  - Controllers & Input Validation            |
                  |  - Models with Parameterized Queries         |
                  +----------------------+-----------------------+
                                         |
                               Connection Pool
                                (mysql2/promise)
                                         |
                                         v
                  +----------------------------------------------+
                  |                MySQL Database                |
                  |  - 10 Tables, Foreign Keys, CASCADE ON DELETE|
                  |  - Bcrypt Hashed Passwords, UTF8MB4          |
                  +----------------------------------------------+
```

### 2.2 Công nghệ sử dụng

#### Frontend
- **Framework**: React 18 + TypeScript
- **Bundler**: Vite
- **Routing**: React Router DOM (`v6`) với cơ chế Protected Routes theo role
- **HTTP Client**: Axios với interceptor tự động đính kèm `Bearer Token` và xử lý mã lỗi `401 Unauthorized`
- **Iconography**: Lucide React
- **Styling**: Vanilla CSS Module-like Design System hiện đại (Modern Indigo/Purple palette, Glassmorphism, Responsive Mobile/Tablet/Desktop, CSS variables)

#### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database Driver**: `mysql2/promise` (100% Parameterized queries, chống SQL Injection)
- **Authentication**: `jsonwebtoken` (JWT Bearer Token), `bcryptjs` (salt rounds 10)
- **Middleware**: `cors`, `dotenv`, custom `authMiddleware`

#### Database
- **DBMS**: MySQL 8.0+ / MariaDB 10.4+
- **Collation**: `utf8mb4_unicode_ci`

---

## 3. Cấu trúc Thư mục

```text
online-learning-crud/
├── schema.sql                     # Toàn bộ schema DDL & Realistic Seed Data
├── README.md                      # Tài liệu dự án hoàn chỉnh
├── PROJECT_OVERVIEW.md            # Tài liệu tổng quan kiến trúc
│
├── backend/
│   ├── .env                       # File cấu hình môi trường backend (được tạo từ .env.example)
│   ├── .env.example               # Mẫu cấu hình môi trường
│   ├── package.json
│   ├── schema.sql
│   └── src/
│       ├── config/
│       │   ├── db.js              # MySQL connection pool
│       │   └── migrate.js         # Script tự động migrate & seed dữ liệu
│       ├── middleware/
│       │   └── authMiddleware.js  # JWT verification, optionalAuth, authorize(roles)
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── courseController.js
│       │   ├── categoryController.js
│       │   ├── lessonController.js
│       │   ├── enrollmentController.js
│       │   ├── assignmentController.js
│       │   ├── submissionController.js
│       │   ├── learningController.js
│       │   ├── reviewController.js
│       │   ├── notificationController.js
│       │   └── dashboardController.js
│       ├── models/
│       │   ├── userModel.js
│       │   ├── courseModel.js
│       │   ├── categoryModel.js
│       │   ├── lessonModel.js
│       │   ├── enrollmentModel.js
│       │   ├── assignmentModel.js
│       │   └── submissionModel.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── courseRoutes.js
│       │   ├── categoryRoutes.js
│       │   ├── lessonRoutes.js
│       │   ├── enrollmentRoutes.js
│       │   ├── assignmentRoutes.js
│       │   ├── submissionRoutes.js
│       │   ├── learningRoutes.js
│       │   ├── reviewRoutes.js
│       │   ├── notificationRoutes.js
│       │   └── dashboardRoutes.js
│       └── app.js                 # Express server bootstrap & router mounting
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── src/
        ├── index.css              # Custom Vanilla CSS Design System & Theme Tokens
        ├── main.tsx
        ├── App.tsx                # App routing với Public, Student, Instructor, Admin routes
        ├── context/
        │   └── AuthContext.tsx    # Global Authentication context (token, user, login, logout)
        ├── components/
        │   ├── Header.tsx         # Navbar với notifications dropdown & user menu
        │   ├── Sidebar.tsx        # Dynamic navigation theo vai trò (Admin / Instructor / Student)
        │   ├── Layout.tsx         # Dashboard layout bọc Sidebar + Header
        │   ├── PublicLayout.tsx   # Public layout (Header + Footer) cho trang công khai
        │   ├── ProtectedRoute.tsx # Route guard kiểm tra đăng nhập & quyền vai trò
        │   ├── CourseForm.tsx
        │   ├── CourseList.tsx
        │   ├── UserForm.tsx
        │   ├── UserList.tsx
        │   ├── CategoryForm.tsx
        │   ├── CategoryList.tsx
        │   ├── LessonForm.tsx
        │   ├── LessonList.tsx
        │   ├── EnrollmentForm.tsx
        │   ├── EnrollmentList.tsx
        │   ├── AssignmentForm.tsx
        │   ├── AssignmentList.tsx
        │   ├── SubmissionForm.tsx
        │   └── SubmissionList.tsx
        ├── pages/
        │   ├── HomePage.tsx               # Trang chủ công khai (Hero, Categories, Featured Courses)
        │   ├── CourseCatalogPage.tsx      # Danh mục khóa học (Tìm kiếm, lọc danh mục, giá, sắp xếp)
        │   ├── CourseDetailPage.tsx       # Chi tiết khóa học (Giảng viên, giáo trình, đánh giá, đăng ký)
        │   ├── LoginPage.tsx              # Đăng nhập (với các nút Quick Login cho Demo)
        │   ├── RegisterPage.tsx           # Đăng ký tài khoản học viên mới
        │   ├── StudentDashboardPage.tsx   # Dashboard học viên (Khóa học đang học, tiến độ %, bài tập)
        │   ├── StudentCoursesPage.tsx     # Danh sách khóa học đã đăng ký của học viên
        │   ├── StudentAssignmentsPage.tsx # Danh sách bài tập & modal nộp bài
        │   ├── LearningPage.tsx           # Phòng học tương tác (Video player, đánh dấu hoàn thành)
        │   ├── InstructorDashboardPage.tsx# Dashboard giảng viên (Thống kê, hàng đợi chấm bài)
        │   ├── InstructorSubmissionsPage.tsx # Danh sách bài nộp & modal chấm điểm/phản hồi
        │   ├── DashboardPage.tsx          # Dashboard quản trị viên (Admin Analytics)
        │   ├── ProfilePage.tsx            # Xem & cập nhật thông tin cá nhân
        │   └── ChangePasswordPage.tsx     # Đổi mật khẩu an toàn với xác thực mật khẩu cũ
        ├── services/
        │   ├── apiClient.ts               # Axios instance tập trung
        │   ├── authApi.ts
        │   ├── courseApi.ts
        │   ├── categoryApi.ts
        │   ├── lessonApi.ts
        │   ├── enrollmentApi.ts
        │   ├── assignmentApi.ts
        │   ├── submissionApi.ts
        │   ├── learningApi.ts
        │   ├── reviewApi.ts
        │   ├── notificationApi.ts
        │   ├── dashboardApi.ts
        │   └── userApi.ts
        └── types/                         # TypeScript interfaces (100% typed, no loose any)
            ├── auth.ts
            ├── course.ts
            ├── user.ts
            ├── category.ts
            ├── lesson.ts
            ├── enrollment.ts
            ├── assignment.ts
            ├── submission.ts
            ├── review.ts
            ├── notification.ts
            ├── progress.ts
            └── dashboard.ts
```

---

## 4. Mô hình Cơ sở Dữ liệu

Cơ sở dữ liệu gồm 10 bảng liên kết chặt chẽ bằng Khóa ngoại (Foreign Keys) với cơ chế `ON DELETE CASCADE` đảm bảo toàn vẹn dữ liệu:

1. **`users`**: Quản lý tài khoản người dùng (`id`, `name`, `email` [UNIQUE], `password` [bcrypt hash], `role` ['admin', 'instructor', 'student'], `avatar`, `bio`, `created_at`, `updated_at`).
2. **`categories`**: Danh mục ngành học (`id`, `name` [UNIQUE], `description`, `created_at`, `updated_at`).
3. **`courses`**: Khóa học (`id`, `title`, `description`, `price`, `instructor_id` [FK users], `category_id` [FK categories], `thumbnail`, `status` ['draft', 'published', 'archived'], `created_at`, `updated_at`).
4. **`lessons`**: Bài giảng trong khóa học (`id`, `course_id` [FK courses], `title`, `content`, `lesson_order`, `video_url`, `resource_url`, `created_at`, `updated_at`).
5. **`enrollments`**: Đăng ký học (`id`, `user_id` [FK users], `course_id` [FK courses], `progress`, `status` ['active', 'completed', 'cancelled'], `enrolled_at`, `completed_at`, `UNIQUE(user_id, course_id)`).
6. **`assignments`**: Bài tập khóa học (`id`, `course_id` [FK courses], `title`, `description`, `due_date`, `created_at`, `updated_at`).
7. **`submissions`**: Bài nộp của học viên (`id`, `assignment_id` [FK assignments], `user_id` [FK users], `content`, `grade`, `feedback`, `submitted_at`, `graded_at`).
8. **`lesson_progress`**: Tiến độ chi tiết từng bài học (`id`, `user_id` [FK users], `lesson_id` [FK lessons], `completed`, `completed_at`, `UNIQUE(user_id, lesson_id)`).
9. **`reviews`**: Đánh giá & nhận xét khóa học (`id`, `user_id` [FK users], `course_id` [FK courses], `rating` [1-5], `comment`, `created_at`, `UNIQUE(user_id, course_id)`).
10. **`notifications`**: Thông báo hệ thống gửi đến người dùng (`id`, `user_id` [FK users], `title`, `message`, `is_read`, `created_at`).

---

## 5. Tài khoản Thử nghiệm

Tất cả các tài khoản thử nghiệm đã được khởi tạo trong seed data với mật khẩu chung được mã hóa chuẩn **bcrypt**:

> **Mật khẩu dùng chung cho tất cả tài khoản:** `Password123!`

*(Tại giao diện Đăng nhập `/login`, người dùng có thể nhấp vào các nút **Quick Demo Login** để tự động điền tài khoản nhanh).*

| Vai trò (Role) | Họ và Tên | Email | Quyền hạn chính |
| :--- | :--- | :--- | :--- |
| **Admin** | Lê Hoàng Cường | `cuong.le@example.com` | Toàn quyền quản trị hệ thống, quản lý Users, Courses, Categories, Enrollments, Assignments, Submissions |
| **Instructor** | Alex Morgan | `alex.morgan@example.com` | Quản lý khóa học của mình, tạo bài giảng, tạo bài tập, chấm điểm học viên & gửi phản hồi |
| **Instructor** | Sarah Jenkins | `sarah.jenkins@example.com` | Giảng viên Python & Data Science |
| **Instructor** | Minh Nhật | `minh.nhat@example.com` | Giảng viên Thiết kế UI/UX & Figma |
| **Student** | Nguyễn Văn An | `an.nguyen@example.com` | Khám phá khóa học, đăng ký học, xem bài giảng, nộp bài tập, đánh giá khóa học |
| **Student** | Trần Thị Bình | `binh.tran@example.com` | Học viên đã đăng ký khóa học Frontend & Python |
| **Student** | Lê Văn Chi | `chi.le@example.com` | Học viên đã hoàn thành khóa học UI/UX |

---

## 6. Cài đặt & Khởi chạy

### 6.1 Yêu cầu môi trường
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **MySQL**: 8.0+ đang chạy trên cổng 3306

### 6.2 Bước 1: Khởi tạo Cơ sở Dữ liệu

Mở terminal hoặc MySQL Workbench, chạy câu lệnh sau để tạo database và toàn bộ bảng cùng dữ liệu mẫu:

```bash
# Đăng nhập vào MySQL và thực thi schema.sql
mysql -u root -p < schema.sql
```

*(Hoặc mở file `schema.sql` trong MySQL Workbench / phpMyAdmin và nhấn Execute).*

Ngoài ra, backend được tích hợp sẵn script migration tự động:
```bash
cd backend
node src/config/migrate.js
```

### 6.3 Bước 2: Cài đặt và Chạy Backend

1. Di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   npm install
   ```
2. Cấu hình biến môi trường:
   Đảm bảo file `.env` tồn tại (hoặc sao chép từ `.env.example`):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=online_learning_db
   JWT_SECRET=super_secret_jwt_key_learning_platform_2026_!@#
   JWT_EXPIRES_IN=7d
   ```
3. Chạy server backend:
   ```bash
   # Chế độ phát triển (auto-reload với nodemon)
   npm run dev

   # Hoặc chế độ production
   npm start
   ```
   Server backend sẽ chạy tại: `http://localhost:5000`

### 6.4 Bước 3: Cài đặt và Chạy Frontend

1. Mở một terminal mới và di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   npm install
   ```
2. Kiểm tra type check và build kiểm thử:
   ```bash
   npm run lint
   npm run build
   ```
3. Khởi chạy máy chủ phát triển Vite:
   ```bash
   npm run dev
   ```
   Ứng dụng frontend sẽ chạy tại: `http://localhost:5173`

---

## 7. Biến Môi trường

### Backend (`backend/.env`)

| Biến | Ý nghĩa | Giá trị mẫu |
| :--- | :--- | :--- |
| `PORT` | Cổng lắng nghe của API Express | `5000` |
| `DB_HOST` | Địa chỉ máy chủ MySQL | `localhost` |
| `DB_PORT` | Cổng dịch vụ MySQL | `3306` |
| `DB_USER` | Tên người dùng MySQL | `root` |
| `DB_PASSWORD` | Mật khẩu tài khoản MySQL | `(trống hoặc mật khẩu của bạn)` |
| `DB_NAME` | Tên cơ sở dữ liệu | `online_learning_db` |
| `JWT_SECRET` | Khóa bí mật ký phát JWT Bearer Token | `super_secret_jwt_key_...` |
| `JWT_EXPIRES_IN` | Thời gian sống của JWT Token | `7d` |

### Frontend (`frontend/.env`)
| Biến | Ý nghĩa | Mặc định |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL của Backend REST API | `http://localhost:5000/api` |

---

## 8. Bảo mật & Phân quyền (Security & RBAC)

Hệ thống được thiết kế theo các tiêu chuẩn bảo mật khắt khe:

1. **Không lưu trữ mật khẩu dạng Plaintext**:
   - Sử dụng `bcryptjs` với salt round = 10 để băm (hash) mật khẩu trước khi ghi vào MySQL.
   - Không bao giờ trả trường `password` trong bất kỳ response nào từ API.
   - Câu lệnh truy vấn SQL đều loại trừ `password` (`SELECT id, name, email, role, avatar, bio...`).
2. **Xác thực JWT Token an toàn**:
   - Token chứa `id`, `email`, `role`.
   - Token hết hạn sau 7 ngày (`JWT_EXPIRES_IN=7d`).
   - Middleware `authMiddleware.js` giải mã và xác thực token trên mỗi request cần bảo vệ.
3. **Phòng chống tấn công IDOR & Đảm bảo Quyền sở hữu (Ownership Enforcement)**:
   - Giảng viên chỉ được sửa, xóa khóa học, bài giảng và bài tập do chính mình tạo ra (`course.instructor_id === req.user.id`).
   - Học viên chỉ được xem và nộp bài tập của chính mình; không thể truy cập bài nộp của học viên khác.
   - Giảng viên chỉ được chấm điểm các bài nộp thuộc khóa học do mình phụ trách.
   - Admin có quyền tối cao quản lý toàn hệ thống nhưng được bảo vệ không thể xóa chính mình hoặc xóa quản trị viên duy nhất còn lại.
4. **Phòng chống SQL Injection**:
   - 100% câu truy vấn vào MySQL sử dụng Parameterized Queries (`?` placeholders) qua `mysql2/promise`. Tuyệt đối không cộng chuỗi SQL thô.
5. **Đăng ký an toàn**:
   - Người dùng đăng ký qua `/api/auth/register` mặc định nhận vai trò `student`. Không có khả năng tự gán quyền `admin` hoặc `instructor`.
6. **Bảo vệ Route ở cả 2 đầu**:
   - **Frontend**: Component `<ProtectedRoute allowedRoles={[...]} />` chặn người dùng trái phép chuyển hướng về `/login` hoặc trang phù hợp.
   - **Backend**: Middleware `authorize('admin', 'instructor')` độc lập trả về `403 Forbidden` đối với bất kỳ request API nào vi phạm quyền hạn.

---

## 9. Tài liệu API (REST API Documentation)

Tất cả các endpoint đều có tiền tố `/api`. Các endpoint có ký hiệu 🔒 yêu cầu Header: `Authorization: Bearer <token>`.

### 9.1 Xác thực & Tài khoản (`/api/auth`)
| Phương thức | Đường dẫn | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Đăng ký tài khoản học viên mới (name, email, password, confirmPassword) |
| `POST` | `/api/auth/login` | Public | Đăng nhập hệ thống, trả về JWT Token và thông tin user |
| `GET` | `/api/auth/me` | 🔒 Any | Lấy thông tin tài khoản hiện tại từ Token |
| `PUT` | `/api/auth/profile` | 🔒 Any | Cập nhật thông tin cá nhân (name, avatar, bio) |
| `POST` | `/api/auth/change-password` | 🔒 Any | Đổi mật khẩu (yêu cầu mật khẩu hiện tại và mật khẩu mới >= 8 ký tự) |

### 9.2 Khóa học (`/api/courses`)
| Phương thức | Đường dẫn | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | Public | Danh sách khóa học (Hỗ trợ query: `search`, `category_id`, `price_type`, `sort`, `status`) |
| `GET` | `/api/courses/:id` | Public | Xem thông tin chi tiết khóa học, giảng viên, thống kê |
| `POST` | `/api/courses` | 🔒 Admin/Instructor | Tạo khóa học mới |
| `PUT` | `/api/courses/:id` | 🔒 Admin/Instructor | Cập nhật khóa học (Kiểm tra quyền sở hữu đối với Instructor) |
| `DELETE`| `/api/courses/:id` | 🔒 Admin/Instructor | Xóa khóa học (Kiểm tra quyền sở hữu) |

### 9.3 Bài giảng (`/api/lessons`)
| Phương thức | Đường dẫn | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/lessons` | Public | Danh sách bài giảng theo khóa học (`?course_id=...`) |
| `GET` | `/api/lessons/:id` | Public | Chi tiết nội dung bài học, video URL, tài liệu |
| `POST` | `/api/lessons` | 🔒 Admin/Instructor | Tạo bài giảng mới |
| `PUT` | `/api/lessons/:id` | 🔒 Admin/Instructor | Cập nhật bài giảng |
| `DELETE`| `/api/lessons/:id` | 🔒 Admin/Instructor | Xóa bài giảng |

### 9.4 Đăng ký học & Tiến độ (`/api/enrollments`, `/api/progress`)
| Phương thức | Đường dẫn | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/enrollments/enroll` | 🔒 Student | Học viên tự đăng ký vào khóa học |
| `GET` | `/api/enrollments/my-enrollments`| 🔒 Student | Xem danh sách các khóa học bản thân đã đăng ký kèm tiến độ % |
| `GET` | `/api/enrollments` | 🔒 Admin/Instructor | Xem danh sách đăng ký toàn hệ thống |
| `GET` | `/api/progress/:courseId` | 🔒 Student | Lấy tiến độ chi tiết từng bài học của khóa học |
| `POST` | `/api/progress/toggle` | 🔒 Student | Đánh dấu hoàn thành / chưa hoàn thành bài học |

### 9.5 Bài tập & Chấm điểm (`/api/assignments`, `/api/submissions`)
| Phương thức | Đường dẫn | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assignments` | 🔒 Any | Lấy danh sách bài tập (có thể lọc theo `?course_id=...`) |
| `POST` | `/api/assignments` | 🔒 Admin/Instructor | Tạo bài tập cho khóa học |
| `GET` | `/api/submissions/my` | 🔒 Student | Xem các bài nộp của bản thân kèm điểm và nhận xét |
| `POST` | `/api/submissions` | 🔒 Student | Nộp bài tập (văn bản, URL, link GitHub) |
| `GET` | `/api/submissions` | 🔒 Admin/Instructor | Xem danh sách bài nộp của học viên trong các khóa học |
| `PUT` | `/api/submissions/:id/grade`| 🔒 Admin/Instructor | Chấm điểm (0-100) và gửi phản hồi nhận xét cho học viên |

### 9.6 Đánh giá & Nhận xét (`/api/reviews`)
| Phương thức | Đường dẫn | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reviews/course/:courseId` | Public | Lấy danh sách đánh giá và điểm trung bình sao của khóa học |
| `POST` | `/api/reviews` | 🔒 Student | Gửi đánh giá (1-5 sao kèm bình luận) cho khóa học đã tham gia |

### 9.7 Thông báo (`/api/notifications`)
| Phương thức | Đường dẫn | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | 🔒 Any | Lấy danh sách thông báo của tài khoản hiện tại |
| `PUT` | `/api/notifications/:id/read` | 🔒 Any | Đánh dấu một thông báo đã đọc |
| `PUT` | `/api/notifications/read-all` | 🔒 Any | Đánh dấu tất cả thông báo là đã đọc |

### 9.8 Bảng điều khiển thống kê (`/api/dashboard`)
| Phương thức | Đường dẫn | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard` | 🔒 Admin | Thống kê toàn hệ thống: Tổng users, courses, enrollments, submissions... |
| `GET` | `/api/dashboard/instructor` | 🔒 Instructor | Thống kê cá nhân: Số khóa học phụ trách, số học viên, bài chờ chấm |
| `GET` | `/api/dashboard/student` | 🔒 Student | Thống kê học viên: Khóa học đang học, khóa hoàn thành, bài nộp, điểm TB |

---

## 10. Các phân hệ chức năng

### 10.1 Cổng thông tin công khai (Public Portal)
- **Trang chủ (`/`)**: Hero banner giới thiệu, thống kê nổi bật, danh mục khóa học, các khóa học thịnh hành, ưu điểm của nền tảng, kêu gọi hành động (CTA).
- **Danh mục khóa học (`/courses`)**: Tìm kiếm theo thời gian thực (Live Search), lọc nhanh theo danh mục, lọc khóa học Miễn phí/Có phí, sắp xếp theo giá và ngày tạo.
- **Chi tiết khóa học (`/courses/:id`)**: Thông tin giảng viên, mục tiêu bài học, danh sách giáo trình các chương bài học, đánh giá sao của học viên, nút "Đăng ký học ngay" (hoặc "Vào học tiếp" nếu đã tham gia).

### 10.2 Không gian học tập (Interactive Learning Classroom - `/learn/:courseId`)
- Giao diện phòng học tập trung, sidebar hiển thị danh sách bài giảng với icon tích xanh khi hoàn thành.
- Video Player hiển thị video bài học, phần nội dung văn bản chi tiết, nút tải tài liệu đính kèm.
- Nút chuyển bài "Bài trước" / "Bài tiếp theo" cùng nút "Đánh dấu đã hoàn thành" tương tác trực tiếp với API backend. Tự động tính toán tiến độ % khóa học và chuyển trạng thái `completed` khi đạt 100%.

### 10.3 Không gian Học viên (Student Studio)
- **Bảng điều khiển (`/student/dashboard`)**: Lời chào cá nhân, thanh tiến độ tổng thể, danh sách khóa học đang theo học, các bài tập sắp tới hạn.
- **Quản lý bài tập (`/student/assignments`)**: Tra cứu bài tập, mở modal nộp bài với định dạng nội dung hoặc liên kết GitHub/Google Docs, xem điểm số và nhận xét chi tiết của giảng viên.

### 10.4 Không gian Giảng viên (Instructor Studio)
- **Bảng điều khiển (`/instructor/dashboard`)**: Tổng số khóa học đang dạy, tổng học viên đăng ký, danh sách các bài tập còn chờ chấm điểm.
- **Quản lý khóa học & bài giảng**: Tạo, chỉnh sửa, thay đổi trạng thái (Bản nháp / Xuất bản).
- **Chấm bài & Phản hồi (`/instructor/submissions`)**: Danh sách bài làm của học viên, mở modal chấm điểm từ 0 đến 100 và ghi nhận xét, tự động gửi thông báo đến học viên.

### 10.5 Không gian Quản trị viên (Admin Management)
- Quản trị toàn diện: Người dùng (Thêm, sửa, đổi vai trò, xóa với kiểm tra an toàn không xóa admin cuối cùng), Danh mục khóa học, Khóa học, Bài giảng, Đăng ký học, Bài tập và Bài nộp.
- Biểu đồ và thẻ phân tích số liệu hệ thống.

---

## 11. Kiểm thử & Khắc phục sự cố

### 11.1 Các kịch bản kiểm thử đã xác minh (Test Matrix)

1. **Authentication Flow**:
   - [x] Đăng ký tài khoản mới: Tự động gán quyền `student`, kiểm tra trùng lặp email.
   - [x] Đăng nhập đúng mật khẩu: Nhận JWT Token, lưu `localStorage`, chuyển hướng đúng Dashboard tương ứng.
   - [x] Đăng nhập sai mật khẩu: Báo lỗi an toàn, không rò rỉ cấu trúc hệ thống.
   - [x] Đổi mật khẩu: Yêu cầu mật khẩu hiện tại, kiểm tra độ dài >= 8 ký tự, băm bcrypt trước khi cập nhật.
2. **Authorization & RBAC**:
   - [x] Học viên truy cập `/admin` hoặc `/instructor`: Bị chặn bởi ProtectedRoute và chuyển hướng về `/student/dashboard`.
   - [x] Gọi API `/api/users` bằng tài khoản Student/Instructor: Nhận mã phản hồi `403 Forbidden`.
   - [x] Giảng viên cố gắng sửa khóa học của giảng viên khác: Nhận mã phản hồi `403 Forbidden`.
3. **Learning & Progress Tracking**:
   - [x] Học viên nhấn "Đăng ký học": Tạo bản ghi `enrollments`, ngăn chặn đăng ký trùng lặp.
   - [x] Tích chọn hoàn thành bài học: Cập nhật `lesson_progress`, tính lại phần trăm % tiến độ của khóa học.
4. **Assignments & Grading**:
   - [x] Học viên nộp bài: Lưu nội dung và liên kết nộp bài.
   - [x] Giảng viên chấm điểm 85/100 kèm nhận xét: Cập nhật điểm, tự động tạo bản ghi trong bảng `notifications`.
   - [x] Học viên mở quả chuông thông báo: Hiển thị thông báo "Bài tập của bạn đã được chấm điểm".

### 11.2 Các lỗi thường gặp & Cách xử lý

- **Lỗi kết nối MySQL (`ECONNREFUSED 127.0.0.1:3306`)**:
  - Kiểm tra xem dịch vụ MySQL đã khởi động chưa (XAMPP / MySQL Service trong `services.msc`).
  - Kiểm tra thông tin `DB_USER` và `DB_PASSWORD` trong file `backend/.env`.
- **Lỗi chính sách thực thi PowerShell trên Windows (`npm.ps1 cannot be loaded`)**:
  - Khắc phục bằng cách chạy lệnh qua `npm.cmd` (ví dụ: `npm.cmd run dev`).
- **Lỗi cổng 5000 bị chiếm dụng (`EADDRINUSE: port 5000`)**:
  - Đổi biến `PORT=5001` trong `backend/.env` và cập nhật tương ứng `VITE_API_BASE_URL=http://localhost:5001/api` trong `frontend/.env`.

---

## 12. Bản quyền & Tác giả

Được phát triển và hoàn thiện cho môn học **SWD (Software Architecture and Design)** - FPT University.
Mọi thắc mắc và đóng góp vui lòng tạo Issue hoặc Pull Request trên kho mã nguồn.
