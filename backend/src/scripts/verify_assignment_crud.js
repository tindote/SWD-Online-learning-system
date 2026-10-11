const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const http = require('http');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_online_learning_2026_fa';
const PORT = 5000;

// Tokens for different roles
const adminToken = jwt.sign(
  { id: 5, email: 'cuong.le@example.com', role: 'admin' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const instructorAlexToken = jwt.sign(
  { id: 3, email: 'alex.morgan@example.com', role: 'instructor' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const instructorSarahToken = jwt.sign(
  { id: 4, email: 'sarah.jenkins@example.com', role: 'instructor' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const studentToken = jwt.sign(
  { id: 1, email: 'an.nguyen@example.com', role: 'student' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

function makeRequest({ method, path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (dataString) {
      reqHeaders['Content-Length'] = Buffer.byteLength(dataString);
    }

    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(responseBody);
        } catch {
          json = responseBody;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (dataString) {
      req.write(dataString);
    }
    req.end();
  });
}

async function runTests() {
  console.log('======================================================');
  console.log('   ASSIGNMENT CRUD COMPREHENSIVE VERIFICATION SUITE   ');
  console.log('======================================================\n');

  const app = require('../app');
  const server = app.listen(PORT, async () => {
    console.log(`Ephemeral test server running on http://localhost:${PORT}\n`);
    const results = [];

    const record = (name, passed, detail) => {
      results.push({ name, passed, detail });
      console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name}`);
      if (detail) console.log(`   └─ ${detail}`);
    };

    let createdAssignmentId = null;
    const testTitle = `Test_Assignment_${Date.now()}`;

    try {
      // 1. Read assignment list
      const resList = await makeRequest({
        method: 'GET',
        path: '/api/assignments',
        headers: { Authorization: `Bearer ${instructorAlexToken}` }
      });
      record(
        'GET /api/assignments (Read assignment list)',
        resList.statusCode === 200 && Array.isArray(resList.data?.data),
        `Status ${resList.statusCode}, Count: ${resList.data?.data?.length || 0} assignments`
      );

      // 2. Read assignment details
      const existingId = resList.data?.data?.[0]?.id || 1;
      const resDetail = await makeRequest({
        method: 'GET',
        path: `/api/assignments/${existingId}`,
        headers: { Authorization: `Bearer ${instructorAlexToken}` }
      });
      record(
        `GET /api/assignments/:id (Read assignment details ID #${existingId})`,
        resDetail.statusCode === 200 && resDetail.data?.data?.id === existingId,
        `Status ${resDetail.statusCode}, Title: "${resDetail.data?.data?.title}"`
      );

      // 3. Non-existent assignment ID
      const resNotFound = await makeRequest({
        method: 'GET',
        path: '/api/assignments/999999',
        headers: { Authorization: `Bearer ${instructorAlexToken}` }
      });
      record(
        'GET /api/assignments/999999 (Non-existent ID)',
        resNotFound.statusCode === 404,
        `Status ${resNotFound.statusCode}, Message: "${resNotFound.data?.message}"`
      );

      // 4. Invalid assignment ID format
      const resInvalidId = await makeRequest({
        method: 'GET',
        path: '/api/assignments/invalid-id-string',
        headers: { Authorization: `Bearer ${instructorAlexToken}` }
      });
      record(
        'GET /api/assignments/:id (Invalid ID format)',
        resInvalidId.statusCode === 400,
        `Status ${resInvalidId.statusCode}, Message: "${resInvalidId.data?.message}"`
      );

      // 5. Unauthorized attempt (No token)
      const resNoToken = await makeRequest({
        method: 'POST',
        path: '/api/assignments',
        body: { course_id: 1, title: 'Unauthorized Test' }
      });
      record(
        'POST /api/assignments without token (Unauthorized attempt)',
        resNoToken.statusCode === 401,
        `Status ${resNoToken.statusCode}, Message: "${resNoToken.data?.message}"`
      );

      // 6. Unauthorized attempt (Student role)
      const resStudent = await makeRequest({
        method: 'POST',
        path: '/api/assignments',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: { course_id: 1, title: 'Student Attempt' }
      });
      record(
        'POST /api/assignments as Student (Forbidden attempt)',
        resStudent.statusCode === 403,
        `Status ${resStudent.statusCode}, Message: "${resStudent.data?.message}"`
      );

      // 7. Invalid or missing title
      const resBlankTitle = await makeRequest({
        method: 'POST',
        path: '/api/assignments',
        headers: { Authorization: `Bearer ${instructorAlexToken}` },
        body: { course_id: 1, title: '   ', description: 'No title' }
      });
      record(
        'POST /api/assignments with empty title (Input validation)',
        resBlankTitle.statusCode === 400 && resBlankTitle.data?.errors?.length > 0,
        `Status ${resBlankTitle.statusCode}, Errors: [${resBlankTitle.data?.errors?.join(', ')}]`
      );

      // 8. Invalid course ID
      const resInvalidCourse = await makeRequest({
        method: 'POST',
        path: '/api/assignments',
        headers: { Authorization: `Bearer ${instructorAlexToken}` },
        body: { course_id: 999999, title: 'Valid Title' }
      });
      record(
        'POST /api/assignments with non-existent course ID',
        resInvalidCourse.statusCode === 400 && resInvalidCourse.data?.errors?.some(e => e.includes('không tồn tại')),
        `Status ${resInvalidCourse.statusCode}, Errors: [${resInvalidCourse.data?.errors?.join(', ')}]`
      );

      // 9. Invalid due date format
      const resInvalidDueDate = await makeRequest({
        method: 'POST',
        path: '/api/assignments',
        headers: { Authorization: `Bearer ${instructorAlexToken}` },
        body: { course_id: 1, title: 'Valid Title', due_date: 'not-a-valid-date-string' }
      });
      record(
        'POST /api/assignments with invalid due date format',
        resInvalidDueDate.statusCode === 400 && resInvalidDueDate.data?.errors?.some(e => e.includes('due_date')),
        `Status ${resInvalidDueDate.statusCode}, Errors: [${resInvalidDueDate.data?.errors?.join(', ')}]`
      );

      // 10. Instructor attempting to create assignment on another instructor's course
      // Course 1 is owned by Instructor Alex (id: 3). Instructor Sarah (id: 4) attempts to create on Course 1.
      const resCrossOwnerCreate = await makeRequest({
        method: 'POST',
        path: '/api/assignments',
        headers: { Authorization: `Bearer ${instructorSarahToken}` },
        body: { course_id: 1, title: 'Intrusion Assignment by Sarah' }
      });
      record(
        'POST /api/assignments on another instructor course (Ownership check)',
        resCrossOwnerCreate.statusCode === 403,
        `Status ${resCrossOwnerCreate.statusCode}, Message: "${resCrossOwnerCreate.data?.message}"`
      );

      // 11. Create a valid assignment by authorized instructor (Alex on Course 1)
      const resCreate = await makeRequest({
        method: 'POST',
        path: '/api/assignments',
        headers: { Authorization: `Bearer ${instructorAlexToken}` },
        body: {
          course_id: 1,
          title: testTitle,
          description: 'A comprehensive assignment created during automated verification',
          due_date: new Date(Date.now() + 86400000 * 7).toISOString()
        }
      });
      createdAssignmentId = resCreate.data?.data?.id;
      record(
        'POST /api/assignments (Authorized creation by Instructor Alex)',
        resCreate.statusCode === 201 && createdAssignmentId != null,
        `Status ${resCreate.statusCode}, ID: #${createdAssignmentId}, Title: "${resCreate.data?.data?.title}"`
      );

      // 12. Instructor Sarah attempting to update Alex's assignment
      const resCrossOwnerUpdate = await makeRequest({
        method: 'PUT',
        path: `/api/assignments/${createdAssignmentId}`,
        headers: { Authorization: `Bearer ${instructorSarahToken}` },
        body: { course_id: 1, title: 'Unauthorized Update by Sarah' }
      });
      record(
        'PUT /api/assignments/:id on another instructor assignment (Ownership check)',
        resCrossOwnerUpdate.statusCode === 403,
        `Status ${resCrossOwnerUpdate.statusCode}, Message: "${resCrossOwnerUpdate.data?.message}"`
      );

      // 13. Update assignment by authorized owner (Instructor Alex)
      const updatedTitle = `${testTitle}_Updated`;
      const resUpdate = await makeRequest({
        method: 'PUT',
        path: `/api/assignments/${createdAssignmentId}`,
        headers: { Authorization: `Bearer ${instructorAlexToken}` },
        body: {
          course_id: 1,
          title: updatedTitle,
          description: 'Updated instructions for verified assignment',
          due_date: new Date(Date.now() + 86400000 * 14).toISOString()
        }
      });
      record(
        `PUT /api/assignments/${createdAssignmentId} (Authorized update by owner)`,
        resUpdate.statusCode === 200 && resUpdate.data?.data?.title === updatedTitle,
        `Status ${resUpdate.statusCode}, Title: "${resUpdate.data?.data?.title}"`
      );

      // 14. Delete assignment by authorized owner
      const resDelete = await makeRequest({
        method: 'DELETE',
        path: `/api/assignments/${createdAssignmentId}`,
        headers: { Authorization: `Bearer ${instructorAlexToken}` }
      });
      record(
        `DELETE /api/assignments/${createdAssignmentId} (Authorized delete by owner)`,
        resDelete.statusCode === 200,
        `Status ${resDelete.statusCode}, Message: "${resDelete.data?.message}"`
      );

      // 15. Verify deletion
      const resVerifyDel = await makeRequest({
        method: 'GET',
        path: `/api/assignments/${createdAssignmentId}`,
        headers: { Authorization: `Bearer ${instructorAlexToken}` }
      });
      record(
        `GET /api/assignments/${createdAssignmentId} after deletion`,
        resVerifyDel.statusCode === 404,
        `Status ${resVerifyDel.statusCode} (Successfully removed)`
      );

      console.log('\n======================================================');
      const passCount = results.filter(r => r.passed).length;
      console.log(`TOTAL: ${results.length} | PASSED: ${passCount} | FAILED: ${results.length - passCount}`);
      console.log('======================================================');
    } catch (err) {
      console.error('Test execution error:', err);
    } finally {
      server.close(() => {
        db.end().then(() => {
          console.log('\nDatabase connection and test server closed cleanly.');
          process.exit(0);
        });
      });
    }
  });
}

runTests();
