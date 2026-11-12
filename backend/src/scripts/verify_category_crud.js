const http = require('http');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_online_learning_2026_fa';
const PORT = 5000;

// Generate test tokens
const adminToken = jwt.sign(
  { id: 5, email: 'cuong.le@example.com', role: 'admin' },
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
  console.log('====================================================');
  console.log('   CATEGORY CRUD COMPREHENSIVE VERIFICATION SUITE   ');
  console.log('====================================================\n');

  const app = require('../app');
  const server = app.listen(PORT, async () => {
    console.log(`Ephemeral test server started on http://localhost:${PORT}\n`);
    const results = [];

    const record = (name, passed, detail) => {
      results.push({ name, passed, detail });
      console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name}`);
      if (detail) console.log(`   └─ ${detail}`);
    };

    let createdCategoryId = null;
    const testCategoryName = `Test_Category_${Date.now()}`;

    try {
      // 1. Read all categories
      const resList = await makeRequest({ method: 'GET', path: '/api/categories' });
      record(
        'GET /api/categories (Read all)',
        resList.statusCode === 200 && Array.isArray(resList.data?.data) && resList.data.data.length > 0,
        `Status ${resList.statusCode}, Count: ${resList.data?.data?.length || 0} categories`
      );

      // 2. Read one category by ID
      const firstId = resList.data?.data?.[0]?.id || 1;
      const resOne = await makeRequest({ method: 'GET', path: `/api/categories/${firstId}` });
      record(
        `GET /api/categories/:id (Read one ID #${firstId})`,
        resOne.statusCode === 200 && resOne.data?.data?.id === firstId,
        `Status ${resOne.statusCode}, Name: "${resOne.data?.data?.name}"`
      );

      // 3. Non-existent category ID
      const resNotFound = await makeRequest({ method: 'GET', path: '/api/categories/999999' });
      record(
        'GET /api/categories/999999 (Non-existent ID)',
        resNotFound.statusCode === 404 && resNotFound.data?.success === false,
        `Status ${resNotFound.statusCode}, Message: "${resNotFound.data?.message}"`
      );

      // 4. Invalid category ID format
      const resInvalidId = await makeRequest({ method: 'GET', path: '/api/categories/not-a-number' });
      record(
        'GET /api/categories/not-a-number (Invalid ID format)',
        resInvalidId.statusCode === 400 && resInvalidId.data?.success === false,
        `Status ${resInvalidId.statusCode}, Message: "${resInvalidId.data?.message}"`
      );

      // 5. Unauthorized modification attempt (No Token)
      const resNoToken = await makeRequest({
        method: 'POST',
        path: '/api/categories',
        body: { name: 'Unauthorized Category' }
      });
      record(
        'POST /api/categories without token (Unauthorized attempt)',
        resNoToken.statusCode === 401,
        `Status ${resNoToken.statusCode}, Message: "${resNoToken.data?.message}"`
      );

      // 6. Forbidden modification attempt (Student Token)
      const resStudent = await makeRequest({
        method: 'POST',
        path: '/api/categories',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: { name: 'Student Forbidden Category' }
      });
      record(
        'POST /api/categories with Student role (Forbidden attempt)',
        resStudent.statusCode === 403,
        `Status ${resStudent.statusCode}, Message: "${resStudent.data?.message}"`
      );

      // 7. Invalid or missing fields
      const resEmptyName = await makeRequest({
        method: 'POST',
        path: '/api/categories',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { name: '   ', description: 'Blank name' }
      });
      record(
        'POST /api/categories with empty name (Input validation)',
        resEmptyName.statusCode === 400 && resEmptyName.data?.errors?.length > 0,
        `Status ${resEmptyName.statusCode}, Errors: [${resEmptyName.data?.errors?.join(', ')}]`
      );

      // 8. Create a valid category (Admin)
      const resCreate = await makeRequest({
        method: 'POST',
        path: '/api/categories',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: testCategoryName,
          description: 'A category created for verification'
        }
      });
      createdCategoryId = resCreate.data?.data?.id;
      record(
        'POST /api/categories (Create category as Admin)',
        resCreate.statusCode === 201 && createdCategoryId != null,
        `Status ${resCreate.statusCode}, ID: #${createdCategoryId}, Name: "${resCreate.data?.data?.name}"`
      );

      // 9. Duplicate category name
      const resDuplicate = await makeRequest({
        method: 'POST',
        path: '/api/categories',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: testCategoryName,
          description: 'Trying duplicate name'
        }
      });
      record(
        'POST /api/categories (Duplicate category name check)',
        resDuplicate.statusCode === 400 && resDuplicate.data?.message?.includes('already exists'),
        `Status ${resDuplicate.statusCode}, Message: "${resDuplicate.data?.message}"`
      );

      // 10. Update a category (Admin)
      const updatedName = `${testCategoryName}_Updated`;
      const resUpdate = await makeRequest({
        method: 'PUT',
        path: `/api/categories/${createdCategoryId}`,
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: updatedName,
          description: 'Updated description for verified category'
        }
      });
      record(
        `PUT /api/categories/${createdCategoryId} (Update category as Admin)`,
        resUpdate.statusCode === 200 && resUpdate.data?.data?.name === updatedName,
        `Status ${resUpdate.statusCode}, Name: "${resUpdate.data?.data?.name}"`
      );

      // 11. Duplicate category name on update
      const existingName = resList.data?.data?.[0]?.name;
      if (existingName) {
        const resDupUpdate = await makeRequest({
          method: 'PUT',
          path: `/api/categories/${createdCategoryId}`,
          headers: { Authorization: `Bearer ${adminToken}` },
          body: {
            name: existingName,
            description: 'Trying to update to another existing category name'
          }
        });
        record(
          'PUT /api/categories/:id (Duplicate name collision on update)',
          resDupUpdate.statusCode === 400 && resDupUpdate.data?.message?.includes('already exists'),
          `Status ${resDupUpdate.statusCode}, Message: "${resDupUpdate.data?.message}"`
        );
      }

      // 12. Delete category (Admin)
      const resDelete = await makeRequest({
        method: 'DELETE',
        path: `/api/categories/${createdCategoryId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      record(
        `DELETE /api/categories/${createdCategoryId} (Delete category as Admin)`,
        resDelete.statusCode === 200,
        `Status ${resDelete.statusCode}, Message: "${resDelete.data?.message}"`
      );

      // 13. Verify deletion
      const resVerifyDel = await makeRequest({
        method: 'GET',
        path: `/api/categories/${createdCategoryId}`
      });
      record(
        `GET /api/categories/${createdCategoryId} after deletion`,
        resVerifyDel.statusCode === 404,
        `Status ${resVerifyDel.statusCode} (Properly not found)`
      );

      // 14. Delete non-existent category
      const resDelNotFound = await makeRequest({
        method: 'DELETE',
        path: `/api/categories/${createdCategoryId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      record(
        'DELETE /api/categories/:id on already deleted ID',
        resDelNotFound.statusCode === 404,
        `Status ${resDelNotFound.statusCode}, Message: "${resDelNotFound.data?.message}"`
      );

      console.log('\n====================================================');
      const passCount = results.filter(r => r.passed).length;
      console.log(`TOTAL: ${results.length} | PASSED: ${passCount} | FAILED: ${results.length - passCount}`);
      console.log('====================================================');
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
