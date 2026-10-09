import React, { useState, useEffect } from 'react';
import { Lesson, LessonFormData } from '../types/lesson';
import { lessonApi } from '../services/lessonApi';
import { LessonList } from '../components/LessonList';
import { LessonForm } from '../components/LessonForm';
import { Plus, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const LessonsPage: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchLessons = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await lessonApi.getLessons();
      setLessons(data);
    } catch (err: any) {
      console.error('Failed to load lessons:', err);
      setError(err.response?.data?.message || err.message || 'Không thể kết nối tới máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleOpenCreateModal = () => {
    setLessonToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (lesson: Lesson) => {
    setLessonToEdit(lesson);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setLessonToEdit(null);
  };

  const handleFormSubmit = async (formData: LessonFormData) => {
    setIsSubmitting(true);
    try {
      if (lessonToEdit) {
        await lessonApi.updateLesson(lessonToEdit.id, formData);
        showToast(`Cập nhật bài học "${formData.title}" thành công!`, 'success');
      } else {
        await lessonApi.createLesson(formData);
        showToast(`Thêm bài học "${formData.title}" thành công!`, 'success');
      }
      handleCloseForm();
      await fetchLessons();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Thao tác thất bại';
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (id: number) => {
    try {
      await lessonApi.deleteLesson(id);
      showToast('Xóa bài học thành công!', 'success');
      await fetchLessons();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa bài học';
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
          <h2 className="page-title">Quản lý bài học</h2>
          <p className="page-subtitle">Quản lý các bài học và chương trình giảng dạy của khóa học</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchLessons} title="Làm mới danh sách">
            <RefreshCw size={18} /> Làm mới
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={20} /> Thêm bài học
          </button>
        </div>
      </div>

      <LessonList
        lessons={lessons}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteLesson}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchLessons}
      />

      {isFormOpen && (
        <LessonForm
          lessonToEdit={lessonToEdit}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
