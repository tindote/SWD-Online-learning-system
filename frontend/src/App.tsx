import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { PublicLayout } from './components/PublicLayout';

// Public Pages
import { HomePage } from './pages/HomePage';
import { CourseCatalogPage } from './pages/CourseCatalogPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Student Pages
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { StudentCoursesPage } from './pages/StudentCoursesPage';
import { StudentAssignmentsPage } from './pages/StudentAssignmentsPage';
import { LearningPage } from './pages/LearningPage';

// Instructor Pages
import { InstructorDashboardPage } from './pages/InstructorDashboardPage';
import { InstructorSubmissionsPage } from './pages/InstructorSubmissionsPage';

// Admin & Shared CRUD Pages
import { DashboardPage } from './pages/DashboardPage';
import { CoursesPage } from './pages/CoursesPage';
import { UsersPage } from './pages/UsersPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { LessonsPage } from './pages/LessonsPage';
import { EnrollmentsPage } from './pages/EnrollmentsPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { SubmissionsPage } from './pages/SubmissionsPage';

// User Profile & Settings
import { ProfilePage } from './pages/ProfilePage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';

import './index.css';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* 1. Public Routes with Public Layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CourseCatalogPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* 2. Standalone Distraction-free Classroom for Learning */}
          <Route
            path="/learn/:courseId"
            element={
              <ProtectedRoute>
                <LearningPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/:courseId/lesson/:lessonId"
            element={
              <ProtectedRoute>
                <LearningPage />
              </ProtectedRoute>
            }
          />

          {/* 3. Student / Learning Routes (Accessible to Student, Instructor, and Admin) */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/student/dashboard" element={<Navigate to="/student/courses" replace />} />
            <Route path="/student/courses" element={<StudentCoursesPage />} />
            <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
          </Route>

          {/* 4. Instructor Routes (Protected) */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/instructor/dashboard" element={<Navigate to="/instructor/courses" replace />} />
            <Route path="/instructor/courses" element={<CoursesPage />} />
            <Route path="/instructor/lessons" element={<LessonsPage />} />
            <Route path="/instructor/assignments" element={<AssignmentsPage />} />
            <Route path="/instructor/submissions" element={<InstructorSubmissionsPage />} />
            <Route path="/instructor/enrollments" element={<EnrollmentsPage />} />
          </Route>

          {/* 5. Admin Routes (Protected) */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<Navigate to="/admin/courses" replace />} />
            <Route path="/admin/courses" element={<CoursesPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/categories" element={<CategoriesPage />} />
            <Route path="/admin/lessons" element={<LessonsPage />} />
            <Route path="/admin/enrollments" element={<EnrollmentsPage />} />
            <Route path="/admin/assignments" element={<AssignmentsPage />} />
            <Route path="/admin/submissions" element={<SubmissionsPage />} />
          </Route>

          {/* 6. User Profile & Password (All Authenticated Users) */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>

          {/* 7. Redirect Shortcuts */}
          <Route path="/admin" element={<Navigate to="/admin/courses" replace />} />
          <Route path="/instructor" element={<Navigate to="/instructor/courses" replace />} />
          <Route path="/student" element={<Navigate to="/student/courses" replace />} />

          {/* 8. Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
