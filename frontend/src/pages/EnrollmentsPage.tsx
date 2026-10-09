import React, { useState, useEffect } from 'react';
import { Enrollment, EnrollmentFormData } from '../types/enrollment';
import { enrollmentApi } from '../services/enrollmentApi';
import { EnrollmentList } from '../components/EnrollmentList';
import { EnrollmentForm } from '../components/EnrollmentForm';
import { Plus, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const EnrollmentsPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [enrollmentToEdit, setEnrollmentToEdit] = useState<Enrollment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchEnrollments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await enrollmentApi.getEnrollments();
      setEnrollments(data);
    } catch (err: any) {
      console.error('Failed to load enrollments:', err);
      setError(err.response?.data?.message || err.message || 'Không thể kết nối tới máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleOpenCreateModal = () => {
    setEnrollmentToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (enrollment: Enrollment) => {
    setEnrollmentToEdit(enrollment);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEnrollmentToEdit(null);
  };

  const handleFormSubmit = async (formData: EnrollmentFormData) => {
    setIsSubmitting(true);
    try {
      if (enrollmentToEdit) {
        await enrollmentApi.updateEnrollment(enrollmentToEdit.id, formData);
        showToast('Cập nhật lượt đăng ký thành công!', 'success');
      } else {
        await enrollmentApi.createEnrollment(formData);
        showToast('Tạo lượt đăng ký khóa học mới thành công!', 'success');
      }
      handleCloseForm();
      await fetchEnrollments();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Thao tác thất bại';
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEnrollment = async (id: number) => {
    try {
      await enrollmentApi.deleteEnrollment(id);
      showToast('Xóa lượt đăng ký thành công!', 'success');
      await fetchEnrollments();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa lượt đăng ký';
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
          <h2 className="page-title">Quản lý đăng ký học</h2>
          <p className="page-subtitle">Theo dõi lượt ghi danh và trạng thái học tập của học viên</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchEnrollments} title="Làm mới danh sách">
            <RefreshCw size={18} /> Làm mới
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={20} /> Đăng ký học viên
          </button>
        </div>
      </div>

      <EnrollmentList
        enrollments={enrollments}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteEnrollment}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchEnrollments}
      />

      {isFormOpen && (
        <EnrollmentForm
          enrollmentToEdit={enrollmentToEdit}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
