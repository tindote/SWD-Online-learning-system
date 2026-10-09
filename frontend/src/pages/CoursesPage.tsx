import React, { useState, useEffect, useCallback } from 'react';
import { Course, CourseFormData } from '../types/course';
import { courseApi } from '../services/courseApi';
import { CourseList } from '../components/CourseList';
import { CourseForm } from '../components/CourseForm';
import { Plus, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CoursesPage: React.FC = () => {
  const { user } = useAuth();
  const isInstructor = user?.role === 'instructor';

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // If logged in as instructor, only fetch courses owned by this instructor
      const data = isInstructor
        ? await courseApi.getMyInstructorCourses()
        : await courseApi.getCourses();
      setCourses(data);
    } catch (err: any) {
      console.error('Failed to load courses:', err);
      setError(err.response?.data?.message || err.message || 'Không thể kết nối tới máy chủ');
    } finally {
      setIsLoading(false);
    }
  }, [isInstructor]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleOpenCreateModal = () => {
    setCourseToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setCourseToEdit(course);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCourseToEdit(null);
  };

  const handleFormSubmit = async (formData: CourseFormData) => {
    setIsSubmitting(true);
    try {
      const payload: CourseFormData = {
        ...formData,
        instructor: isInstructor && user ? user.name : formData.instructor,
        instructor_id: isInstructor && user ? user.id : formData.instructor_id
      };

      if (courseToEdit) {
        await courseApi.updateCourse(courseToEdit.id, payload);
        showToast(`Cập nhật khóa học "${formData.title}" thành công!`, 'success');
      } else {
        await courseApi.createCourse(payload);
        showToast(`Thêm khóa học "${formData.title}" thành công!`, 'success');
      }
      handleCloseForm();
      await fetchCourses();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Thao tác thất bại';
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    try {
      await courseApi.deleteCourse(id);
      showToast('Xóa khóa học thành công!', 'success');
      await fetchCourses();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa khóa học';
      showToast(msg, 'error');
    }
  };

  return (
    <div className="page-container">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="page-header">
        <div>
          <h2 className="page-title">{isInstructor ? 'Khóa học của tôi' : 'Quản lý khóa học'}</h2>
          <p className="page-subtitle">
            {isInstructor
              ? 'Danh sách các khóa học do bạn trực tiếp phụ trách và giảng dạy'
              : 'Quản lý và cập nhật danh sách các khóa học trong hệ thống'}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchCourses} title="Làm mới danh sách">
            <RefreshCw size={18} /> Làm mới
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={20} /> Thêm khóa học
          </button>
        </div>
      </div>

      <CourseList
        courses={courses}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteCourse}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchCourses}
      />

      {isFormOpen && (
        <CourseForm
          courseToEdit={courseToEdit}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
