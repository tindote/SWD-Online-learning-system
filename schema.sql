-- Create Database
CREATE DATABASE IF NOT EXISTS `online_learning_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use Database
USE `online_learning_db`;

-- Drop tables in reverse order of foreign keys
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `lesson_progress`;
DROP TABLE IF EXISTS `submissions`;
DROP TABLE IF EXISTS `assignments`;
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `lessons`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `categories`;

-- 1. Categories Table
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users Table
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL DEFAULT '',
  `role` VARCHAR(50) NOT NULL DEFAULT 'student',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Courses Table
CREATE TABLE `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `instructor` VARCHAR(255) NOT NULL,
  `instructor_id` INT NULL,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `category` VARCHAR(100) NOT NULL,
  `thumbnail` VARCHAR(500) DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_courses_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Lessons Table
CREATE TABLE `lessons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT,
  `video_url` VARCHAR(500) DEFAULT NULL,
  `resource_url` VARCHAR(500) DEFAULT NULL,
  `lesson_order` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_lessons_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Enrollments Table
CREATE TABLE `enrollments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'active',
  `enrolled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_enrollments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_user_course` (`user_id`, `course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Assignments Table
CREATE TABLE `assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `due_date` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_assignments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Submissions Table
CREATE TABLE `submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assignment_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `grade` DECIMAL(5, 2) DEFAULT NULL,
  `feedback` TEXT DEFAULT NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_submissions_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_submissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Lesson Progress Table
CREATE TABLE `lesson_progress` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `lesson_id` INT NOT NULL,
  `completed` BOOLEAN DEFAULT TRUE,
  `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_progress_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_progress_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_user_lesson` (`user_id`, `lesson_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Reviews Table
CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `review` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_user_course_review` (`user_id`, `course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Notifications Table
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for performance
CREATE INDEX `idx_courses_category` ON `courses` (`category`);
CREATE INDEX `idx_courses_instructor` ON `courses` (`instructor_id`);
CREATE INDEX `idx_lessons_course` ON `lessons` (`course_id`, `lesson_order`);
CREATE INDEX `idx_enrollments_user` ON `enrollments` (`user_id`);
CREATE INDEX `idx_enrollments_course` ON `enrollments` (`course_id`);
CREATE INDEX `idx_assignments_course` ON `assignments` (`course_id`);
CREATE INDEX `idx_submissions_assign_user` ON `submissions` (`assignment_id`, `user_id`);
CREATE INDEX `idx_progress_user_course` ON `lesson_progress` (`user_id`, `course_id`);
CREATE INDEX `idx_reviews_course` ON `reviews` (`course_id`);
CREATE INDEX `idx_notifications_user` ON `notifications` (`user_id`, `is_read`);

-- Seed Data (Default Password for all seed accounts: 'Password123!')
-- Hash: $2b$10$HPPk9SxrIshCk8ZqvmhYfexySCxE8uJ.R.VL0l6rcbmE1/FJcUhv6

-- 1. Categories
INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Web Development', 'Khóa học phát triển web Frontend, Backend, Full-stack hiện đại.'),
(2, 'Data Science & AI', 'Phân tích dữ liệu, Trí tuệ nhân tạo, Machine Learning và Python.'),
(3, 'Mobile Development', 'Phát triển ứng dụng di động cho iOS (Swift) và Android (React Native, Flutter).'),
(4, 'DevOps & Cloud', 'Hạ tầng đám mây AWS, Azure, CI/CD pipelines, Docker và Kubernetes.'),
(5, 'UI/UX Design & Product', 'Thiết kế giao diện và trải nghiệm người dùng với Figma và Design Thinking.'),
(6, 'Cyber Security', 'An toàn thông tin, bảo mật ứng dụng web và kiểm thử xâm nhập (Penetration Testing).')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Users (Admin, Instructors, Students)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `bio`) VALUES
(1, 'Nguyễn Văn An', 'an.nguyen@example.com', '$2b$10$AHD7nujxw6blNIeMZzhfUOFSirQ7jHtquuCr4cHoKWps2JH6cmgoi', 'student', 'Sinh viên năm 3 chuyên ngành Kỹ thuật Phần mềm, đam mê phát triển Web.'),
(2, 'Trần Thị Bình', 'binh.tran@example.com', '$2b$10$AHD7nujxw6blNIeMZzhfUOFSirQ7jHtquuCr4cHoKWps2JH6cmgoi', 'student', 'Học viên ngành Trí tuệ nhân tạo, mục tiêu trở thành Data Scientist.'),
(3, 'Dr. Alex Morgan', 'alex.morgan@example.com', '$2b$10$AHD7nujxw6blNIeMZzhfUOFSirQ7jHtquuCr4cHoKWps2JH6cmgoi', 'instructor', 'Tiến sĩ Khoa học Máy tính, chuyên gia Full-Stack và Cloud Architecture với hơn 10 năm kinh nghiệm.'),
(4, 'Prof. Sarah Jenkins', 'sarah.jenkins@example.com', '$2b$10$AHD7nujxw6blNIeMZzhfUOFSirQ7jHtquuCr4cHoKWps2JH6cmgoi', 'instructor', 'Giáo sư chuyên ngành AI & Machine Learning, tác giả nhiều công trình nghiên cứu về Data Science.'),
(5, 'Lê Minh Cường', 'cuong.le@example.com', '$2b$10$AHD7nujxw6blNIeMZzhfUOFSirQ7jHtquuCr4cHoKWps2JH6cmgoi', 'admin', 'Quản trị viên hệ thống có toàn quyền điều hành E-Learning.'),
(9, 'Michael Chang', 'michael.chang@example.com', '$2b$10$AHD7nujxw6blNIeMZzhfUOFSirQ7jHtquuCr4cHoKWps2JH6cmgoi', 'instructor', 'Chuyên gia phát triển ứng dụng di động iOS/Android và thiết kế trải nghiệm người dùng UI/UX.'),
(12, 'Đỗ Hoàng Nam', 'hoang.nam@example.com', '$2b$10$AHD7nujxw6blNIeMZzhfUOFSirQ7jHtquuCr4cHoKWps2JH6cmgoi', 'student', 'Lập trình viên mới vào nghề tìm hiểu về Cloud và DevOps.'),
(13, 'Mai Lan Anh', 'lan.anh@example.com', '$2b$10$AHD7nujxw6blNIeMZzhfUOFSirQ7jHtquuCr4cHoKWps2JH6cmgoi', 'student', 'Sinh viên thiết kế đa phương tiện, mong muốn nâng cao kỹ năng UI/UX.'),
(14, 'Vũ Quang Huy', 'quang.huy@example.com', '$2b$10$AHD7nujxw6blNIeMZzhfUOFSirQ7jHtquuCr4cHoKWps2JH6cmgoi', 'student', 'Học viên đam mê an toàn thông tin và bảo mật mạng.'),
(15, 'Phạm Minh Thư', 'minh.thu@example.com', '$2b$10$AHD7nujxw6blNIeMZzhfUOFSirQ7jHtquuCr4cHoKWps2JH6cmgoi', 'student', 'Học viên tự học chuyển ngành sang công nghệ thông tin.'),
(17, 'Hoàng Tuấn Anh', 'tuananh.hoang@example.com', '$2b$10$HPPk9SxrIshCk8ZqvmhYfexySCxE8uJ.R.VL0l6rcbmE1/FJcUhv6', 'instructor', 'Mobile Tech Lead với hơn 8 năm phát triển Flutter và React Native cho các ứng dụng ngân hàng số.'),
(18, 'Đặng Hoàng Nam', 'hoangnam.dang@example.com', '$2b$10$HPPk9SxrIshCk8ZqvmhYfexySCxE8uJ.R.VL0l6rcbmE1/FJcUhv6', 'instructor', 'DevOps & SRE Specialist, chuyên gia tự động hóa CI/CD, Kubernetes và Cloud Infrastructure.'),
(19, 'Nguyễn Hà Linh', 'halinh.nguyen@example.com', '$2b$10$HPPk9SxrIshCk8ZqvmhYfexySCxE8uJ.R.VL0l6rcbmE1/FJcUhv6', 'instructor', 'Lead UI/UX Designer & Product Strategy tại công ty công nghệ đa quốc gia, diễn giả thiết kế Design Systems.'),
(20, 'Vũ Hải Đăng', 'haidang.vu@example.com', '$2b$10$HPPk9SxrIshCk8ZqvmhYfexySCxE8uJ.R.VL0l6rcbmE1/FJcUhv6', 'instructor', 'Chuyên gia An ninh mạng, chứng chỉ OSCP & CISSP, cựu trưởng nhóm bảo mật thông tin và SOC Analyst.');

-- 3. Courses (26 Full Courses)
INSERT INTO `courses` (`id`, `title`, `description`, `instructor`, `instructor_id`, `price`, `category`, `thumbnail`, `status`) VALUES
(1, 'Full-Stack Web Development with React & Node.js', 'Học lập trình web từ cơ bản đến nâng cao với React 18, Node.js Express và MySQL.', 'Dr. Alex Morgan', 3, 49.99, 'Web Development', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60', 'published'),
(2, 'Python for Data Science and Machine Learning', 'Khóa học toàn diện về Python, thư viện NumPy, Pandas, Scikit-Learn và các mô hình học máy cơ bản.', 'Prof. Sarah Jenkins', 4, 89.99, 'Data Science & AI', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60', 'published'),
(3, 'iOS & Swift Bootcamp for Beginners', 'Xây dựng ứng dụng native cho iPhone và iPad với Swift 5 và SwiftUI từ con số 0.', 'Michael Chang', 9, 29.99, 'Mobile Development', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=60', 'published'),
(4, 'Introduction to Cloud Computing & AWS Services', 'Nắm vững kiến thức nền tảng điện toán đám mây, các dịch vụ EC2, S3, RDS và Serverless.', 'Dr. Alex Morgan', 3, 0.00, 'DevOps & Cloud', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60', 'published'),
(5, 'Modern UI/UX Design with Figma: Wireframe to Prototype', 'Thực hành thiết kế giao diện người dùng chuyên nghiệp, xây dựng Design System và Prototype tương tác cao.', 'Michael Chang', 9, 39.99, 'UI/UX Design & Product', 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=60', 'published'),
(6, 'Docker & Kubernetes: Practical Containerization', 'Làm chủ Docker Container, Docker Compose và quản lý cụm dịch vụ tự động với Kubernetes trong sản xuất.', 'Dr. Alex Morgan', 3, 59.99, 'DevOps & Cloud', 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&auto=format&fit=crop&q=60', 'published'),
(7, 'Advanced React 18: Performance & Architecture', 'Khám phá các kỹ thuật tối ưu render, Concurrent Mode, React Server Components và State Management quy mô lớn.', 'Prof. Sarah Jenkins', 4, 0.00, 'Web Development', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60', 'published'),
(8, 'Deep Learning & Computer Vision with PyTorch', 'Xây dựng mô hình thị giác máy tính với Convolutional Neural Networks (CNNs) và PyTorch tiên tiến.', 'Prof. Sarah Jenkins', 4, 79.99, 'Data Science & AI', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60', 'published'),
(9, 'Ethical Hacking & Web Application Security', 'Khám phá lỗ hổng OWASP Top 10, phương thức phòng thủ SQL Injection, XSS, CSRF và bảo mật API an toàn.', 'Dr. Alex Morgan', 3, 69.99, 'Cyber Security', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60', 'published'),
(10, 'Next.js 15 & React Server Components: Xây dựng Web App Toàn diện', 'Làm chủ Next.js 15 App Router, Server Actions, Tối ưu SEO, Cache đa tầng và tích hợp xác thực bảo mật chuẩn Production.', 'Dr. Alex Morgan', 3, 69.99, 'Web Development', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60', 'published'),
(11, 'Phát triển Backend Hiệu năng cao với Golang (Go) & REST/gRPC', 'Học cách xây dựng hệ thống Microservices mạnh mẽ, xử lý hàng trăm nghìn requests/giây với Goroutines, Gin Framework và gRPC protocol.', 'Dr. Alex Morgan', 3, 79.99, 'Web Development', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=60', 'published'),
(12, 'Vue.js 3, Vite & Pinia: Xây dựng Ứng dụng Doanh nghiệp Hiện đại', 'Chinh phục Composition API, TypeScript trong Vue 3, Quản lý State tập trung với Pinia và xây dựng giao diện mượt mà với Tailwind CSS.', 'Michael Chang', 9, 49.99, 'Web Development', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60', 'published'),
(13, 'Tối ưu hóa Database & SQL Performance Tuning cho Hệ thống Lớn', 'Chuyên sâu về đánh chỉ mục Indexing (B-Tree, Hash), tối ưu hóa câu lệnh Query execution plan, cấu trúc bảng và Partitioning trong MySQL & PostgreSQL.', 'Dr. Alex Morgan', 3, 59.99, 'Web Development', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=60', 'published'),
(14, 'Flutter & Dart: Lập trình Ứng dụng Di động Đa Nền tảng Đỉnh Cao', 'Xây dựng ứng dụng hoàn chỉnh cho iOS và Android từ một codebase duy nhất. Làm chủ Bloc State Management, Animation và Firebase integration.', 'Hoàng Tuấn Anh', 17, 65.00, 'Mobile Development', 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&auto=format&fit=crop&q=60', 'published'),
(15, 'React Native & Expo: Xây dựng App Native Đẳng Cấp Cho Di Động', 'Chinh phục Expo SDK hiện đại, Expo Router, Native Navigation, Camera & Geolocation và xuất bản app lên Google Play & Apple App Store.', 'Michael Chang', 9, 55.00, 'Mobile Development', 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=60', 'published'),
(16, 'Lập trình Android Hiện đại với Kotlin & Jetpack Compose', 'Chuyển đổi toàn diện sang UI Declarative với Jetpack Compose, Coroutines, Flow, Dagger Hilt và kiến trúc Clean Architecture MVI.', 'Hoàng Tuấn Anh', 17, 49.99, 'Mobile Development', 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800&auto=format&fit=crop&q=60', 'published'),
(17, 'Generative AI & LLM Application với LangChain & OpenAI API', 'Khám phá kỷ nguyên Trí tuệ Nhân tạo mới: Xây dựng Chatbot thông minh, Hệ thống RAG (Retrieval-Augmented Generation) và AI Agents tự hành.', 'Prof. Sarah Jenkins', 4, 89.99, 'Data Science & AI', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60', 'published'),
(18, 'Data Engineering Toàn Diện với Apache Spark, Kafka & Big Data', 'Thiết kế hệ thống xử lý luồng dữ liệu khổng lồ (Real-time Stream Processing), Data Lakehouse với Delta Lake và lập lịch với Airflow.', 'Prof. Sarah Jenkins', 4, 99.00, 'Data Science & AI', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60', 'published'),
(19, 'Xử lý Ngôn ngữ Tự nhiên (NLP) Chuyên sâu với Transformers & BERT', 'Từ Tokenization đến Fine-tuning mô hình ngôn ngữ lớn: Phân loại văn bản, Nhận diện thực thể (NER), Tóm tắt văn bản và Dịch máy.', 'Prof. Sarah Jenkins', 4, 85.00, 'Data Science & AI', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60', 'published'),
(20, 'DevOps Thực Chiến: Tự Động Hóa CI/CD với GitLab CI & GitHub Actions', 'Xây dựng quy trình tự động hóa kiểm thử mã nguồn, quét lỗ hổng bảo mật, đóng gói container và triển khai không gián đoạn (Zero-Downtime Deploy).', 'Đặng Hoàng Nam', 18, 59.00, 'DevOps & Cloud', 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=60', 'published'),
(21, 'Quản Trị Cụm Kubernetes Chuyên Sâu & GitOps với ArgoCD', 'Chinh phục Kubernetes trong môi trường sản xuất: Ingress Controller, Helm Charts, HPA Auto-scaling, Giám sát Prometheus/Grafana và ArgoCD.', 'Đặng Hoàng Nam', 18, 75.00, 'DevOps & Cloud', 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=60', 'published'),
(22, 'Terraform & Quản Lý Hạ Tầng Dưới Dạng Mã (IaC) Đa Đám Mây', 'Tự động hóa hoàn toàn việc khởi tạo máy chủ, mạng VPC, cơ sở dữ liệu và bảo mật trên AWS và Google Cloud bằng Terraform HCL.', 'Đặng Hoàng Nam', 18, 49.00, 'DevOps & Cloud', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60', 'published'),
(23, 'Xây Dựng Design System & Micro-interactions Chuyên Nghiệp Với Figma', 'Từ nguyên lý Thiết kế Nguyên tử (Atomic Design) đến xây dựng Design Token, Auto-Layout linh hoạt, Component Variants và Micro-animations sống động.', 'Nguyễn Hà Linh', 19, 39.99, 'UI/UX Design & Product', 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=60', 'published'),
(24, 'Product Management & Chiến Lược Phát Triển Sản Phẩm Công Nghệ', 'Nắm vững tư duy Product Manager hiện đại: Từ thấu hiểu khách hàng, xây dựng Product Roadmap, phân tích chỉ số North Star đến Agile Scrum.', 'Nguyễn Hà Linh', 19, 59.99, 'UI/UX Design & Product', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60', 'published'),
(25, 'Kiểm Thử Xâm Nhập Web & Khai Thác Lỗ Hổng Thực Chiến (PenTest)', 'Thực hành tấn công và phòng thủ chuyên sâu: Khai thác SQL Injection nâng cao, SSRF, IDOR, deserialization và bypass WAF với Burp Suite Pro.', 'Vũ Hải Đăng', 20, 89.00, 'Cyber Security', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60', 'published'),
(26, 'SOC Analyst Thực Chiến: Điều Tra Sự Cố & Phân Tích Mã Độc', 'Làm chủ công cụ SIEM (Splunk, Elastic SIEM), kỹ thuật phân tích gói tin Wireshark, điều tra vết tấn công số (Digital Forensics) và phản ứng sự cố.', 'Vũ Hải Đăng', 20, 95.00, 'Cyber Security', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60', 'published');

-- 4. Lessons (135 Lessons)
INSERT INTO `lessons` (`id`, `course_id`, `title`, `content`, `video_url`, `resource_url`, `lesson_order`) VALUES
(5, 1, 'Giới thiệu về React 18 và Hệ sinh thái Frontend', 'Tổng quan về JSX, Functional Components, Virtual DOM và triết lý thiết kế React.', 'https://www.youtube.com/embed/SqcY0GlETPk', 'https://react.dev', 1),
(6, 1, 'Quản lý Trạng thái với React Hooks', 'Tìm hiểu sâu về useState, useEffect, useCallback, useMemo và Custom Hooks.', 'https://www.youtube.com/embed/O6P86uwfdR0', 'https://react.dev/reference/react', 2),
(7, 1, 'Xây dựng REST API chuẩn với Express.js', 'Khởi tạo Express server, tổ chức route, controller, middleware CORS và Error Handler.', 'https://www.youtube.com/embed/7H_QH9nipNs', 'https://expressjs.com', 3),
(8, 1, 'Tích hợp MySQL và Parameterized SQL Queries', 'Kết nối CSDL quan hệ với mysql2 connection pool, phòng chống SQL Injection.', 'https://www.youtube.com/embed/EN6Dx22cPRI', 'https://github.com/sidorares/node-mysql2', 4),
(18, 1, 'Xác thực người dùng với JSON Web Token (JWT) & Bảo mật Cookie', 'Trong bài học này, chúng ta sẽ tìm hiểu toàn diện về cơ chế xác thực Stateless Authentication sử dụng JWT:\n- Cấu trúc 3 phần của JWT: Header, Payload, Signature.\n- Tạo token với jsonwebtoken và mã hóa mật khẩu với bcrypt.\n- Lưu trữ an toàn trên Client: HttpOnly Cookies vs LocalStorage.\n- Xây dựng Auth Middleware bảo vệ các Private Routes trong Express.', 'https://www.youtube.com/embed/mbsmsi7l3r4', 'https://jwt.io/introduction', 5),
(19, 1, 'Deploy Full-Stack App lên Cloud và Thiết lập CI/CD Pipeline', 'Hoàn tất dự án và đưa ứng dụng lên môi trường Production:\n- Build ứng dụng React với Vite và tối ưu bundle size.\n- Thiết lập biến môi trường an toàn trên Server.\n- Triển khai Backend Node.js lên Render / Railway và Frontend lên Vercel.\n- Tự động hóa kiểm thử và deploy với GitHub Actions CI/CD.', 'https://www.youtube.com/embed/n4p_O10v7p4', 'https://docs.github.com/en/actions', 6),
(9, 2, 'Làm quen với Python & Jupyter Notebook', 'Cú pháp cơ bản, kiểu dữ liệu, cấu trúc điều khiển và môi trường Jupyter Notebook.', 'https://www.youtube.com/embed/rfscVS0vtbw', 'https://docs.python.org', 1),
(10, 2, 'Phân tích dữ liệu cùng Pandas DataFrame', 'Thao tác với chuỗi Series, bảng DataFrame, lọc và xử lý dữ liệu bị thiếu (NaN).', 'https://www.youtube.com/embed/dcqPhpY7tWk', 'https://pandas.pydata.org', 2),
(11, 2, 'Trực quan hóa dữ liệu với Matplotlib & Seaborn', 'Vẽ biểu đồ phân bố, biểu đồ phân tán, biểu đồ nhiệt để phát hiện xu hướng.', 'https://www.youtube.com/embed/DAQNHzOcO5A', 'https://seaborn.pydata.org', 3),
(20, 2, 'Xây dựng mô hình Machine Learning đầu tiên với Scikit-Learn', 'Bài học này trang bị kiến thức nền tảng về học có giám sát (Supervised Learning):\n- Tiền xử lý dữ liệu: Xử lý giá trị null, scaling và one-hot encoding.\n- Chia tập Train/Test dữ liệu với train_test_split.\n- Huấn luyện thuật toán Hồi quy tuyến tính (Linear Regression) và Decision Tree.\n- Đánh giá mô hình: MSE, RMSE, R2 Score và Confusion Matrix.', 'https://www.youtube.com/embed/0B5eIE_1vpU', 'https://scikit-learn.org/stable/', 4),
(21, 2, 'Dự án thực tế: Phân tích và Dự đoán Giá Bất Động Sản', 'Áp dụng toàn bộ quy trình Data Science vào một bài toán thực tế:\n- Khám phá và làm sạch bộ dữ liệu thực tế (EDA).\n- Feature Engineering: Trích xuất các đặc trưng quan trọng.\n- Thử nghiệm và so sánh nhiều mô hình (Random Forest, Gradient Boosting).\n- Trình bày kết quả phân tích và export model với joblib.', 'https://www.youtube.com/embed/Wqmtf9SA_kk', 'https://kaggle.com/datasets', 5),
(12, 3, 'Nhập môn Swift và Xcode IDE', 'Cài đặt môi trường Xcode, biến số, kiểu dữ liệu Optionals và Control Flow trong Swift.', 'https://www.youtube.com/embed/comQ1-x2a1Q', 'https://developer.apple.com/swift', 1),
(13, 3, 'Thiết kế giao diện declarative với SwiftUI', 'Views, Modifiers, Stacks (VStack, HStack), State và Binding trong SwiftUI.', 'https://www.youtube.com/embed/F2ojC6TNwws', 'https://developer.apple.com/xcode/swiftui', 2),
(22, 3, 'Quản lý Trạng thái và Navigation trong SwiftUI', 'Nắm vững luồng dữ liệu (Data Flow) trong ứng dụng SwiftUI:\n- Sự khác biệt giữa @State, @Binding, @ObservedObject và @EnvironmentObject.\n- Điều hướng hiện đại với NavigationStack và NavigationPath.\n- Xây dựng Form nhập liệu mượt mà với validation theo thời gian thực.', 'https://www.youtube.com/embed/1XbHwR_vW7k', 'https://developer.apple.com/documentation/swiftui/state-and-data-flow', 3),
(23, 3, 'Tích hợp RESTful API với URLSession và Codable Protocol', 'Kết nối ứng dụng iOS với backend:\n- Sử dụng URLSession với mô hình Async/Await trong Swift 5+.\n- Parse JSON dữ liệu tự động với Codable và JSONDecoder.\n- Quản lý trạng thái tải: Loading, Success, Error state trên giao diện người dùng.', 'https://www.youtube.com/embed/sqo8449Dgu8', 'https://developer.apple.com/documentation/foundation/urlsession', 4),
(24, 3, 'Đóng gói, Kiểm thử và Phát hành Ứng dụng lên App Store', 'Quy trình phát hành chuyên nghiệp từ Xcode lên App Store Connect:\n- Tạo Certificate, App ID và Provisioning Profile trên Apple Developer Portal.\n- Kiểm thử Beta với TestFlight và thu thập phản hồi từ người dùng.\n- Chuẩn bị Screenshots, Metadata và gửi kiểm duyệt lên App Store Review.', 'https://www.youtube.com/embed/wX883L6N3t8', 'https://developer.apple.com/app-store/submissions/', 5),
(14, 4, 'Tổng quan về Cloud Computing và Mô hình Dịch vụ', 'Sự khác biệt giữa IaaS, PaaS, SaaS và ưu điểm khi chuyển dịch lên Cloud.', 'https://www.youtube.com/embed/M988_fsOSWo', 'https://aws.amazon.com/what-is-cloud-computing', 1),
(15, 4, 'Thực hành với AWS EC2 & S3 Bucket', 'Khởi tạo máy ảo EC2 Linux, cấu hình Security Group và lưu trữ tài nguyên trên Amazon S3.', 'https://www.youtube.com/embed/Z3SYDTMP3ME', 'https://docs.aws.amazon.com', 2),
(25, 4, 'Cơ sở Dữ liệu Đám mây: Quản lý AWS RDS & DynamoDB', 'Tìm hiểu các giải pháp lưu trữ dữ liệu hiệu năng cao trên AWS:\n- Khởi tạo MySQL/PostgreSQL Managed Instance với AWS RDS.\n- Cơ chế Multi-AZ Deployment và Read Replicas để chống chịu lỗi.\n- Giới thiệu NoSQL serverless với Amazon DynamoDB: Partition Key và Sort Key.', 'https://www.youtube.com/embed/e_kXz9vQ7F0', 'https://aws.amazon.com/rds/', 3),
(26, 4, 'Kiến trúc Không máy chủ (Serverless) với AWS Lambda & API Gateway', 'Tiết kiệm chi phí và tăng tốc độ mở rộng ứng dụng:\n- Nguyên lý hoạt động của kiến trúc Serverless (FaaS).\n- Viết hàm Lambda xử lý sự kiện với Node.js.\n- Tạo REST API endpoint với Amazon API Gateway kết nối trực tiếp đến Lambda.\n- Giám sát logs và metric hiệu năng qua AWS CloudWatch.', 'https://www.youtube.com/embed/EBCdyQ3eGlI', 'https://aws.amazon.com/lambda/', 4),
(27, 4, 'Bảo mật Đám mây & Phân quyền Truy cập với AWS IAM & VPC', 'Bảo vệ hạ tầng ứng dụng theo tiêu chuẩn an ninh đám mây:\n- Quản lý danh tính và phân quyền với AWS Identity and Access Management (IAM).\n- Thiết kế mạng ảo Virtual Private Cloud (VPC), Public/Private Subnet và NAT Gateway.\n- Cấu hình Security Groups và Network ACLs chống tấn công mạng.', 'https://www.youtube.com/embed/9oF84E8p72s', 'https://aws.amazon.com/iam/', 5),
(16, 5, 'Nguyên lý Thiết kế Giao diện và Wireframing', 'Các nguyên tắc thiết kế UI (Hierarchy, Contrast, Alignment) và dựng Wireframe trong Figma.', 'https://www.youtube.com/embed/c9Wg6Cb_YlU', 'https://www.figma.com/best-practices', 1),
(17, 5, 'Xây dựng Design System và Interactive Prototype', 'Tạo Color Tokens, Typography, Auto-Layout và kết nối Smart Animate prototype.', 'https://www.youtube.com/embed/FTFaQWZBqQ8', 'https://help.figma.com', 2),
(28, 5, 'Hệ thống Màu sắc và Nghệ thuật Typography trong UI Design', 'Xây dựng nền tảng thị giác mạnh mẽ cho ứng dụng số:\n- Nguyên lý tỷ lệ 60-30-10 và cách tạo Color Palette hài hòa.\n- Phân cấp thông tin (Visual Hierarchy) thông qua Typography Scale.\n- Kiểm tra độ tương phản màu sắc đáp ứng tiêu chuẩn Accessibility (WCAG 2.1).', 'https://www.youtube.com/embed/fW5z_FwZ7eA', 'https://www.figma.com/resource-library/', 3),
(29, 5, 'Làm chủ Auto-Layout, Component Variants và Variables trong Figma', 'Nâng tầm hiệu suất thiết kế với các tính năng chuyên nghiệp của Figma:\n- Thiết kế giao diện co giãn Responsive với Auto-Layout nâng cao (Wrap, Min/Max).\n- Xây dựng Component Set với Variants và Boolean Properties.\n- Thiết lập Figma Variables hỗ trợ chế độ Light/Dark Mode tức thì.', 'https://www.youtube.com/embed/NxSfl8M_3yE', 'https://help.figma.com/hc/en-us/articles/360040451373-Create-dynamic-designs-with-auto-layout', 4),
(30, 5, 'Kiểm thử Trải nghiệm Người dùng (Usability Testing) & Hand-off cho Dev', 'Hoàn thiện quy trình thiết kế hướng sản phẩm:\n- Thiết lập kịch bản Usability Testing và đo lường tỷ lệ hoàn thành tác vụ.\n- Tổ chức file thiết kế chuẩn chỉ với Figma Dev Mode.\n- Ghi chú thông số Spacing, Tokens và xuất Assets tối ưu cho Frontend Developer.', 'https://www.youtube.com/embed/k749U1N7u5Q', 'https://www.nngroup.com/articles/usability-testing-101/', 5),
(31, 6, 'Tổng quan về Containerization và Làm quen với Docker Engine', 'Khởi đầu với công nghệ Container giúp đóng gói và chuẩn hóa môi trường:\n- Sự khác biệt căn bản giữa Virtual Machine (Máy ảo) và Container.\n- Cài đặt và cấu hình Docker Desktop trên Windows/macOS/Linux.\n- Các lệnh thao tác cơ bản: docker run, docker ps, docker stop, docker rm.\n- Khám phá Docker Hub và tải các image phổ biến: Nginx, Node.js, MySQL.', 'https://www.youtube.com/embed/gAkwW2tuIqE', 'https://docs.docker.com/get-started/', 1),
(32, 6, 'Viết Dockerfile Chuẩn và Kỹ thuật Multi-stage Builds', 'Tự tạo Image tùy chỉnh cho ứng dụng Web:\n- Cú pháp cơ bản của Dockerfile: FROM, WORKDIR, COPY, RUN, CMD, EXPOSE.\n- Tối ưu kích thước image từ hàng GB xuống chỉ vài chục MB với Multi-stage builds.\n- Sử dụng tệp .dockerignore để tăng tốc quá trình build và bảo mật bí mật mã nguồn.', 'https://www.youtube.com/embed/JofsaZ3H1qM', 'https://docs.docker.com/build/building/multi-stage/', 2),
(33, 6, 'Điều phối Đa dịch vụ (Multi-container) với Docker Compose', 'Kết nối ứng dụng Full-stack chỉ với 1 câu lệnh docker compose up:\n- Định dạng cú pháp tệp docker-compose.yml (services, networks, volumes).\n- Gắn kết dữ liệu bền vững (Data Persistence) cho Database với Docker Volumes.\n- Thiết lập mạng nội bộ giữa Frontend, Backend API và MySQL Server.', 'https://www.youtube.com/embed/HG6yIjZapSA', 'https://docs.docker.com/compose/', 3),
(34, 6, 'Triển khai và Quản lý Ứng dụng với Kubernetes Cluster (K8s)', 'Học cách điều phối container tự động ở quy mô lớn:\n- Kiến trúc Kubernetes: Control Plane, Worker Nodes, Pods, Deployments, Services.\n- Viết YAML Manifest định nghĩa Pod và ReplicaSet.\n- Cân bằng tải (Load Balancing) và Expose ứng dụng với Kubernetes Service.\n- Tự động mở rộng (Auto-scaling) và cập nhật không gián đoạn (Rolling Updates).', 'https://www.youtube.com/embed/X48VuDVv0do', 'https://kubernetes.io/docs/concepts/', 4),
(47, 6, 'Quản lý Dữ liệu Bền vững với Persistent Volumes (PV & PVC)', 'Tìm hiểu cách Kubernetes tách rời lưu trữ và tính toán: Khởi tạo StorageClass, cấp phát tự động PersistentVolumeClaim cho CSDL StatefulSet.', 'https://www.youtube.com/embed/M988_fsOSWo', 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/', 5),
(48, 6, 'Bảo mật Cụm K8s với Network Policies và RBAC Phân quyền', 'Thiết lập NetworkPolicy chặn lưu lượng truy cập trái phép giữa các Namespace, tạo ServiceAccount và gán quyền RoleBinding nghiêm ngặt.', 'https://www.youtube.com/embed/2_lswM1S264', 'https://kubernetes.io/docs/concepts/security/', 6),
(35, 7, 'Tính năng Đồng thời trong React 18: Suspense, useTransition & useDeferredValue', 'Khai phá sức mạnh Concurrent React để giao diện luôn mượt mà và phản hồi tức thì:\n- Cơ chế Concurrent Rendering và ưu tiên cập nhật (Priority Updates).\n- Trì hoãn xử lý tác vụ nặng với hook useTransition mà không gây đơ giao diện.\n- Trì hoãn giá trị hiển thị tìm kiếm với useDeferredValue.\n- Lazy-loading component và Data Fetching mượt mà cùng React Suspense.', 'https://www.youtube.com/embed/jCGMedd6ptM', 'https://react.dev/reference/react/useTransition', 1),
(36, 7, 'Tối ưu Hiệu năng Render Chuyên sâu: useMemo, useCallback & Profiler', 'Khắc phục triệt để hiện tượng Re-render không cần thiết trong ứng dụng lớn:\n- Khi nào NÊN và KHÔNG NÊN dùng useMemo, useCallback và React.memo.\n- Sử dụng React DevTools Profiler để đo thời gian render và tìm Flamegraph bottlenecks.\n- Kỹ thuật Virtualization hiển thị danh sách hàng chục nghìn phần tử với React Window.', 'https://www.youtube.com/embed/DEPwA3mv_R8', 'https://react.dev/reference/react/memo', 2),
(37, 7, 'Custom Hooks Nâng cao và Quản lý Trạng thái Hiện đại với Zustand', 'Thay thế Redux cồng kềnh bằng Zustand đơn giản, mạnh mẽ và siêu nhẹ:\n- Thiết kế Custom Hooks tái sử dụng logic: useDebounce, useLocalStorage, useFetch.\n- Tạo Global Store với Zustand: Actions, Selectors và Async middleware.\n- Tích hợp Redux DevTools Extension và LocalStorage Persist với Zustand.', 'https://www.youtube.com/embed/oxTP6hP4q7A', 'https://docs.pmnd.rs/zustand/getting-started/introduction', 3),
(38, 7, 'Kiến trúc Modular, Design Patterns và Micro-Frontends trong React', 'Xây dựng codebase chuẩn Enterprise có khả năng mở rộng cho nhiều team:\n- Feature-driven Folder Structure vs Layer-driven Structure.\n- Các mẫu thiết kế phổ biến: Compound Components, Render Props, Provider Pattern.\n- Giới thiệu kiến trúc Micro-frontends sử dụng Webpack Module Federation / Vite.', 'https://www.youtube.com/embed/MSq_DCRxOxw', 'https://patterns.dev', 4),
(49, 7, 'Mô hình React Server Components (RSC) & Streaming SSR', 'Hiểu bản chất của React Server Components, Suspense boundary cho Streaming SSR và cơ chế Hydration từng phần giúp tăng điểm Web Vitals.', 'https://www.youtube.com/embed/SqcY0GlETPk', 'https://react.dev/reference/rsc/server-components', 5),
(50, 7, 'Micro-Frontend Architecture: Chia nhỏ Ứng dụng React Lớn', 'Áp dụng Module Federation với Webpack/Vite để ghép nối nhiều ứng dụng React độc lập thành một hệ thống portal duy nhất mà không xung đột mã.', 'https://www.youtube.com/embed/n4p_O10v7p4', 'https://module-federation.io/', 6),
(39, 8, 'Nhập môn Deep Learning & Các thao tác Tensor với PyTorch', 'Bước đầu làm quen với framework học sâu hàng đầu thế giới:\n- Tìm hiểu cấu trúc dữ liệu PyTorch Tensor và so sánh với NumPy Arrays.\n- Cơ chế Autograd tự động tính đạo hàm và Backpropagation.\n- Xây dựng mô hình Perceptron đa tầng (MLP) cho bài toán phân loại số viết tay MNIST.\n- Huấn luyện mô hình trên GPU với CUDA acceleration.', 'https://www.youtube.com/embed/V_xro14G74U', 'https://pytorch.org/tutorials/', 1),
(40, 8, 'Mạng nơ-ron Tích chập (CNN) cho Bài toán Phân loại Hình ảnh', 'Kiến trúc mạng thần kinh chuyên biệt cho xử lý thị giác máy tính:\n- Nguyên lý hoạt động của Convolutional Layer, Kernel, Stride, Padding.\n- Giảm chiều dữ liệu với Pooling Layer (Max Pooling, Average Pooling).\n- Tránh Overfitting với Dropout và Data Augmentation (xoay, lật, chỉnh màu ảnh).\n- Xây dựng mô hình CNN hoàn chỉnh phân loại ảnh tập dữ liệu CIFAR-10.', 'https://www.youtube.com/embed/IA3WxTTPXqQ', 'https://cs231n.github.io/convolutional-networks/', 2),
(41, 8, 'Kỹ thuật Học chuyển giao (Transfer Learning) với ResNet & EfficientNet', 'Tận dụng các mô hình đã được huấn luyện trên hàng triệu hình ảnh:\n- Khái niệm Transfer Learning và Fine-Tuning trong Deep Learning.\n- Sử dụng Torchvision Models: ResNet-50, EfficientNet-B0.\n- Đóng băng trọng số (Freeze weights) và thay thế Fully Connected Classification Head.\n- Huấn luyện nhận diện bệnh trên lá cây với độ chính xác trên 96%.', 'https://www.youtube.com/embed/qaDe0qQZ5h8', 'https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html', 3),
(42, 8, 'Nhận diện và Định vị Đối tượng Thời gian thực với YOLOv8', 'Triển khai bài toán Object Detection hiện đại:\n- Sự khác nhau giữa Image Classification, Object Detection và Image Segmentation.\n- Giới thiệu kiến trúc YOLO (You Only Look Once) và Ultralytics YOLOv8.\n- Chuẩn bị và dán nhãn dữ liệu tùy chỉnh với Roboflow.\n- Train mô hình Custom Object Detection và chạy suy luận (Inference) trên Video thực tế.', 'https://www.youtube.com/embed/m9fH9OWnSQU', 'https://docs.ultralytics.com/', 4),
(51, 8, 'Nhận diện Vật thể Thời gian Thực với Mô hình YOLOv8', 'Tìm hiểu cơ chế Single-Shot Detection, chuẩn bị tập dữ liệu nhãn Bounding Box với Roboflow và huấn luyện mô hình YOLOv8 phát hiện vật thể.', 'https://www.youtube.com/embed/0B5eIE_1vpU', 'https://docs.ultralytics.com/', 5),
(52, 8, 'Phân vùng Hình ảnh Ngữ nghĩa (Semantic Segmentation) với U-Net', 'Kiến trúc mạng U-Net với Skip Connections, ứng dụng phân vùng hình ảnh y tế (chụp X-quang, MRI) và đo lường bằng chỉ số IoU và Dice coefficient.', 'https://www.youtube.com/embed/Wqmtf9SA_kk', 'https://pytorch.org/hub/mateuszbuda_brain-segmentation-pytorch_unet/', 6),
(43, 9, 'Tổng quan An ninh Mạng và Khung Bảo mật OWASP Top 10', 'Nắm vững tư duy bảo mật phòng thủ và các nguy cơ an ninh mạng phổ biến:\n- Khái niệm Ethical Hacking (White Hat Hacker) và ranh giới pháp lý an toàn thông tin.\n- Tổng quan danh mục OWASP Top 10 lỗ hổng bảo mật ứng dụng web nguy hiểm nhất.\n- Cài đặt môi trường thực hành bảo mật an toàn với Kali Linux và DVWA (Damn Vulnerable Web App).', 'https://www.youtube.com/embed/3Kq1MIfTWCE', 'https://owasp.org/www-project-top-ten/', 1),
(44, 9, 'Khai thác và Phòng chống Tấn công SQL Injection (SQLi)', 'Phân tích sâu lỗ hổng tiêm mã truy vấn cơ sở dữ liệu:\n- Nguyên nhân cốt lõi gây ra SQL Injection: Nối chuỗi dữ liệu đầu vào không kiểm soát.\n- Các hình thức tấn công: In-band SQLi, Blind SQLi (Boolean-based, Time-based).\n- Sử dụng công cụ SQLMap tự động kiểm tra lỗ hổng.\n- Biện pháp phòng chống triệt để: Parameterized Queries (Prepared Statements) và ORM.', 'https://www.youtube.com/embed/ciNHn38EyRc', 'https://portswigger.net/web-security/sql-injection', 2),
(45, 9, 'Tấn công XSS (Cross-Site Scripting) và CSRF (Cross-Site Request Forgery)', 'Bảo vệ người dùng khỏi các cuộc tấn công khai thác trên trình duyệt:\n- Phân loại XSS: Stored XSS, Reflected XSS và DOM-based XSS.\n- Khai thác cắp Session Cookie và mạo danh người dùng.\n- Cơ chế CSRF và cách phòng chống bằng Anti-CSRF Tokens cùng SameSite Cookie.\n- Thiết lập Content Security Policy (CSP) chặt chẽ cho Web App.', 'https://www.youtube.com/embed/EoaDgDgDZQA', 'https://portswigger.net/web-security/cross-site-scripting', 3),
(46, 9, 'Quy trình Penetration Testing Toàn diện và Viết Báo cáo Lỗ hổng', 'Thực hiện đánh giá bảo mật chuyên nghiệp theo tiêu chuẩn PTES:\n- Các giai đoạn kiểm thử xâm nhập: Reconnaissance, Scanning, Exploitation, Post-exploitation.\n- Sử dụng Burp Suite Professional để chặn bắt và thao túng gói tin HTTP Requests.\n- Đánh giá mức độ nghiêm trọng theo thang điểm CVSS v3.\n- Soạn thảo báo cáo lỗ hổng kỹ thuật và đề xuất giải pháp vá lỗi cho doanh nghiệp.', 'https://www.youtube.com/embed/2_lswM1S264', 'https://portswigger.net/burp', 4),
(53, 9, 'Tấn công Xác thực & Cơ chế Quản lý Phiên (Session Hijacking)', 'Tìm hiểu cách tin tặc đánh cắp session ID thông qua XSS, tấn công Cross-Site Request Forgery (CSRF) và cấu hình cờ SameSite, HttpOnly an toàn.', 'https://www.youtube.com/embed/mbsmsi7l3r4', 'https://owasp.org/www-community/attacks/Session_fixation', 5),
(54, 9, 'Bảo vệ Cơ sở Hạ tầng Web với Cloudflare WAF & Rate Limiting', 'Triển khai tường lửa ứng dụng web Cloudflare, cấu hình quy tắc chống tấn công DDoS, giới hạn tần suất request (Rate Limiting) và ẩn IP gốc.', 'https://www.youtube.com/embed/2_lswM1S264', 'https://developers.cloudflare.com/waf/', 6),
(55, 10, 'Giới thiệu Next.js 15 App Router & Kiến trúc Server Components', 'Tìm hiểu sự khác biệt giữa Server Components và Client Components, cách thức giảm Bundle Size về 0 cho các trang render từ máy chủ.', 'https://www.youtube.com/embed/SqcY0GlETPk', 'https://nextjs.org/docs', 1),
(56, 10, 'Xử lý dữ liệu với Next.js Server Actions & Revalidation', 'Thực thi các hàm mutation trực tiếp trên server mà không cần tạo REST endpoint trung gian, kết hợp revalidatePath và revalidateTag.', 'https://www.youtube.com/embed/7H_QH9nipNs', 'https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations', 2),
(57, 10, 'Xác thực người dùng với NextAuth.js (Auth.js v5) & Role Protection', 'Cấu hình OAuth Google/GitHub và Credentials Provider, xử lý JWT session, middleware bảo vệ tuyến đường theo phân quyền người dùng.', 'https://www.youtube.com/embed/mbsmsi7l3r4', 'https://authjs.dev', 3),
(58, 10, 'Tối ưu hóa Hiệu năng, Hình ảnh, Font chữ & SEO Toàn diện', 'Khai thác tối đa next/image, next/font, generateMetadata cho SEO động và OpenGraph image phục vụ chia sẻ mạng xã hội.', 'https://www.youtube.com/embed/O6P86uwfdR0', 'https://nextjs.org/docs/app/building-your-application/optimizing', 4),
(59, 10, 'Triển khai Full-Stack Next.js trên Vercel và Docker Server Riêng', 'Build ứng dụng dạng standalone container, cấu hình biến môi trường production, kết nối CDN và giám sát lỗi với Sentry.', 'https://www.youtube.com/embed/n4p_O10v7p4', 'https://nextjs.org/docs/app/building-your-application/deploying', 5),
(60, 11, 'Cơ bản về Go: Syntax, Pointers, Structs & Interfaces', 'Nắm vững triết lý thiết kế của Go: sự đơn giản, tĩnh kiểu nghiêm ngặt, quản lý bộ nhớ và cách sử dụng struct thay cho class hướng đối tượng.', 'https://www.youtube.com/embed/un6ZyFkqFKo', 'https://go.dev/tour/', 1),
(61, 11, 'Đồng thời trong Go: Goroutines, Channels và Mutex Synchronization', 'Khám phá mô hình CSP (Communicating Sequential Processes), giải quyết bài toán chạy song song nhiều tác vụ mà không bị Race Condition.', 'https://www.youtube.com/embed/yyUHQIec83I', 'https://go.dev/doc/effective_go#concurrency', 2),
(62, 11, 'Xây dựng REST API cực nhanh với Gin Framework và GORM', 'Tổ chức Clean Architecture trong Go: Handlers, Services, Repositories, kết nối PostgreSQL/MySQL và kiểm soát database transaction.', 'https://www.youtube.com/embed/7H_QH9nipNs', 'https://gin-gonic.com/docs/', 3),
(63, 11, 'Giao tiếp Microservices với Protocol Buffers & gRPC', 'Định nghĩa Proto file, sinh mã tự động, xây dựng gRPC Client và Server streaming dữ liệu với độ trễ thấp vượt trội so với JSON/REST.', 'https://www.youtube.com/embed/Bzx_z5dF7_Y', 'https://grpc.io/docs/languages/go/', 4),
(64, 11, 'Unit Test, Benchmark và Tối ưu Memory Allocation trong Go', 'Sử dụng go test, go bench, pprof để tìm memory leak, CPU bottleneck và viết mã đạt hiệu suất tối ưu.', 'https://www.youtube.com/embed/EN6Dx22cPRI', 'https://pkg.go.dev/testing', 5),
(65, 12, 'Vue 3 Composition API & Reactivity Core (ref, reactive, computed)', 'Khám phá cách mạng của Vue 3 với script setup, quản lý trạng thái phản ứng linh hoạt và tái sử dụng logic với Composables.', 'https://www.youtube.com/embed/bzlF85464bo', 'https://vuejs.org/guide/introduction.html', 1),
(66, 12, 'Tổ chức State Management quy mô lớn với Pinia Store', 'Thay thế Vuex bằng Pinia: State, Getters, Actions, hỗ trợ Devtools tuyệt vời và Type Safety tự nhiên không cần cấu hình phức tạp.', 'https://www.youtube.com/embed/u_JkF-8i5p8', 'https://pinia.vuejs.org/', 2),
(67, 12, 'Điều hướng Single Page App với Vue Router 4 & Navigation Guards', 'Cấu hình dynamic route params, nested routes, phân quyền truy cập thông qua beforeEach guards và lazy loading component.', 'https://www.youtube.com/embed/juocv4AtrCs', 'https://router.vuejs.org/', 3),
(68, 12, 'Xây dựng Component Thư viện tái sử dụng với TypeScript', 'Khai báo props, emits với kiểu dữ liệu chuẩn chỉnh, sử và slot scoped để tạo các UI Component linh hoạt như Modal, DataTable, Dropdown.', 'https://www.youtube.com/embed/SqcY0GlETPk', 'https://vuejs.org/guide/typescript/overview.html', 4),
(69, 12, 'Kiểm thử Component với Vitest và Tối ưu hóa Tốc độ Tải', 'Thiết lập Vitest và Vue Test Utils, đo lường độ bao phủ kiểm thử (coverage), chia nhỏ code splitting và preload tài nguyên.', 'https://www.youtube.com/embed/n4p_O10v7p4', 'https://test-utils.vuejs.org/', 5),
(70, 13, 'Hiểu sâu về B-Tree Index và Chiến lược Đánh chỉ mục hiệu quả', 'Cấu trúc lưu trữ dữ liệu đĩa cứng, nguyên lý hoạt động của Clustered vs Secondary Index, quy tắc Leftmost Prefix Rule.', 'https://www.youtube.com/embed/EN6Dx22cPRI', 'https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html', 1),
(71, 13, 'Đọc và Phân tích EXPLAIN / EXPLAIN ANALYZE Execution Plan', 'Giải mã các chỉ số then chốt: type (ALL, ref, range, index), possible_keys, key_len, rows examined và phát hiện Full Table Scan.', 'https://www.youtube.com/embed/7H_QH9nipNs', 'https://dev.mysql.com/doc/refman/8.0/en/explain-output.html', 2),
(72, 13, 'Tối ưu hóa truy vấn Phức tạp: JOINs, Subqueries và Window Functions', 'Chuyển đổi subquery không hiệu quả thành JOIN, áp dụng Covering Index để truy vấn chỉ quét chỉ mục mà không đọc bảng gốc.', 'https://www.youtube.com/embed/dcqPhpY7tWk', 'https://www.postgresql.org/docs/current/performance-tips.html', 3),
(73, 13, 'Phân vùng dữ liệu (Table Partitioning) và Quản lý Bảng dữ liệu Khổng lồ', 'Chiến lược chia bảng theo Range, List và Hash; tự động lưu trữ và dọn dẹp dữ liệu lịch sử hàng chục triệu bản ghi.', 'https://www.youtube.com/embed/Z3SYDTMP3ME', 'https://dev.mysql.com/doc/refman/8.0/en/partitioning.html', 4),
(74, 13, 'Connection Pooling, Sharding & Caching với Redis', 'Cấu hình pool kết nối tối ưu cho backend, kiến trúc Read/Write Splitting với Replica và tầng Cache Redis giảm tải DB.', 'https://www.youtube.com/embed/e_kXz9vQ7F0', 'https://redis.io/docs/', 5),
(75, 14, 'Làm quen với Dart 3 & Kiến trúc Widget của Flutter', 'Pattern matching, Records trong Dart 3, sự khác biệt giữa StatelessWidget và StatefulWidget, vòng đời và Render Tree.', 'https://www.youtube.com/embed/1gDhl4leEzA', 'https://flutter.dev/docs', 1),
(76, 14, 'Quản lý Trạng thái Chuyên nghiệp với Bloc & Cubit Pattern', 'Tách biệt rõ ràng tầng UI, Business Logic và Data Layer. Xử lý các luồng sự kiện bất đồng bộ mượt mà không re-render dư thừa.', 'https://www.youtube.com/embed/la0Wz2F5k2c', 'https://bloclibrary.dev/', 2),
(77, 14, 'Tạo Hiệu ứng Chuyển động Mượt mà (Custom Animations & Hero)', 'Sử dụng AnimationController, Tween, AnimatedBuilder và Hero Animation để tạo trải nghiệm người dùng cao cấp chuẩn 120 FPS.', 'https://www.youtube.com/embed/FTFaQWZBqQ8', 'https://docs.flutter.dev/ui/animations', 3),
(78, 14, 'Kết nối REST API với Dio, Retrofit và Caching cục bộ', 'Xây dựng Network Client chuẩn, interceptors tự động đính kèm token xác thực, xử lý refresh token và lưu trữ offline với Hive/Isar.', 'https://www.youtube.com/embed/sqo8449Dgu8', 'https://pub.dev/packages/dio', 4),
(79, 14, 'Tích hợp Firebase Auth, Cloud Firestore & Push Notifications', 'Cấu hình Firebase CLI, xác thực người dùng bằng SMS/Email, đồng bộ dữ liệu thời gian thực và nhận thông báo FCM khi app đang chạy ngầm.', 'https://www.youtube.com/embed/wX883L6N3t8', 'https://firebase.google.com/docs/flutter/setup', 5),
(80, 15, 'Khởi tạo Dự án với Expo Router & Cấu trúc File-Based Routing', 'Cài đặt môi trường phát triển siêu tốc với Expo EAS, cấu trúc thư mục app router tương tự Next.js, Tabs và Stack Navigation.', 'https://www.youtube.com/embed/F2ojC6TNwws', 'https://docs.expo.dev/router/introduction/', 1),
(81, 15, 'Tối ưu UI Linh hoạt với React Native Reanimated & Gesture Handler', 'Tạo các thao tác vuốt chạm Swipe to Delete, Drag & Drop với hiệu năng tính toán trực tiếp trên UI Thread mà không nghẽn JS Thread.', 'https://www.youtube.com/embed/1XbHwR_vW7k', 'https://docs.swmansion.com/react-native-reanimated/', 2),
(82, 15, 'Truy cập Phần cứng Thiết bị: Máy ảnh, Bộ sưu tập & Định vị GPS', 'Sử dụng expo-camera để chụp ảnh, quét mã QR; expo-location để lấy tọa độ người dùng và hiển thị bản đồ tương tác.', 'https://www.youtube.com/embed/sqo8449Dgu8', 'https://docs.expo.dev/versions/latest/', 3),
(83, 15, 'Quản lý Dữ liệu Ngoại tuyến và Đồng bộ Đám mây', 'Áp dụng AsyncStorage và MMKV siêu tốc để lưu trữ token và thông tin cá nhân, xử lý kết nối mạng chập chờn với NetInfo.', 'https://www.youtube.com/embed/EN6Dx22cPRI', 'https://github.com/mrousavy/react-native-mmkv', 4),
(84, 15, 'Build APK/IPA tự động với EAS Build và Xuất bản App', 'Tạo chứng chỉ Signing Keystore cho Android, Provisioning Profile cho iOS và cấu hình EAS Build trên hạ tầng đám mây của Expo.', 'https://www.youtube.com/embed/wX883L6N3t8', 'https://docs.expo.dev/build/introduction/', 5),
(85, 16, 'Lập trình Kotlin Hiện đại: Coroutines, Flow & Scope Functions', 'Làm chủ cú pháp Kotlin tinh gọn, xử lý các tác vụ bất đồng bộ an toàn không block UI với Coroutines và StateFlow phản ứng.', 'https://www.youtube.com/embed/comQ1-x2a1Q', 'https://kotlinlang.org/docs/coroutines-overview.html', 1),
(86, 16, 'Giao diện Declarative với Jetpack Compose & Material 3 Theme', 'Bỏ qua XML layout truyền thống, xây dựng giao diện hoàn toàn bằng Kotlin code, State Hoisting, Recomposition và Dark Mode tự động.', 'https://www.youtube.com/embed/F2ojC6TNwws', 'https://developer.android.com/jetpack/compose', 2),
(87, 16, 'Kiến trúc MVI / MVVM và Dependency Injection với Dagger Hilt', 'Tổ chức mã nguồn theo chuẩn công nghiệp: ViewModel, Repository, Use Cases, tiêm phụ thuộc sạch sẽ với annotations của Hilt.', 'https://www.youtube.com/embed/1XbHwR_vW7k', 'https://developer.android.com/training/dependency-injection/hilt-android', 3),
(88, 16, 'Lưu trữ CSDL Cục bộ với Room Database và DataStore', 'Tạo Entities, DAOs, định nghĩa quan hệ One-to-Many trong Room, lắng nghe thay đổi dữ liệu liên tục dưới dạng Flow stream.', 'https://www.youtube.com/embed/EN6Dx22cPRI', 'https://developer.android.com/training/data-storage/room', 4),
(89, 16, 'Kiểm thử Ứng dụng Android và Tối ưu Hóa Khởi động (App Startup)', 'Viết Unit Test với MockK, Compose UI Test với TestRule và phân tích hồ sơ bộ nhớ với Android Profiler.', 'https://www.youtube.com/embed/wX883L6N3t8', 'https://developer.android.com/studio/profile', 5),
(90, 17, 'Kỹ thuật Kỹ thuật Lời nhắc (Prompt Engineering) & OpenAI API', 'Nắm vững Few-shot Prompting, Chain-of-Thought, cấu hình temperature, max_tokens và gọi Structured Output với JSON schema.', 'https://www.youtube.com/embed/rfscVS0vtbw', 'https://platform.openai.com/docs/', 1),
(91, 17, 'Xây dựng Hệ thống RAG (Hỏi đáp Tài liệu Doanh nghiệp)', 'Trích xuất văn bản từ PDF, chia nhỏ Chunking tối ưu, tính toán Vector Embeddings và lưu trữ vào Vector DB (Chroma, Pinecone).', 'https://www.youtube.com/embed/dcqPhpY7tWk', 'https://python.langchain.com/docs/use_cases/question_answering/', 2),
(92, 17, 'Tạo AI Agents Tự hành với Tool Calling & LangGraph', 'Cho phép mô hình AI tự quyết định công cụ cần sử dụng: tìm kiếm Google, truy vấn cơ sở dữ liệu và tính toán toán học phức tạp.', 'https://www.youtube.com/embed/0B5eIE_1vpU', 'https://langchain-ai.github.io/langgraph/', 3),
(93, 17, 'Fine-Tuning Mô hình Mã nguồn mở (Llama 3, Mistral) với LoRA/QLoRA', 'Chuẩn bị tập dữ liệu huấn luyện tinh chỉnh, sử dụng thư viện Hugging Face Unsloth để huấn luyện trên GPU chi phí thấp.', 'https://www.youtube.com/embed/Wqmtf9SA_kk', 'https://huggingface.co/docs/transformers/', 4),
(94, 17, 'Bảo mật Ứng dụng LLM và Đánh giá Chất lượng với Ragas', 'Phòng chống tấn công Prompt Injection, Jailbreak và đo lường độ chính xác (Faithfulness, Answer Relevance) của RAG pipeline.', 'https://www.youtube.com/embed/2_lswM1S264', 'https://docs.ragas.io/', 5),
(95, 18, 'Kiến trúc Data Lakehouse Hiện đại: Sự kết hợp Data Warehouse & Data Lake', 'Tìm hiểu kiến trúc Medallion (Bronze, Silver, Gold), ACID transactions trên tệp tin Parquet với Delta Lake và Apache Iceberg.', 'https://www.youtube.com/embed/DAQNHzOcO5A', 'https://spark.apache.org/docs/latest/', 1),
(96, 18, 'Xử lý Luồng Dữ liệu Thời gian Thực với Apache Kafka', 'Cấu trúc Producers, Consumers, Consumer Groups, Partitions và cơ chế đảm bảo Exactly-Once Semantics trong truyền thông sự kiện.', 'https://www.youtube.com/embed/e_kXz9vQ7F0', 'https://kafka.apache.org/documentation/', 2),
(97, 18, 'Tính toán Phân tán quy mô Lớn với Apache Spark & PySpark', 'Thực thi các phép biến đổi Transformations & Actions trên Resilient Distributed Datasets (RDDs) và DataFrames, tối ưu Shuffle & Memory Spill.', 'https://www.youtube.com/embed/dcqPhpY7tWk', 'https://spark.apache.org/docs/latest/api/python/', 3),
(98, 18, 'Xây dựng Luồng ETL Tự động hóa với Apache Airflow', 'Định nghĩa Directed Acyclic Graphs (DAGs) bằng Python, lập lịch chạy định kỳ, cấu hình Retry logic và thông báo cảnh báo lỗi tới Slack/Email.', 'https://www.youtube.com/embed/M988_fsOSWo', 'https://airflow.apache.org/docs/', 4),
(99, 18, 'Tối ưu hóa Chi phí và Quản trị Dữ liệu (Data Governance)', 'Giám sát chi phí lưu trữ Cloud Storage, theo dõi Data Lineage với OpenLineage và kiểm tra chất lượng dữ liệu với Great Expectations.', 'https://www.youtube.com/embed/Z3SYDTMP3ME', 'https://greatexpectations.io/', 5),
(100, 19, 'Từ Cơ bản đến Cơ chế Attention & Kiến trúc Transformer', 'Hiểu cặn kẽ Self-Attention, Multi-Head Attention, Positional Encoding và lý do Transformer vượt trội hoàn toàn so với RNN/LSTM.', 'https://www.youtube.com/embed/rfscVS0vtbw', 'https://arxiv.org/abs/1706.03762', 1),
(101, 19, 'Tokenization Hiện đại: BPE, WordPiece & Thư viện Hugging Face', 'Thực hành với thư viện tokenizers và transformers, xử lý padding, truncation, attention masks cho dữ liệu văn bản tiếng Việt và tiếng Anh.', 'https://www.youtube.com/embed/0B5eIE_1vpU', 'https://huggingface.co/docs/transformers/tokenizer_summary', 2),
(102, 19, 'Phân loại Cảm xúc Văn bản (Sentiment Analysis) với PhoBERT', 'Fine-tune mô hình PhoBERT tiền huấn luyện dành riêng cho tiếng Việt để phân loại đánh giá bình luận khách hàng tích cực/tiêu cực.', 'https://www.youtube.com/embed/Wqmtf9SA_kk', 'https://github.com/VinAIResearch/PhoBERT', 3),
(103, 19, 'Nhận diện Thực thể có Tên (Named Entity Recognition - NER)', 'Xây dựng mô hình tự động trích xuất tên người, địa điểm, tổ chức, ngày tháng từ văn bản hợp đồng pháp lý.', 'https://www.youtube.com/embed/dcqPhpY7tWk', 'https://spacy.io/usage/linguistic-features#named-entities', 4),
(104, 19, 'Tóm tắt Văn bản Tự động với BART và T5 Encoder-Decoder', 'Huấn luyện và đánh giá mô hình tóm tắt bài báo bằng điểm ROUGE score, tối ưu tốc độ sinh từ bằng Beam Search.', 'https://www.youtube.com/embed/DAQNHzOcO5A', 'https://huggingface.co/docs/transformers/model_doc/bart', 5),
(105, 20, 'Nguyên lý CI/CD và Thiết lập Pipeline đầu tiên với GitHub Actions', 'Cấu trúc Workflows, Triggers, Jobs, Steps, Runners và quản lý biến bí mật an toàn với GitHub Secrets.', 'https://www.youtube.com/embed/n4p_O10v7p4', 'https://docs.github.com/en/actions', 1),
(106, 20, 'Tự động Hóa Kiểm thử Đơn vị & Quét Mã Tĩnh (SAST / SonarQube)', 'Chặn đứng lỗi code từ sớm: tích hợp linter, format check, unit test và đo lường mã độc với SonarCloud trước khi cho phép Merge Request.', 'https://www.youtube.com/embed/7H_QH9nipNs', 'https://www.sonarsource.com/products/sonarqube/', 2),
(107, 20, 'Tối ưu hóa Build Docker Image & Quét Lỗ Hổng Bảo Mật Container', 'Multi-stage build giúp giảm kích thước image từ 1GB xuống dưới 50MB, quét lỗ hổng CVE với Trivy trước khi push lên Docker Hub.', 'https://www.youtube.com/embed/EN6Dx22cPRI', 'https://aquasecurity.github.io/trivy/', 3),
(108, 20, 'Chiến lược Triển khai Hiện đại: Rolling, Blue-Green & Canary Deployments', 'So sánh các chiến thuật cập nhật phiên bản mới, giảm thiểu rủi ro sự cố và kỹ thuật rollback tức thời khi phát hiện lỗi.', 'https://www.youtube.com/embed/M988_fsOSWo', 'https://martinfowler.com/bliki/BlueGreenDeployment.html', 4),
(109, 20, 'Xây dựng Pipeline CI/CD phức tạp nhiều môi trường (Dev, Staging, Prod)', 'Phê duyệt triển khai thủ công (Manual Approval Gate), thông báo trạng thái deployment qua Slack/Telegram Webhooks.', 'https://www.youtube.com/embed/Z3SYDTMP3ME', 'https://docs.gitlab.com/ee/ci/', 5),
(110, 21, 'Kiến trúc Cụm Kubernetes: Control Plane, Worker Nodes & Networking', 'Hiểu sâu về kube-apiserver, etcd, kube-scheduler, kube-proxy, CNI plugins và cơ chế phân giải DNS CoreDNS bên trong cụm.', 'https://www.youtube.com/embed/6XvQy5w4Fjo', 'https://kubernetes.io/docs/concepts/', 1),
(111, 21, 'Đóng gói Ứng dụng K8s với Helm Charts & Kustomize', 'Quản lý cấu hình nhiều môi trường linh hoạt, định nghĩa template manifests, versioning và quản lý phụ thuộc Helm sub-charts.', 'https://www.youtube.com/embed/qUvLh0qK_L4', 'https://helm.sh/docs/', 2),
(112, 21, 'Triển khai Tự Động Hóa theo Mô Hình GitOps với ArgoCD', 'Biến Git thành nguồn chân lý duy nhất (Single Source of Truth), ArgoCD tự động phát hiện lệch lạc cấu hình và đồng bộ tức thì.', 'https://www.youtube.com/embed/n4p_O10v7p4', 'https://argo-cd.readthedocs.io/', 3),
(113, 21, 'Tự Động Co Giãn Tải (HPA, VPA) & Quản Lý Tài Nguyên Cluster', 'Thiết lập Requests & Limits, cấu hình Horizontal Pod Autoscaler dựa trên CPU, Memory và Custom Metrics (Requests per second).', 'https://www.youtube.com/embed/M988_fsOSWo', 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/', 4),
(114, 21, 'Giám Sát Toàn Diện Hệ Thống với Prometheus, Grafana & Loki', 'Cài đặt Prometheus Operator, thu thập metrics ứng dụng, thiết kế Dashboard giám sát trên Grafana và cảnh báo Alertmanager.', 'https://www.youtube.com/embed/Z3SYDTMP3ME', 'https://prometheus.io/docs/introduction/overview/', 5),
(115, 22, 'Nền tảng Terraform: HCL Syntax, Providers & Quản lý State File', 'Tìm hiểu vòng đời terraform init, plan, apply, destroy và tầm quan trọng của việc lưu trữ Remote State trên AWS S3 với DynamoDB Lock.', 'https://www.youtube.com/embed/M988_fsOSWo', 'https://developer.hashicorp.com/terraform/docs', 1),
(116, 22, 'Xây dựng Mạng Virtual Private Cloud (VPC) Chuẩn Production trên AWS', 'Định nghĩa Public Subnets, Private Subnets, Internet Gateway, NAT Gateway và Route Tables tách biệt an toàn.', 'https://www.youtube.com/embed/Z3SYDTMP3ME', 'https://registry.terraform.io/providers/hashicorp/aws/latest/docs', 2),
(117, 22, 'Tổ chức Mã nguồn Tái sử dụng với Terraform Modules', 'Viết module chuẩn cho EC2 Instance, RDS Database, ALB Load Balancer với các biến Input Variables và Outputs rõ ràng.', 'https://www.youtube.com/embed/e_kXz9vQ7F0', 'https://developer.hashicorp.com/terraform/language/modules', 3),
(118, 22, 'Kiểm thử Hạ tầng và Quản lý Secrets với HashiCorp Vault', 'Tích hợp tfsec quét lỗ hổng bảo mật hạ tầng và sử dụng HashiCorp Vault để cấp phát thông tin đăng nhập tự động.', 'https://www.youtube.com/embed/EN6Dx22cPRI', 'https://aquasecurity.github.io/tfsec/', 4),
(119, 22, 'Tự động hóa Terraform trong CI/CD Pipeline (Terraform Cloud & Atlantis)', 'Cấu hình Atlantis tự động chạy terraform plan và bình luận kết quả trực tiếp lên Pull Request của GitHub/GitLab.', 'https://www.youtube.com/embed/n4p_O10v7p4', 'https://www.runatlantis.io/', 5),
(120, 23, 'Nguyên lý Atomic Design & Cấu trúc Thư viện Thiết kế', 'Phân cấp Atoms, Molecules, Organisms, Templates và Pages để xây dựng hệ thống giao diện nhất quán cho toàn bộ công ty.', 'https://www.youtube.com/embed/c9Wg6Cb_YlU', 'https://atomicdesign.bradfrost.com/', 1),
(121, 23, 'Làm chủ Design Tokens & Biến Figma Variables (Color, Spacing, Typography)', 'Tạo biến số Theme Mode (Light / Dark), Responsive Breakpoint tokens giúp đồng bộ hóa trực tiếp với lập trình viên Frontend.', 'https://www.youtube.com/embed/FTFaQWZBqQ8', 'https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma', 2),
(122, 23, 'Auto-Layout Nâng Cao, Min/Max Width và Component Properties', 'Thiết kế card, form, navbar tự động co giãn thông minh thích ứng mọi kích thước màn hình mà không bị méo lệch giao diện.', 'https://www.youtube.com/embed/c9Wg6Cb_YlU', 'https://help.figma.com/hc/en-us/articles/360040451373-Explore-autolayout-properties', 3),
(123, 23, 'Micro-interactions & Interactive Components với Smart Animate', 'Tạo các tương tác vi mô tinh tế: Button hover, Toggle switch, Animated loader, Dropdown accordion với đường cong Bézier mượt mà.', 'https://www.youtube.com/embed/FTFaQWZBqQ8', 'https://help.figma.com/hc/en-us/articles/360039818874-Create-smart-animations', 4),
(124, 23, 'Quy trình Bàn giao Thiết kế (Design Handoff) & Figma to Code', 'Sử dụng Figma Dev Mode, gắn nhãn tài nguyên, xuất icon SVG tối ưu và tài liệu hóa quy chuẩn cho đội ngũ Frontend.', 'https://www.youtube.com/embed/c9Wg6Cb_YlU', 'https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode', 5),
(125, 24, 'Chân dung Product Manager Hiện đại & Vòng đời Sản phẩm (Product Life Cycle)', 'Vai trò của PM ở giao điểm giữa Công nghệ, Kinh doanh và Người dùng; phương pháp nhận diện vấn đề thực sự của thị trường.', 'https://www.youtube.com/embed/c9Wg6Cb_YlU', 'https://www.mindtheproduct.com/', 1),
(126, 24, 'Nghiên cứu Người dùng (User Research) & Phỏng vấn Khám phá Sản phẩm', 'Kỹ thuật đặt câu hỏi phỏng vấn theo phương pháp The Mom Test, xây dựng Persona và bản đồ hành trình người dùng (User Journey Map).', 'https://www.youtube.com/embed/FTFaQWZBqQ8', 'https://www.nngroup.com/articles/user-journey-mapping/', 2),
(127, 24, 'Ưu tiên Tính năng Sản phẩm: RICE, Kano & MoSCoW Frameworks', 'Cách thức định lượng điểm ưu tiên giữa hàng trăm yêu cầu tính năng từ khách hàng, ban giám đốc và đội ngũ kinh doanh.', 'https://www.youtube.com/embed/c9Wg6Cb_YlU', 'https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/', 3),
(128, 24, 'Xây dựng Product Requirements Document (PRD) & User Stories Chuẩn', 'Soạn thảo tài liệu đặc tả yêu cầu sản phẩm súc tích, viết User Stories và tiêu chí nghiệm thu Acceptance Criteria rõ ràng cho kỹ sư.', 'https://www.youtube.com/embed/FTFaQWZBqQ8', 'https://productschool.com/blog/product-management-2/product-requirements-document-prd', 4),
(129, 24, 'Đo lường Thành công với Chỉ số North Star, Churn Rate & A/B Testing', 'Thiết lập phễu chuyển đổi (Conversion Funnel), chỉ số giữ chân người dùng (Retention Cohort) và đưa ra quyết định dựa trên dữ liệu số.', 'https://www.youtube.com/embed/DAQNHzOcO5A', 'https://amplitude.com/north-star', 5),
(130, 25, 'Thu thập Thông tin Mục tiêu (Reconnaissance & OSINT)', 'Sử dụng Sublist3r, Amass, Shodan, Nmap để quét mở rộng bề mặt tấn công, phát hiện cổng mở và phiên bản phần mềm nhạy cảm.', 'https://www.youtube.com/embed/2_lswM1S264', 'https://owasp.org/www-project-web-security-testing-guide/', 1),
(131, 25, 'Khai thác Lỗ hổng Logic Nghiệp vụ & IDOR (Insecure Direct Object Reference)', 'Phát hiện lỗ hổng phân quyền chiều ngang (Horizontal Privilege Escalation) và chiều dọc (Vertical) qua thao tác API requests.', 'https://www.youtube.com/embed/bW8y_1wYx78', 'https://portswigger.net/web-security/access-control', 2),
(132, 25, 'Tấn công Phía Máy chủ: SSRF, RCE và File Upload Vulnerabilities', 'Kỹ thuật khai thác Server-Side Request Forgery để truy cập tài nguyên nội bộ Cloud Metadata (169.254.169.254) và chiếm quyền shell máy chủ.', 'https://www.youtube.com/embed/2_lswM1S264', 'https://portswigger.net/web-security/ssrf', 3),
(133, 25, 'Bảo mật API & Khai thác Lỗ hổng JWT Token (Algorithm Confusion)', 'Thử nghiệm giả mạo token với None algorithm, bẻ khóa bí mật JWT yếu và tấn công đánh cắp phiên làm việc.', 'https://www.youtube.com/embed/mbsmsi7l3r4', 'https://portswigger.net/web-security/jwt', 4),
(134, 25, 'Viết Báo cáo Lỗ hổng Tiêu chuẩn CVSS v3 và Biện pháp Khắc phục', 'Soạn thảo báo cáo kiểm thử bảo mật chuyên nghiệp theo chuẩn quốc tế, đánh giá rủi ro kinh doanh và hướng dẫn lập trình viên sửa code an toàn.', 'https://www.youtube.com/embed/2_lswM1S264', 'https://www.first.org/cvss/', 5),
(135, 26, 'Tổng quan Vận hành Trung tâm Điều hành An ninh Mạng (SOC)', 'Cấu trúc các tầng Tier 1 Triage, Tier 2 Incident Response, Tier 3 Threat Hunting; ma trận MITRE ATT&CK và quy trình xử lý sự cố NIST.', 'https://www.youtube.com/embed/2_lswM1S264', 'https://attack.mitre.org/', 1),
(136, 26, 'Truy vấn & Phân tích Nhật ký (Log Analysis) với Splunk / Elastic SIEM', 'Viết câu lệnh SPL (Search Processing Language) để phát hiện hành vi Brute Force, tấn công dò quét cổng và truy cập cơ sở dữ liệu bất thường.', 'https://www.youtube.com/embed/bW8y_1wYx78', 'https://docs.splunk.com/', 2),
(137, 26, 'Phân tích Giao thức Mạng với Wireshark & Network Forensics', 'Phát hiện mã độc giao tiếp với máy chủ chỉ huy (C2 Server), phân tích luồng dữ liệu DNS Tunneling và trích xuất tệp tin độc hại từ file PCAP.', 'https://www.youtube.com/embed/2_lswM1S264', 'https://www.wireshark.org/docs/', 3),
(138, 26, 'Phân tích Mã độc Cơ bản (Static & Dynamic Malware Analysis)', 'Sử dụng môi trường Sandbox cách ly an toàn, phân tích mã hash, strings, pe-headers và quan sát hành vi thay đổi Registry / File System.', 'https://www.youtube.com/embed/2_lswM1S264', 'https://any.run/', 4),
(139, 26, 'Quy trình Ứng phó Sự cố (Incident Handling) & Cách ly Độc quyền', 'Cách ly máy chủ nhiễm độc khỏi mạng nội bộ, thu thập bằng chứng RAM dump, phục hồi dữ liệu từ bản sao lưu và tổng kết bài học kinh nghiệm.', 'https://www.youtube.com/embed/bW8y_1wYx78', 'https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final', 5);

-- 5. Assignments (53 Assignments)
INSERT INTO `assignments` (`id`, `course_id`, `title`, `description`, `due_date`) VALUES
(1, 1, 'Bài tập 1: Xây dựng ứng dụng Todo với React Hooks', 'Create a responsive React application with state management.', '2026-10-15 09:59:00'),
(4, 1, 'Bài tập 3: Xây dựng Hệ thống Xác thực JWT và Phân quyền Role trên Express', 'Hoàn thiện luồng đăng ký, đăng nhập với mật khẩu mã hóa bcrypt, sinh JWT token và middleware bảo vệ router theo role học viên và giáo viên.', '2026-11-12 16:59:59'),
(2, 2, 'Bài tập 2: Thiết kế REST API Backend với Express & MySQL', 'Perform EDA on the provided dataset using Pandas and Matplotlib.', '2026-10-20 16:59:59'),
(3, 2, 'Bài tập 1: Phân tích dữ liệu thực tế bằng Pandas', 'Thực hiện làm sạch dữ liệu và thống kê các chỉ số quan trọng từ dataset được giao.', '2026-10-30 16:59:59'),
(5, 2, 'Bài tập 3: Xây dựng Mô hình Phân loại Khách hàng Tiềm năng với Scikit-Learn', 'Sử dụng thuật toán Random Forest Classifier để dự đoán tỷ lệ rời bỏ (Churn Rate) của người dùng từ tập dữ liệu viễn thông.', '2026-11-15 16:59:59'),
(6, 3, 'Bài tập 1: Thiết kế Giao diện Ứng dụng Thời tiết Đẹp mắt với SwiftUI', 'Xây dựng layout hiển thị dự báo thời tiết 7 ngày với hiệu ứng nền Gradient, custom SF Symbols và hỗ trợ màn hình ngang/dọc.', '2026-11-04 16:59:59'),
(7, 3, 'Bài tập 2: Tích hợp API OpenWeatherMap với URLSession và Async/Await', 'Gọi API thời tiết theo vị trí người dùng, parse JSON vào Swift Codable struct và hiển thị dữ liệu nhiệt độ, độ ẩm theo thời gian thực.', '2026-11-18 16:59:59'),
(8, 4, 'Bài tập 1: Khởi tạo Máy ảo EC2 Linux và Cấu hình Máy chủ NGINX', 'Tạo máy ảo Ubuntu trên AWS EC2, mở cổng 80/443 trong Security Group, cài đặt NGINX và cấu hình trỏ tên miền về máy ảo.', '2026-11-06 16:59:59'),
(9, 4, 'Bài tập 2: Lưu trữ và Phân phối Tệp Tĩnh với AWS S3 Bucket & CloudFront', 'Tạo S3 bucket bảo mật không công khai trực tiếp, kết nối CloudFront CDN và thiết lập chứng chỉ SSL miễn phí từ AWS Certificate Manager.', '2026-11-20 16:59:59'),
(10, 5, 'Bài tập 1: Xây dựng Bảng Màu và Hệ thống Typography trong Figma', 'Tạo bảng màu Semantic Colors (Primary, Secondary, Success, Warning, Error) và cấp bậc phông chữ từ Heading 1 đến Body Caption.', '2026-11-08 16:59:59'),
(11, 5, 'Bài tập 2: Thiết kế Prototype Ứng dụng Đặt Món Ăn Hoàn Chỉnh', 'Dựng wireframe và visual design cho 4 màn hình: Trang chủ, Danh mục món ăn, Chi tiết món và Thanh toán với Auto-Layout.', '2026-11-22 16:59:59'),
(12, 6, 'Bài tập 1: Đóng gói Ứng dụng Web Đa Dịch vụ với Docker Compose', 'Viết docker-compose.yml khởi chạy đồng thời Node.js app, MySQL database và Redis cache, thiết lập Network và Volume lưu trữ bền vững.', '2026-11-09 16:59:59'),
(13, 6, 'Bài tập 2: Triển khai Ứng dụng lên Cụm Kubernetes Cục bộ (Minikube / K3s)', 'Viết Kubernetes Deployment, Service ClusterIP, Ingress manifest và cấu hình ConfigMap / Secret an toàn.', '2026-11-23 16:59:59'),
(14, 7, 'Bài tập 1: Tối ưu Render và Xử lý Trạng thái Lớn với React DevTools Profiler', 'Xác định các component bị re-render dư thừa trong danh sách 10,000 phần tử và áp dụng React.memo, useMemo, useCallback tối ưu về 60 FPS.', '2026-11-11 16:59:59'),
(15, 7, 'Bài tập 2: Xây dựng Thư viện Custom Hooks Quản lý Dữ liệu Bất đồng bộ', 'Tự viết hook useFetchData hỗ trợ caching, retry tự động khi rớt mạng, debounce tìm kiếm và abort controller hủy request cũ.', '2026-11-25 16:59:59'),
(16, 8, 'Bài tập 1: Xây dựng Mạng CNN Phân loại Ảnh Chó và Mèo', 'Sử dụng PyTorch xây dựng kiến trúc mạng tích chập gồm Conv2d, BatchNorm, MaxPool2d, huấn luyện trên tập dữ liệu và đạt accuracy trên 90%.', '2026-11-13 16:59:59'),
(17, 8, 'Bài tập 2: Áp dụng Transfer Learning với ResNet-50 cho Nhận diện Hoa Quả', 'Tận dụng trọng số tiền huấn luyện của ResNet-50, tinh chỉnh tầng fully connected cuối cùng và đánh giá bằng F1-score.', '2026-11-27 16:59:59'),
(18, 9, 'Bài tập 1: Phát hiện và Khai thác Lỗ hổng SQL Injection trên Môi trường Lab', 'Sử dụng SQLMap và thao tác thủ công để khai thác lỗ hổng Blind SQL Injection, trích xuất cấu trúc cơ sở dữ liệu mẫu trong lab an toàn.', '2026-11-14 16:59:59'),
(19, 9, 'Bài tập 2: Phòng thủ Toàn diện Chống Lỗ hổng Cross-Site Scripting (XSS)', 'Phân tích mã nguồn bị hổng Stored XSS, áp dụng Content Security Policy (CSP) chặt chẽ và cơ chế làm sạch HTML (DOMPurify) để khắc phục.', '2026-11-28 16:59:59'),
(20, 10, 'Bài tập 1: Xây dựng Blog tĩnh động với Next.js 15 App Router', 'Tạo ứng dụng Blog đọc tin từ API hoặc Markdown, áp dụng Dynamic Routes, Static Generation và generateMetadata chuẩn SEO.', '2026-11-01 16:59:59'),
(21, 10, 'Bài tập 2: Xây dựng Dashboard Quản lý với Server Actions & NextAuth', 'Phát triển trang quản trị người dùng có đăng nhập, bảo vệ tuyến đường với Middleware và form thêm sửa xóa sử dụng Server Actions.', '2026-11-15 16:59:59'),
(22, 11, 'Bài tập 1: Xây dựng Dịch vụ Quản lý Sản phẩm RESTful với Gin & Go', 'Tạo REST API quản lý kho hàng với Gin framework, xác thực request validation, kết nối MySQL và xử lý graceful shutdown.', '2026-11-10 16:59:59'),
(23, 11, 'Bài tập 2: Triển khai Microservice giao tiếp bằng gRPC Protocol', 'Xây dựng 2 microservices: Order Service và Payment Service giao tiếp thông qua gRPC với protocol buffers definitions.', '2026-11-25 16:59:59'),
(24, 12, 'Bài tập 1: Xây dựng Ứng dụng E-Commerce Mini với Vue 3 & Pinia', 'Tạo giao diện hiển thị danh sách sản phẩm, bộ lọc danh mục, giỏ hàng lưu vào Pinia Store và tính toán tổng tiền thanh toán.', '2026-11-08 16:59:59'),
(25, 12, 'Bài tập 2: Xây dựng Dashboard Quản trị tương tác cao với Vue Router', 'Xây dựng trang Dashboard quản lý tài khoản, tích hợp biểu đồ số liệu và các Navigation Guards kiểm tra quyền truy cập.', '2026-11-20 16:59:59'),
(26, 13, 'Bài tập 1: Khắc phục sự cố Slow Query trên Bảng 1 Triệu Bản Ghi', 'Sử dụng EXPLAIN để xác định nguyên nhân truy vấn chạy chậm hơn 3 giây và thiết kế chỉ mục phù hợp đưa thời gian về dưới 20ms.', '2026-11-05 16:59:59'),
(27, 13, 'Bài tập 2: Thiết kế Kiến trúc Cơ sở dữ liệu E-Commerce phân vùng', 'Tạo sơ đồ quan hệ schema hoàn chỉnh, phân vùng bảng đơn hàng theo năm/tháng và thiết lập Redis Caching tầng truy vấn.', '2026-11-18 16:59:59'),
(28, 14, 'Bài tập 1: Xây dựng App Tin Tức Đa Chuyên Mục với Flutter & Bloc', 'Tạo ứng dụng đọc tin tức lấy dữ liệu từ NewsAPI công khai, quản lý trạng thái loading, error, success bằng Bloc/Cubit.', '2026-11-12 16:59:59'),
(29, 14, 'Bài tập 2: Tích hợp Đăng nhập Firebase và Lưu Trữ Dữ liệu Offline', 'Triển khai tính năng đăng ký/đăng nhập qua Firebase Authentication và lưu danh sách bài viết yêu thích vào CSDL cục bộ Hive.', '2026-11-28 16:59:59'),
(30, 15, 'Bài tập 1: Xây dựng Ứng dụng Quản lý Chi tiêu Cá nhân với Expo', 'Tạo ứng dụng ghi chép thu chi hàng ngày, hỗ trợ bộ lọc theo ngày tháng và biểu đồ thống kê trực quan bằng React Native Chart.', '2026-11-14 16:59:59'),
(31, 15, 'Bài tập 2: Tích hợp Quét mã QR và Đăng ảnh với Camera Device', 'Tạo màn hình quét vé điện tử với Camera API và màn hình tải ảnh hồ sơ từ Thư viện ảnh của điện thoại.', '2026-11-26 16:59:59'),
(32, 16, 'Bài tập 1: Xây dựng Giao diện Danh sách Liên hệ với Jetpack Compose', 'Tạo màn hình danh bạ hỗ trợ tìm kiếm theo tên, cuộn danh sách mượt mà với LazyColumn và hiệu ứng hiển thị Material 3.', '2026-11-16 16:59:59'),
(33, 16, 'Bài tập 2: Tích hợp Room Database lưu trữ ghi chú cá nhân', 'Xây dựng ứng dụng Notes hoàn chỉnh với CRUD, lưu dữ liệu vào SQLite thông qua Room và truyền state về Compose qua ViewModel.', '2026-11-30 16:59:59'),
(34, 17, 'Bài tập 1: Xây dựng Chatbot Q&A Tài liệu PDF với LangChain & Vector Store', 'Tạo ứng dụng cho phép người dùng tải lên file tài liệu PDF hướng dẫn sử dụng và đặt câu hỏi để AI trả lời có trích dẫn nguồn.', '2026-11-18 16:59:59'),
(35, 17, 'Bài tập 2: Xây dựng AI Agent có khả năng tra cứu thời tiết và tính toán', 'Sử dụng LangChain Tools để trang bị cho mô hình khả năng gọi API thời tiết thực tế và máy tính giải toán.', '2026-12-02 16:59:59'),
(36, 18, 'Bài tập 1: Xây dựng Pipeline Truyền Tin Real-time bằng Kafka & Python', 'Tạo ứng dụng producer giả lập gửi dữ liệu giao dịch tài chính liên tục vào Kafka Topic và consumer tổng hợp số liệu theo phút.', '2026-11-20 16:59:59'),
(37, 18, 'Bài tập 2: Lập lịch và Tự động hóa luồng ETL dữ liệu với Apache Airflow', 'Thiết kế DAG Airflow tự động kéo dữ liệu từ CSDL, chuyển đổi làm sạch và xuất báo cáo hàng ngày.', '2026-12-05 16:59:59'),
(38, 19, 'Bài tập 1: Xây dựng Mô hình Phân loại Đánh giá Sản phẩm với Hugging Face', 'Sử dụng mô hình Transformer có sẵn để phân loại 5,000 nhận xét của người dùng thành 3 cấp độ hài lòng với độ chính xác trên 88%.', '2026-11-22 16:59:59'),
(39, 19, 'Bài tập 2: Trích xuất Thông tin Thực thể từ Hồ sơ Ứng viên (CV Parser)', 'Xây dựng pipeline NER trích xuất kỹ năng, năm kinh nghiệm và trường đại học từ văn bản tóm tắt hồ sơ xin việc.', '2026-12-08 16:59:59'),
(40, 20, 'Bài tập 1: Xây dựng GitHub Actions Pipeline kiểm thử và đóng gói Docker', 'Tạo workflow kích hoạt khi có Pull Request, chạy kiểm thử tự động, build Docker image và gắn thẻ phiên bản theo semantic version.', '2026-11-25 16:59:59'),
(41, 20, 'Bài tập 2: Thiết lập Tự động Triển khai Blue-Green trên máy chủ Cloud', 'Cấu hình kịch bản triển khai không downtime với NGINX reverse proxy chuyển hướng traffic giữa hai phiên bản container.', '2026-12-10 16:59:59'),
(42, 21, 'Bài tập 1: Viết Helm Chart hoàn chỉnh cho ứng dụng Full-Stack 3 Tầng', 'Tạo Helm chart gồm Frontend, Backend và CSDL MySQL với các file values dev và prod riêng biệt.', '2026-11-27 16:59:59'),
(43, 21, 'Bài tập 2: Cấu hình Tự động Đồng bộ Ứng dụng K8s bằng ArgoCD', 'Kết nối ArgoCD với kho lưu trữ Git chứa Helm manifests và kiểm tra tính năng tự khôi phục khi có thay đổi cấu hình thủ công.', '2026-12-12 16:59:59'),
(44, 22, 'Bài tập 1: Xây dựng Module Terraform khởi tạo Máy chủ Web có Load Balancer', 'Tạo mã Terraform dựng Application Load Balancer trỏ về nhóm máy chủ EC2 tự động phân phối tải.', '2026-11-29 16:59:59'),
(45, 22, 'Bài tập 2: Thiết lập Remote State S3 an toàn có mã hóa và khóa DynamoDB', 'Cấu hình backend S3 với KMS encryption và DynamoDB table để chống xung đột ghi đè state đồng thời giữa nhiều kỹ sư.', '2026-12-15 16:59:59'),
(46, 23, 'Bài tập 1: Xây dựng Thư viện Component Input & Button với Variants', 'Tạo component Button và Input đầy đủ các trạng thái (Default, Hover, Active, Disabled, Error) sử dụng Figma Variables.', '2026-11-10 16:59:59'),
(47, 23, 'Bài tập 2: Thiết kế Prototype Tương Tác Giỏ Hàng với Smart Animate', 'Tạo nguyên mẫu di động có hiệu ứng thêm sản phẩm vào giỏ, mở drawer cart và chuyển đổi số lượng mượt mà.', '2026-11-24 16:59:59'),
(48, 24, 'Bài tập 1: Soạn thảo Tài liệu PRD cho Tính năng Chia sẻ Đơn hàng Nhóm', 'Viết tài liệu PRD hoàn chỉnh gồm: bối cảnh thị trường, mục tiêu kinh doanh, User Persona, danh sách User Stories và rủi ro kỹ thuật.', '2026-11-15 16:59:59'),
(49, 24, 'Bài tập 2: Phân tích Chỉ số Phễu Chuyển đổi và Đề xuất Thử nghiệm A/B', 'Dựa trên tập dữ liệu số liệu người dùng bỏ rơi giỏ hàng, phân tích nguyên nhân và thiết kế thử nghiệm A/B để cải thiện tỷ lệ mua.', '2026-12-01 16:59:59'),
(50, 25, 'Bài tập 1: Khai thác và Vá Lỗ hổng IDOR trên Hệ thống Demo', 'Tìm kiếm điểm yếu trong API cập nhật thông tin tài khoản, khai thác đọc dữ liệu người dùng khác và viết đoạn code middleware sửa lỗi.', '2026-11-19 16:59:59'),
(51, 25, 'Bài tập 2: Thực hiện Đánh giá Toàn diện Ứng dụng Web theo Chuẩn OWASP', 'Sử dụng Burp Suite để rà quét và viết báo cáo kiểm thử an toàn thông tin gồm tối thiểu 3 lỗ hổng bảo mật tìm được.', '2026-12-06 16:59:59'),
(52, 26, 'Bài tập 1: Phân tích File PCAP truy bắt Hành vi C2 Communication', 'Mở file nhật ký mạng trong Wireshark, xác định địa chỉ IP máy nạn nhân, tên miền C2 độc hại và giao thức truyền tải.', '2026-11-21 16:59:59'),
(53, 26, 'Bài tập 2: Xây dựng Quy tắc Cảnh báo (Alert Rule) trên Splunk SIEM', 'Viết truy vấn SPL phát hiện ít nhất 5 lần đăng nhập SSH thất bại liên tiếp sau đó đăng nhập thành công trong vòng 2 phút.', '2026-12-10 16:59:59');

-- 6. Enrollments
INSERT INTO `enrollments` (`user_id`, `course_id`, `status`) VALUES
(1, 1, 'active'),
(1, 2, 'active'),
(2, 1, 'active'),
(2, 3, 'completed'),
(1, 1, 'active'),
(1, 2, 'active'),
(1, 4, 'completed'),
(2, 1, 'active'),
(2, 2, 'completed'),
(2, 3, 'active'),
(12, 4, 'active'),
(12, 6, 'active'),
(13, 5, 'active'),
(5, 3, 'completed'),
(5, 5, 'active'),
(3, 5, 'active'),
(3, 2, 'active'),
(1, 6, 'active'),
(12, 1, 'active'),
(2, 4, 'active'),
(2, 6, 'active'),
(1, 9, 'active'),
(2, 9, 'active'),
(12, 9, 'active'),
(1, 10, 'active'),
(2, 10, 'active'),
(12, 10, 'active'),
(1, 11, 'active'),
(2, 11, 'active'),
(12, 11, 'active'),
(1, 13, 'active'),
(2, 13, 'active'),
(12, 13, 'active'),
(12, 2, 'active'),
(1, 7, 'active'),
(2, 7, 'active'),
(12, 7, 'active'),
(1, 8, 'active'),
(2, 8, 'active'),
(12, 8, 'active'),
(1, 17, 'active'),
(2, 17, 'active'),
(12, 17, 'active'),
(1, 18, 'active'),
(2, 18, 'active'),
(12, 18, 'active'),
(1, 19, 'active'),
(2, 19, 'active'),
(12, 19, 'active'),
(1, 3, 'active'),
(12, 3, 'active'),
(1, 5, 'active'),
(2, 5, 'active'),
(12, 5, 'active'),
(1, 12, 'active'),
(2, 12, 'active'),
(12, 12, 'active'),
(1, 15, 'active'),
(2, 15, 'active'),
(12, 15, 'active'),
(1, 14, 'active'),
(2, 14, 'active'),
(12, 14, 'active'),
(1, 16, 'active'),
(2, 16, 'active'),
(12, 16, 'active'),
(1, 20, 'active'),
(2, 20, 'active'),
(12, 20, 'active'),
(1, 21, 'active'),
(2, 21, 'active'),
(12, 21, 'active'),
(1, 22, 'active'),
(2, 22, 'active'),
(12, 22, 'active'),
(1, 23, 'active'),
(2, 23, 'active'),
(12, 23, 'active'),
(1, 24, 'active'),
(2, 24, 'active'),
(12, 24, 'active'),
(1, 25, 'active'),
(2, 25, 'active'),
(12, 25, 'active'),
(1, 26, 'active'),
(2, 26, 'active'),
(12, 26, 'active');

-- 7. Reviews
INSERT INTO `reviews` (`user_id`, `course_id`, `rating`, `review`) VALUES
(1, 1, 5, 'Khóa học cực kỳ chi tiết và dễ hiểu! Giảng viên nhiệt tình, bài tập thực chiến giúp mình tự tin phỏng vấn frontend.'),
(2, 2, 5, 'Nội dung Python và Data Science giải thích rất trực quan. Các bài thực hành phân tích dữ liệu rất thực tế.'),
(2, 1, 4, 'Rất hữu ích, học được nhiều best practice về React 18.'),
(1, 6, 5, 'hay qua nhe');

-- 8. Notifications
INSERT INTO `notifications` (`user_id`, `title`, `message`, `is_read`) VALUES
(1, 'Chào mừng bạn đến với E-Learning Platform', 'Khám phá hàng chục khóa học chất lượng cao và bắt đầu lộ trình học tập của bạn ngay hôm nay!', 0),
(1, 'Bài tập đã được chấm điểm', 'Giáo viên Dr. Alex Morgan đã chấm bài tập "Xây dựng ứng dụng Todo với React Hooks" của bạn: 95/100.', 0),
(5, 'Ghi danh thành công!', 'Bạn đã ghi danh thành công khóa học "iOS & Swift Bootcamp for Beginners". Hãy bắt đầu học ngay bây giờ!', 1),
(5, 'Chúc mừng bạn đã hoàn thành khóa học! 🎓', 'Bạn đã hoàn thành 100% tất cả các bài học trong khóa học "iOS & Swift Bootcamp for Beginners". Xin chúc mừng thành tích tuyệt vời của bạn!', 1),
(5, 'Ghi danh thành công!', 'Bạn đã ghi danh thành công khóa học "Modern UI/UX Design with Figma: Wireframe to Prototype". Hãy bắt đầu học ngay bây giờ!', 1),
(3, 'Ghi danh thành công!', 'Bạn đã ghi danh thành công khóa học "Modern UI/UX Design with Figma: Wireframe to Prototype". Hãy bắt đầu học ngay bây giờ!', 0),
(3, 'Ghi danh thành công!', 'Bạn đã ghi danh thành công khóa học "Python for Data Science and Machine Learning". Hãy bắt đầu học ngay bây giờ!', 0),
(1, 'Ghi danh thành công!', 'Bạn đã ghi danh thành công khóa học "Docker & Kubernetes: Practical Containerization". Hãy bắt đầu học ngay bây giờ!', 0);

