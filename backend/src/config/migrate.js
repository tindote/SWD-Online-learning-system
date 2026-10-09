const db = require('./db');
const bcrypt = require('bcryptjs');

async function migrateAndSeed() {
  console.log('--- Starting Database Migration & Seed ---');
  const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);

  try {
    // 1. Alter or Create tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL DEFAULT '',
        role VARCHAR(50) NOT NULL DEFAULT 'student',
        avatar VARCHAR(255) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure users columns exist if table was already created
    const [userCols] = await db.query('DESCRIBE users');
    const userColNames = userCols.map(c => c.Field);
    if (!userColNames.includes('password')) {
      await db.query("ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '' AFTER email");
    }
    if (!userColNames.includes('avatar')) {
      await db.query("ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL AFTER role");
    }
    if (!userColNames.includes('bio')) {
      await db.query("ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL AFTER avatar");
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        instructor VARCHAR(255) NOT NULL,
        instructor_id INT NULL,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        category VARCHAR(100) NOT NULL,
        thumbnail VARCHAR(500) DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_courses_instructor FOREIGN KEY (instructor_id) REFERENCES users (id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure courses columns exist
    const [courseCols] = await db.query('DESCRIBE courses');
    const courseColNames = courseCols.map(c => c.Field);
    if (!courseColNames.includes('instructor_id')) {
      await db.query("ALTER TABLE courses ADD COLUMN instructor_id INT NULL AFTER instructor");
      try {
        await db.query("ALTER TABLE courses ADD CONSTRAINT fk_courses_instructor FOREIGN KEY (instructor_id) REFERENCES users (id) ON DELETE SET NULL");
      } catch (e) {
        // Constraint might already exist
      }
    }
    if (!courseColNames.includes('thumbnail')) {
      await db.query("ALTER TABLE courses ADD COLUMN thumbnail VARCHAR(500) DEFAULT NULL AFTER category");
    }
    if (!courseColNames.includes('status')) {
      await db.query("ALTER TABLE courses ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'published' AFTER thumbnail");
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        video_url VARCHAR(500) DEFAULT NULL,
        resource_url VARCHAR(500) DEFAULT NULL,
        lesson_order INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_lessons_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const [lessonCols] = await db.query('DESCRIBE lessons');
    const lessonColNames = lessonCols.map(c => c.Field);
    if (!lessonColNames.includes('video_url')) {
      await db.query("ALTER TABLE lessons ADD COLUMN video_url VARCHAR(500) DEFAULT NULL AFTER content");
    }
    if (!lessonColNames.includes('resource_url')) {
      await db.query("ALTER TABLE lessons ADD COLUMN resource_url VARCHAR(500) DEFAULT NULL AFTER video_url");
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_enrollments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
        UNIQUE KEY uq_user_course (user_id, course_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_assignments_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assignment_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        grade DECIMAL(5, 2) DEFAULT NULL,
        feedback TEXT DEFAULT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_submissions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments (id) ON DELETE CASCADE,
        CONSTRAINT fk_submissions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const [subCols] = await db.query('DESCRIBE submissions');
    const subColNames = subCols.map(c => c.Field);
    if (!subColNames.includes('feedback')) {
      await db.query("ALTER TABLE submissions ADD COLUMN feedback TEXT DEFAULT NULL AFTER grade");
    }

    // 2. New tables: lesson_progress, reviews, notifications
    await db.query(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        lesson_id INT NOT NULL,
        completed BOOLEAN DEFAULT TRUE,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_progress_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
        CONSTRAINT fk_progress_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE,
        UNIQUE KEY uq_user_lesson (user_id, lesson_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_reviews_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
        UNIQUE KEY uq_user_course_review (user_id, course_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Tables verified and updated.');

    // 3. Update existing users with passwords
    await db.query('UPDATE users SET password = ? WHERE password = "" OR password IS NULL', [defaultPasswordHash]);

    // 4. Seed categories if fewer than 5
    const [cats] = await db.query('SELECT COUNT(*) as count FROM categories');
    if (cats[0].count < 5) {
      const initialCats = [
        ['Web Development', 'Khóa học phát triển web Frontend, Backend, Full-stack hiện đại.'],
        ['Data Science & AI', 'Phân tích dữ liệu, Trí tuệ nhân tạo, Machine Learning và Python.'],
        ['Mobile Development', 'Phát triển ứng dụng di động cho iOS (Swift) và Android (React Native, Flutter).'],
        ['DevOps & Cloud', 'Hạ tầng đám mây AWS, Azure, CI/CD pipelines, Docker và Kubernetes.'],
        ['UI/UX Design & Product', 'Thiết kế giao diện và trải nghiệm người dùng với Figma và Design Thinking.'],
        ['Cyber Security', 'An toàn thông tin, bảo mật ứng dụng web và kiểm thử xâm nhập (Penetration Testing).']
      ];
      for (const cat of initialCats) {
        await db.query('INSERT IGNORE INTO categories (name, description) VALUES (?, ?)', cat);
      }
    }

    // 5. Seed Users (1 Admin, 3 Instructors, 6 Students)
    const seedUsers = [
      ['Lê Minh Cường', 'cuong.le@example.com', defaultPasswordHash, 'admin', 'Quản trị viên hệ thống có toàn quyền điều hành E-Learning.'],
      ['Dr. Alex Morgan', 'alex.morgan@example.com', defaultPasswordHash, 'instructor', 'Tiến sĩ Khoa học Máy tính, chuyên gia Full-Stack và Cloud Architecture với hơn 10 năm kinh nghiệm.'],
      ['Prof. Sarah Jenkins', 'sarah.jenkins@example.com', defaultPasswordHash, 'instructor', 'Giáo sư chuyên ngành AI & Machine Learning, tác giả nhiều công trình nghiên cứu về Data Science.'],
      ['Michael Chang', 'michael.chang@example.com', defaultPasswordHash, 'instructor', 'Chuyên gia phát triển ứng dụng di động iOS/Android và thiết kế trải nghiệm người dùng UI/UX.'],
      ['Nguyễn Văn An', 'an.nguyen@example.com', defaultPasswordHash, 'student', 'Sinh viên năm 3 chuyên ngành Kỹ thuật Phần mềm, đam mê phát triển Web.'],
      ['Trần Thị Bình', 'binh.tran@example.com', defaultPasswordHash, 'student', 'Học viên ngành Trí tuệ nhân tạo, mục tiêu trở thành Data Scientist.'],
      ['Đỗ Hoàng Nam', 'hoang.nam@example.com', defaultPasswordHash, 'student', 'Lập trình viên mới vào nghề tìm hiểu về Cloud và DevOps.'],
      ['Mai Lan Anh', 'lan.anh@example.com', defaultPasswordHash, 'student', 'Sinh viên thiết kế đa phương tiện, mong muốn nâng cao kỹ năng UI/UX.'],
      ['Vũ Quang Huy', 'quang.huy@example.com', defaultPasswordHash, 'student', 'Học viên đam mê an toàn thông tin và bảo mật mạng.'],
      ['Phạm Minh Thư', 'minh.thu@example.com', defaultPasswordHash, 'student', 'Học viên tự học chuyển ngành sang công nghệ thông tin.']
    ];

    for (const u of seedUsers) {
      await db.query(`
        INSERT INTO users (name, email, password, role, bio) 
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name), 
          password = IF(password = '' OR password IS NULL, VALUES(password), password),
          role = VALUES(role),
          bio = VALUES(bio)
      `, u);
    }

    // Retrieve instructor IDs
    const [alexRows] = await db.query('SELECT id FROM users WHERE email = ?', ['alex.morgan@example.com']);
    const [sarahRows] = await db.query('SELECT id FROM users WHERE email = ?', ['sarah.jenkins@example.com']);
    const [michaelRows] = await db.query('SELECT id FROM users WHERE email = ?', ['michael.chang@example.com']);

    const alexId = alexRows[0]?.id;
    const sarahId = sarahRows[0]?.id;
    const michaelId = michaelRows[0]?.id;

    // 6. Seed Courses (at least 8 courses with proper instructor_id)
    const seedCourses = [
      [1, 'Full-Stack Web Development with React & Node.js', 'Học lập trình web từ cơ bản đến nâng cao với React 18, Node.js Express và MySQL.', 'Dr. Alex Morgan', alexId, 49.99, 'Web Development', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60', 'published'],
      [2, 'Python for Data Science and Machine Learning', 'Khóa học toàn diện về Python, thư viện NumPy, Pandas, Scikit-Learn và các mô hình học máy cơ bản.', 'Prof. Sarah Jenkins', sarahId, 89.99, 'Data Science & AI', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60', 'published'],
      [3, 'iOS & Swift Bootcamp for Beginners', 'Xây dựng ứng dụng native cho iPhone và iPad với Swift 5 và SwiftUI từ con số 0.', 'Michael Chang', michaelId, 29.99, 'Mobile Development', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=60', 'published'],
      [4, 'Introduction to Cloud Computing & AWS Services', 'Nắm vững kiến thức nền tảng điện toán đám mây, các dịch vụ EC2, S3, RDS và Serverless.', 'Dr. Alex Morgan', alexId, 0.00, 'DevOps & Cloud', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60', 'published'],
      [5, 'Modern UI/UX Design with Figma: Wireframe to Prototype', 'Thực hành thiết kế giao diện người dùng chuyên nghiệp, xây dựng Design System và Prototype tương tác cao.', 'Michael Chang', michaelId, 39.99, 'UI/UX Design & Product', 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=60', 'published'],
      [6, 'Docker & Kubernetes: Practical Containerization', 'Làm chủ Docker Container, Docker Compose và quản lý cụm dịch vụ tự động với Kubernetes trong sản xuất.', 'Dr. Alex Morgan', alexId, 59.99, 'DevOps & Cloud', 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&auto=format&fit=crop&q=60', 'published'],
      [7, 'Advanced React 18: Performance & Architecture', 'Khám phá các kỹ thuật tối ưu render, Concurrent Mode, React Server Components và State Management quy mô lớn.', 'Prof. Sarah Jenkins', sarahId, 0.00, 'Web Development', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60', 'published'],
      [8, 'Deep Learning & Computer Vision with PyTorch', 'Xây dựng mô hình thị giác máy tính với Convolutional Neural Networks (CNNs) và PyTorch tiên tiến.', 'Prof. Sarah Jenkins', sarahId, 79.99, 'Data Science & AI', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60', 'published'],
      [9, 'Ethical Hacking & Web Application Security', 'Khám phá lỗ hổng OWASP Top 10, phương thức phòng thủ SQL Injection, XSS, CSRF và bảo mật API an toàn.', 'Dr. Alex Morgan', alexId, 69.99, 'Cyber Security', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60', 'published']
    ];

    for (const c of seedCourses) {
      await db.query(`
        INSERT INTO courses (id, title, description, instructor, instructor_id, price, category, thumbnail, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = VALUES(description),
          instructor = VALUES(instructor),
          instructor_id = VALUES(instructor_id),
          price = VALUES(price),
          category = VALUES(category),
          thumbnail = VALUES(thumbnail),
          status = VALUES(status)
      `, c);
    }

    // 7. Seed Lessons (multiple per course)
    const seedLessons = [
      // Course 1
      [1, 'Giới thiệu về React 18 và Hệ sinh thái Frontend', 'Tổng quan về JSX, Functional Components, Virtual DOM và triết lý thiết kế React.', 'https://www.youtube.com/embed/SqcY0GlETPk', 'https://react.dev', 1],
      [1, 'Quản lý Trạng thái với React Hooks', 'Tìm hiểu sâu về useState, useEffect, useCallback, useMemo và Custom Hooks.', 'https://www.youtube.com/embed/O6P86uwfdR0', 'https://react.dev/reference/react', 2],
      [1, 'Xây dựng REST API chuẩn với Express.js', 'Khởi tạo Express server, tổ chức route, controller, middleware CORS và Error Handler.', 'https://www.youtube.com/embed/7H_QH9nipNs', 'https://expressjs.com', 3],
      [1, 'Tích hợp MySQL và Parameterized SQL Queries', 'Kết nối CSDL quan hệ với mysql2 connection pool, phòng chống SQL Injection.', 'https://www.youtube.com/embed/EN6Dx22cPRI', 'https://github.com/sidorares/node-mysql2', 4],
      // Course 2
      [2, 'Làm quen với Python & Jupyter Notebook', 'Cú pháp cơ bản, kiểu dữ liệu, cấu trúc điều khiển và môi trường Jupyter Notebook.', 'https://www.youtube.com/embed/rfscVS0vtbw', 'https://docs.python.org', 1],
      [2, 'Phân tích dữ liệu cùng Pandas DataFrame', 'Thao tác với chuỗi Series, bảng DataFrame, lọc và xử lý dữ liệu bị thiếu (NaN).', 'https://www.youtube.com/embed/dcqPhpY7tWk', 'https://pandas.pydata.org', 2],
      [2, 'Trực quan hóa dữ liệu với Matplotlib & Seaborn', 'Vẽ biểu đồ phân bố, biểu đồ phân tán, biểu đồ nhiệt để phát hiện xu hướng.', 'https://www.youtube.com/embed/DAQNHzOcO5A', 'https://seaborn.pydata.org', 3],
      // Course 3
      [3, 'Nhập môn Swift và Xcode IDE', 'Cài đặt môi trường Xcode, biến số, kiểu dữ liệu Optionals và Control Flow trong Swift.', 'https://www.youtube.com/embed/comQ1-x2a1Q', 'https://developer.apple.com/swift', 1],
      [3, 'Thiết kế giao diện declarative với SwiftUI', 'Views, Modifiers, Stacks (VStack, HStack), State và Binding trong SwiftUI.', 'https://www.youtube.com/embed/F2ojC6TNwws', 'https://developer.apple.com/xcode/swiftui', 2],
      // Course 4
      [4, 'Tổng quan về Cloud Computing và Mô hình Dịch vụ', 'Sự khác biệt giữa IaaS, PaaS, SaaS và ưu điểm khi chuyển dịch lên Cloud.', 'https://www.youtube.com/embed/M988_fsOSWo', 'https://aws.amazon.com/what-is-cloud-computing', 1],
      [4, 'Thực hành với AWS EC2 & S3 Bucket', 'Khởi tạo máy ảo EC2 Linux, cấu hình Security Group và lưu trữ tài nguyên trên Amazon S3.', 'https://www.youtube.com/embed/Z3SYDTMP3ME', 'https://docs.aws.amazon.com', 2],
      // Course 5
      [5, 'Nguyên lý Thiết kế Giao diện và Wireframing', 'Các nguyên tắc thiết kế UI (Hierarchy, Contrast, Alignment) và dựng Wireframe trong Figma.', 'https://www.youtube.com/embed/c9Wg6Cb_YlU', 'https://www.figma.com/best-practices', 1],
      [5, 'Xây dựng Design System và Interactive Prototype', 'Tạo Color Tokens, Typography, Auto-Layout và kết nối Smart Animate prototype.', 'https://www.youtube.com/embed/FTFaQWZBqQ8', 'https://help.figma.com', 2]
    ];

    const [existingLessons] = await db.query('SELECT COUNT(*) as count FROM lessons');
    if (existingLessons[0].count < 8) {
      await db.query('DELETE FROM lessons');
      for (const l of seedLessons) {
        await db.query(`
          INSERT INTO lessons (course_id, title, content, video_url, resource_url, lesson_order)
          VALUES (?, ?, ?, ?, ?, ?)
        `, l);
      }
    }

    // 8. Seed Enrollments
    const [studentAn] = await db.query('SELECT id FROM users WHERE email = ?', ['an.nguyen@example.com']);
    const [studentBinh] = await db.query('SELECT id FROM users WHERE email = ?', ['binh.tran@example.com']);
    const [studentNam] = await db.query('SELECT id FROM users WHERE email = ?', ['hoang.nam@example.com']);
    const [studentLan] = await db.query('SELECT id FROM users WHERE email = ?', ['lan.anh@example.com']);

    const anId = studentAn[0]?.id;
    const binhId = studentBinh[0]?.id;
    const namId = studentNam[0]?.id;
    const lanId = studentLan[0]?.id;

    if (anId && binhId) {
      const enrollmentsData = [
        [anId, 1, 'active'],
        [anId, 2, 'active'],
        [anId, 4, 'completed'],
        [binhId, 1, 'active'],
        [binhId, 2, 'completed'],
        [binhId, 3, 'active']
      ];
      if (namId) {
        enrollmentsData.push([namId, 4, 'active']);
        enrollmentsData.push([namId, 6, 'active']);
      }
      if (lanId) {
        enrollmentsData.push([lanId, 5, 'active']);
      }

      for (const e of enrollmentsData) {
        await db.query(`
          INSERT INTO enrollments (user_id, course_id, status)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE status = VALUES(status)
        `, e);
      }
    }

    // 9. Seed Lesson Progress
    const [course1Lessons] = await db.query('SELECT id FROM lessons WHERE course_id = 1 ORDER BY lesson_order ASC');
    if (anId && course1Lessons.length > 0) {
      await db.query(`
        INSERT IGNORE INTO lesson_progress (user_id, course_id, lesson_id, completed)
        VALUES (?, 1, ?, 1)
      `, [anId, course1Lessons[0].id]);
      if (course1Lessons.length > 1) {
        await db.query(`
          INSERT IGNORE INTO lesson_progress (user_id, course_id, lesson_id, completed)
          VALUES (?, 1, ?, 1)
        `, [anId, course1Lessons[1].id]);
      }
    }

    // 10. Seed Assignments & Submissions
    const [existingAssign] = await db.query('SELECT COUNT(*) as count FROM assignments');
    if (existingAssign[0].count < 3) {
      await db.query(`
        INSERT IGNORE INTO assignments (id, course_id, title, description, due_date) VALUES
        (1, 1, 'Bài tập 1: Xây dựng ứng dụng Todo với React Hooks', 'Tạo giao diện Todo App với các thao tác Thêm, Sửa, Xóa và lưu state vào localStorage.', '2026-10-25 23:59:59'),
        (2, 1, 'Bài tập 2: Thiết kế REST API Backend với Express & MySQL', 'Xây dựng các endpoint CRUD đầy đủ với validation và xử lý lỗi.', '2026-11-05 23:59:59'),
        (3, 2, 'Bài tập 1: Phân tích dữ liệu thực tế bằng Pandas', 'Thực hiện làm sạch dữ liệu và thống kê các chỉ số quan trọng từ dataset được giao.', '2026-10-30 23:59:59')
        ON DUPLICATE KEY UPDATE title = VALUES(title)
      `);
    }

    if (anId && binhId) {
      await db.query(`
        INSERT IGNORE INTO submissions (id, assignment_id, user_id, content, grade, feedback) VALUES
        (1, 1, ?, 'https://github.com/annguyen/react-todo-hooks-app', 95.00, 'Bài làm rất tốt, cấu trúc component rõ ràng và clean code!'),
        (2, 1, ?, 'https://github.com/binhtran/react-todo-assignment', 88.50, 'Giao diện đẹp, cần chú ý thêm xử lý trường hợp input rỗng.')
        ON DUPLICATE KEY UPDATE grade = VALUES(grade), feedback = VALUES(feedback)
      `, [anId, binhId]);
    }

    // 11. Seed Reviews
    if (anId && binhId) {
      await db.query(`
        INSERT IGNORE INTO reviews (user_id, course_id, rating, review) VALUES
        (?, 1, 5, 'Khóa học cực kỳ chi tiết và dễ hiểu! Giảng viên nhiệt tình, bài tập thực chiến giúp mình tự tin phỏng vấn frontend.'),
        (?, 2, 5, 'Nội dung Python và Data Science giải thích rất trực quan. Các bài thực hành phân tích dữ liệu rất thực tế.'),
        (?, 1, 4, 'Rất hữu ích, học được nhiều best practice về React 18.')
      `, [anId, binhId, binhId]);
    }

    // 12. Seed Notifications
    if (anId) {
      await db.query(`
        INSERT IGNORE INTO notifications (user_id, title, message, is_read) VALUES
        (?, 'Chào mừng bạn đến với E-Learning Platform', 'Khám phá hàng chục khóa học chất lượng cao và bắt đầu lộ trình học tập của bạn ngay hôm nay!', 0),
        (?, 'Bài tập đã được chấm điểm', 'Giáo viên Dr. Alex Morgan đã chấm bài tập "Xây dựng ứng dụng Todo với React Hooks" của bạn: 95/100.', 0)
      `, [anId, anId]);
    }

    console.log('--- Migration & Seed completed successfully! ---');
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  }
}

if (require.main === module) {
  migrateAndSeed().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = migrateAndSeed;
