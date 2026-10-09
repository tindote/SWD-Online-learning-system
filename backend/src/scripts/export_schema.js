const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function exportSql() {
  const [users] = await db.query('SELECT * FROM users ORDER BY id');
  const [courses] = await db.query('SELECT * FROM courses ORDER BY id');
  const [lessons] = await db.query('SELECT * FROM lessons ORDER BY course_id, lesson_order');
  const [assignments] = await db.query('SELECT * FROM assignments ORDER BY course_id, id');
  const [enrollments] = await db.query('SELECT * FROM enrollments ORDER BY id');
  const [reviews] = await db.query('SELECT * FROM reviews ORDER BY id');
  const [submissions] = await db.query('SELECT * FROM submissions ORDER BY id');
  const [notifications] = await db.query('SELECT * FROM notifications ORDER BY id');

  const escapeStr = (val) => {
    if (val === null || val === undefined) return 'NULL';
    const escaped = String(val)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
    return `'${escaped}'`;
  };

  const schemaPath = path.join(__dirname, '../../schema.sql');
  const rawSchema = fs.readFileSync(schemaPath, 'utf8');
  const schemaHeader = rawSchema.split('-- Seed Data')[0];

  let sql = schemaHeader.trim() + '\n\n-- Seed Data (Default Password for all seed accounts: \'Password123!\')\n-- Hash: $2b$10$HPPk9SxrIshCk8ZqvmhYfexySCxE8uJ.R.VL0l6rcbmE1/FJcUhv6\n\n';

  sql += '-- 1. Categories\n';
  sql += 'INSERT INTO `categories` (`id`, `name`, `description`) VALUES\n' +
    "(1, 'Web Development', 'Khóa học phát triển web Frontend, Backend, Full-stack hiện đại.'),\n" +
    "(2, 'Data Science & AI', 'Phân tích dữ liệu, Trí tuệ nhân tạo, Machine Learning và Python.'),\n" +
    "(3, 'Mobile Development', 'Phát triển ứng dụng di động cho iOS (Swift) và Android (React Native, Flutter).'),\n" +
    "(4, 'DevOps & Cloud', 'Hạ tầng đám mây AWS, Azure, CI/CD pipelines, Docker và Kubernetes.'),\n" +
    "(5, 'UI/UX Design & Product', 'Thiết kế giao diện và trải nghiệm người dùng với Figma và Design Thinking.'),\n" +
    "(6, 'Cyber Security', 'An toàn thông tin, bảo mật ứng dụng web và kiểm thử xâm nhập (Penetration Testing).')\n" +
    'ON DUPLICATE KEY UPDATE name=VALUES(name);\n\n';

  sql += '-- 2. Users (Admin, Instructors, Students)\n';
  sql += 'INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `bio`) VALUES\n';
  sql += users.map(u => `(${u.id}, ${escapeStr(u.name)}, ${escapeStr(u.email)}, ${escapeStr(u.password)}, ${escapeStr(u.role)}, ${escapeStr(u.bio)})`).join(',\n') + ';\n\n';

  sql += '-- 3. Courses (26 Full Courses)\n';
  sql += 'INSERT INTO `courses` (`id`, `title`, `description`, `instructor`, `instructor_id`, `price`, `category`, `thumbnail`, `status`) VALUES\n';
  sql += courses.map(c => `(${c.id}, ${escapeStr(c.title)}, ${escapeStr(c.description)}, ${escapeStr(c.instructor)}, ${c.instructor_id || 'NULL'}, ${c.price}, ${escapeStr(c.category)}, ${escapeStr(c.thumbnail)}, ${escapeStr(c.status)})`).join(',\n') + ';\n\n';

  sql += '-- 4. Lessons (135 Lessons)\n';
  sql += 'INSERT INTO `lessons` (`id`, `course_id`, `title`, `content`, `video_url`, `resource_url`, `lesson_order`) VALUES\n';
  sql += lessons.map(l => `(${l.id}, ${l.course_id}, ${escapeStr(l.title)}, ${escapeStr(l.content)}, ${escapeStr(l.video_url)}, ${escapeStr(l.resource_url)}, ${l.lesson_order})`).join(',\n') + ';\n\n';

  sql += '-- 5. Assignments (53 Assignments)\n';
  sql += 'INSERT INTO `assignments` (`id`, `course_id`, `title`, `description`, `due_date`) VALUES\n';
  sql += assignments.map(a => {
    const d = new Date(a.due_date);
    const dateStr = !isNaN(d.getTime()) ? d.toISOString().slice(0, 19).replace('T', ' ') : '2026-12-31 23:59:59';
    return `(${a.id}, ${a.course_id}, ${escapeStr(a.title)}, ${escapeStr(a.description)}, '${dateStr}')`;
  }).join(',\n') + ';\n\n';

  sql += '-- 6. Enrollments\n';
  sql += 'INSERT INTO `enrollments` (`user_id`, `course_id`, `status`) VALUES\n';
  sql += enrollments.map(e => `(${e.user_id}, ${e.course_id}, ${escapeStr(e.status)})`).join(',\n') + ';\n\n';

  if (reviews.length > 0) {
    sql += '-- 7. Reviews\n';
    sql += 'INSERT INTO `reviews` (`user_id`, `course_id`, `rating`, `review`) VALUES\n';
    sql += reviews.map(r => `(${r.user_id}, ${r.course_id}, ${r.rating}, ${escapeStr(r.review)})`).join(',\n') + ';\n\n';
  }

  if (notifications.length > 0) {
    sql += '-- 8. Notifications\n';
    sql += 'INSERT INTO `notifications` (`user_id`, `title`, `message`, `is_read`) VALUES\n';
    sql += notifications.map(n => `(${n.user_id}, ${escapeStr(n.title)}, ${escapeStr(n.message)}, ${n.is_read ? 1 : 0})`).join(',\n') + ';\n\n';
  }

  fs.writeFileSync(schemaPath, sql);
  console.log(`Successfully updated ${schemaPath} with complete new database contents!`);
  console.log(`Stats exported: ${users.length} users, ${courses.length} courses, ${lessons.length} lessons, ${assignments.length} assignments, ${enrollments.length} enrollments`);
  process.exit(0);
}

exportSql().catch(e => {
  console.error('Error exporting schema:', e);
  process.exit(1);
});
