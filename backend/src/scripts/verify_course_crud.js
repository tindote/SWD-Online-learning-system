const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_HOST = '127.0.0.1';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (e) {
          json = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', err => reject(err));

    if (data) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(payload));
      req.write(payload);
    }

    req.end();
  });
}

async function login(email, password) {
  const res = await request({
    host: BASE_HOST,
    port: PORT,
    path: '/api/auth/login',
    method: 'POST'
  }, { email, password });

  const token = res.data?.token || res.data?.data?.token;
  const user = res.data?.user || res.data?.data?.user;

  if (res.statusCode !== 200 || !token) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.data)}`);
  }
  return { token, user };
}

async function runTests() {
  console.log('====================================================');
  console.log('  STARTING VERIFICATION: COURSE MANAGEMENT CRUD');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extra = '') {
    if (condition) {
      console.log(`  ✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${testName} ${extra}`);
      failed++;
    }
  }

  // 1. Health check
  try {
    const health = await request({ host: BASE_HOST, port: PORT, path: '/', method: 'GET' });
    assert(health.statusCode === 200, 'Backend Health Check (GET /)');
  } catch (e) {
    console.error('Cannot connect to backend server at port ' + PORT + ':', e.message);
    process.exit(1);
  }

  // 2. Public Read (Guest)
  const publicList = await request({ host: BASE_HOST, port: PORT, path: '/api/courses', method: 'GET' });
  assert(publicList.statusCode === 200 && Array.isArray(publicList.data?.data), 'Guest View Course List (GET /api/courses)');
  const initialCount = publicList.data?.data?.length || 0;
  console.log(`     Initial courses count: ${initialCount}`);

  // 3. User Logins
  console.log('\n--- 1. Authenticating Users ---');
  const adminAuth = await login('cuong.le@example.com', 'Password123!');
  console.log(`     Admin logged in: ${adminAuth.user.name} (${adminAuth.user.role})`);

  const alexAuth = await login('alex.morgan@example.com', 'Password123!');
  console.log(`     Instructor Alex logged in: ${alexAuth.user.name} (${alexAuth.user.role})`);

  const sarahAuth = await login('sarah.jenkins@example.com', 'Password123!');
  console.log(`     Instructor Sarah logged in: ${sarahAuth.user.name} (${sarahAuth.user.role})`);

  const studentAuth = await login('an.nguyen@example.com', 'Password123!');
  console.log(`     Student An logged in: ${studentAuth.user.name} (${studentAuth.user.role})`);

  // 4. Role Authorization Checks on Create
  console.log('\n--- 2. Create Course Authorization & Validation ---');
  
  // Student attempt (Expect 403)
  const studentCreate = await request({
    host: BASE_HOST, port: PORT, path: '/api/courses', method: 'POST',
    headers: { Authorization: `Bearer ${studentAuth.token}` }
  }, {
    title: 'Hacked Course by Student',
    description: 'This should be blocked',
    category: 'Web Development',
    price: 10
  });
  assert(studentCreate.statusCode === 403, 'Student cannot create course (403 Forbidden)');

  // Missing title validation (Expect 400)
  const invalidCreate = await request({
    host: BASE_HOST, port: PORT, path: '/api/courses', method: 'POST',
    headers: { Authorization: `Bearer ${alexAuth.token}` }
  }, {
    title: '',
    description: 'Valid description with enough characters',
    category: 'Web Development',
    price: 10
  });
  assert(invalidCreate.statusCode === 400, 'Create course with empty title rejected (400 Bad Request)');

  // Negative price validation (Expect 400)
  const negativePrice = await request({
    host: BASE_HOST, port: PORT, path: '/api/courses', method: 'POST',
    headers: { Authorization: `Bearer ${alexAuth.token}` }
  }, {
    title: 'Valid Title Here',
    description: 'Valid description with enough characters',
    category: 'Web Development',
    price: -25
  });
  assert(negativePrice.statusCode === 400, 'Create course with negative price rejected (400 Bad Request)');

  // Valid creation by Instructor Alex (Expect 201)
  const testCoursePayload = {
    title: 'Automated Test Course ' + Date.now(),
    description: 'Khóa học thực chiến phục vụ kiểm thử tự động CRUD thành viên 3.',
    price: 49.99,
    category: 'Web Development',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    status: 'published'
  };

  const createRes = await request({
    host: BASE_HOST, port: PORT, path: '/api/courses', method: 'POST',
    headers: { Authorization: `Bearer ${alexAuth.token}` }
  }, testCoursePayload);

  assert(createRes.statusCode === 201 && createRes.data?.data?.id, 'Instructor creates course successfully (201 Created)');
  const createdCourse = createRes.data?.data;
  const courseId = createdCourse?.id;
  console.log(`     Created Course ID: ${courseId}, Title: "${createdCourse?.title}"`);
  assert(Number(createdCourse?.instructor_id) === Number(alexAuth.user.id), 'Created course automatically assigned to authenticated instructor ID');

  // 5. Read Course Details
  console.log('\n--- 3. Read Course Details & Edge Cases ---');
  const getDetail = await request({
    host: BASE_HOST, port: PORT, path: `/api/courses/${courseId}`, method: 'GET',
    headers: { Authorization: `Bearer ${alexAuth.token}` }
  });
  assert(getDetail.statusCode === 200 && getDetail.data?.data?.title === testCoursePayload.title, 'Read Course Details by ID (GET /api/courses/:id)');
  assert(getDetail.data?.data?.isInstructorOwner === true, 'Detail response indicates course owner (isInstructorOwner = true)');

  const getNonExistent = await request({
    host: BASE_HOST, port: PORT, path: '/api/courses/9999999', method: 'GET'
  });
  assert(getNonExistent.statusCode === 404, 'Get nonexistent course ID returns 404 Not Found');

  // 6. Update Course & Ownership Checks
  console.log('\n--- 4. Update Course & Ownership Protection ---');
  
  // Instructor Sarah attempts to edit Alex's course (Expect 403)
  const unauthorizedUpdate = await request({
    host: BASE_HOST, port: PORT, path: `/api/courses/${courseId}`, method: 'PUT',
    headers: { Authorization: `Bearer ${sarahAuth.token}` }
  }, {
    title: 'Hacked Title by Sarah',
    description: 'Should not allow',
    category: 'Web Development',
    price: 10
  });
  assert(unauthorizedUpdate.statusCode === 403, 'Instructor Sarah CANNOT edit Alex\'s course (403 Forbidden Ownership Check)');

  // Owner Alex updates his own course (Expect 200)
  const updatedTitle = 'Updated Test Course Title ' + Date.now();
  const validUpdate = await request({
    host: BASE_HOST, port: PORT, path: `/api/courses/${courseId}`, method: 'PUT',
    headers: { Authorization: `Bearer ${alexAuth.token}` }
  }, {
    title: updatedTitle,
    description: 'Mô tả đã được cập nhật thành công bởi chính giảng viên Alex.',
    category: 'Web Development',
    price: 29.99,
    status: 'published'
  });
  assert(validUpdate.statusCode === 200 && validUpdate.data?.data?.title === updatedTitle, 'Course Owner updates own course successfully (200 OK)');

  // Admin updates Alex's course (Expect 200)
  const adminUpdate = await request({
    host: BASE_HOST, port: PORT, path: `/api/courses/${courseId}`, method: 'PUT',
    headers: { Authorization: `Bearer ${adminAuth.token}` }
  }, {
    title: updatedTitle + ' [Admin Verified]',
    description: 'Quản trị viên đã kiểm duyệt và phê duyệt khóa học này.',
    category: 'Web Development',
    price: 39.99,
    status: 'published'
  });
  assert(adminUpdate.statusCode === 200, 'Admin can update any course regardless of ownership (200 OK)');

  // 7. Delete Course & Ownership Protection
  console.log('\n--- 5. Delete Course & Ownership Protection ---');

  // Instructor Sarah attempts to delete Alex's course (Expect 403)
  const unauthorizedDelete = await request({
    host: BASE_HOST, port: PORT, path: `/api/courses/${courseId}`, method: 'DELETE',
    headers: { Authorization: `Bearer ${sarahAuth.token}` }
  });
  assert(unauthorizedDelete.statusCode === 403, 'Instructor Sarah CANNOT delete Alex\'s course (403 Forbidden Ownership Check)');

  // Owner Alex deletes his own course (Expect 200)
  const validDelete = await request({
    host: BASE_HOST, port: PORT, path: `/api/courses/${courseId}`, method: 'DELETE',
    headers: { Authorization: `Bearer ${alexAuth.token}` }
  });
  assert(validDelete.statusCode === 200, 'Course Owner Alex deletes course successfully (200 OK)');

  // Verify course is gone
  const verifyDeleted = await request({
    host: BASE_HOST, port: PORT, path: `/api/courses/${courseId}`, method: 'GET'
  });
  assert(verifyDeleted.statusCode === 404, 'Verified deleted course no longer exists (404 Not Found)');

  // Delete non-existent course (Expect 404)
  const deleteNonExistent = await request({
    host: BASE_HOST, port: PORT, path: `/api/courses/${courseId}`, method: 'DELETE',
    headers: { Authorization: `Bearer ${adminAuth.token}` }
  });
  assert(deleteNonExistent.statusCode === 404, 'Deleting already deleted or non-existent course returns 404 Not Found');

  console.log('\n====================================================');
  console.log(`  VERIFICATION FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal error during test execution:', err);
  process.exit(1);
});
