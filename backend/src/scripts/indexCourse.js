/**
 * CLI Script: Index course lessons into MySQL `ai_knowledge_chunks` for Gemini RAG.
 *
 * Usage:
 *   node src/scripts/indexCourse.js <courseId> [--force]
 *   node src/scripts/indexCourse.js --all [--force]
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const db = require('../config/db');
const CourseModel = require('../models/courseModel');
const RagService = require('../services/ragService');

async function runIndexing() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const indexAll = args.includes('--all');
  const courseIdArg = args.find((arg) => !arg.startsWith('--'));

  if (!indexAll && !courseIdArg) {
    console.log('Cách sử dụng:');
    console.log('  node src/scripts/indexCourse.js <courseId> [--force]');
    console.log('  node src/scripts/indexCourse.js --all [--force]');
    process.exit(1);
  }

  try {
    let targetCourseIds = [];

    if (indexAll) {
      const publishedCourses = await CourseModel.getAll({ status: 'published', allStatus: false });
      targetCourseIds = publishedCourses.map((c) => c.id);
      console.log(`Tìm thấy ${targetCourseIds.length} khóa học đã xuất bản (published) để lập chỉ mục...`);
    } else {
      const parsedId = Number(courseIdArg);
      if (!Number.isInteger(parsedId) || parsedId <= 0) {
        console.error(`Lỗi: Mã khóa học "${courseIdArg}" không hợp lệ.`);
        process.exit(1);
      }
      targetCourseIds = [parsedId];
    }

    for (const courseId of targetCourseIds) {
      console.log(`\n------------------------------------------------------------`);
      console.log(`Đang lập chỉ mục khóa học ID=${courseId} (force=${force})...`);
      const report = await RagService.indexCourseLessons(courseId, { force });
      console.log(`Hoàn tất khóa học: [${report.courseId}] ${report.courseTitle}`);
      console.log(`  - Tổng số bài học:           ${report.totalLessons}`);
      console.log(`  - Bài học đã lập chỉ mục:    ${report.indexedLessons}`);
      console.log(`  - Bài học trống (bỏ qua):    ${report.skippedEmptyLessons}`);
      console.log(`  - Tổng số đoạn (chunks):     ${report.totalChunks}`);
      console.log(`  - Chunks tạo embedding mới:  ${report.newlyEmbeddedChunks}`);
      console.log(`  - Chunks giữ nguyên (cache): ${report.reusedUnchangedChunks}`);
      if (report.failures.length > 0) {
        console.warn(`  - Lỗi từng phần (${report.failures.length}):`, report.failures);
      }
    }

    console.log('\n============================================================');
    console.log('Quá trình lập chỉ mục RAG hoàn tất!');
    await db.end();
    process.exit(0);
  } catch (error) {
    console.error('\n[LỖI LẬP CHỈ MỤC RAG]:', error.message || error);
    try {
      await db.end();
    } catch {
      // ignore
    }
    process.exit(1);
  }
}

if (require.main === module) {
  runIndexing();
}

module.exports = { runIndexing };

