import React, { useState, useEffect } from 'react';
import { Assignment, AssignmentFormData } from '../types/assignment';
import { assignmentApi } from '../services/assignmentApi';
import { AssignmentList } from '../components/AssignmentList';
import { AssignmentForm } from '../components/AssignmentForm';
import { Plus, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<Assignment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await assignmentApi.getAssignments();
      setAssignments(data);
    } catch (err: any) {
      console.error('Failed to load assignments:', err);
      setError(err.response?.data?.message || err.message || 'Không thể kết nối tới máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleOpenCreateModal = () => {
    setAssignmentToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (assignment: Assignment) => {
    setAssignmentToEdit(assignment);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setAssignmentToEdit(null);
  };

  const handleFormSubmit = async (formData: AssignmentFormData) => {
    setIsSubmitting(true);
    try {
      if (assignmentToEdit) {
        await assignmentApi.updateAssignment(assignmentToEdit.id, formData);
        showToast(`Cập nhật bài tập "${formData.title}" thành công!`, 'success');
      } else {
        await assignmentApi.createAssignment(formData);
        showToast(`Thêm bài tập "${formData.title}" thành công!`, 'success');
      }
      handleCloseForm();
      await fetchAssignments();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Thao tác thất bại';
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    try {
      await assignmentApi.deleteAssignment(id);
      showToast('Xóa bài tập thành công!', 'success');
      await fetchAssignments();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa bài tập';
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
          <h2 className="page-title">Quản lý bài tập</h2>
          <p className="page-subtitle">Quản lý bài kiểm tra và yêu cầu bài tập cho các khóa học</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchAssignments} title="Làm mới danh sách">
            <RefreshCw size={18} /> Làm mới
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={20} /> Thêm bài tập
          </button>
        </div>
      </div>

      <AssignmentList
        assignments={assignments}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteAssignment}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchAssignments}
      />

      {isFormOpen && (
        <AssignmentForm
          assignmentToEdit={assignmentToEdit}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
