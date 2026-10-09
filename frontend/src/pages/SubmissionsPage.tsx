import React, { useState, useEffect } from 'react';
import { Submission, SubmissionFormData } from '../types/submission';
import { submissionApi } from '../services/submissionApi';
import { SubmissionList } from '../components/SubmissionList';
import { SubmissionForm } from '../components/SubmissionForm';
import { Plus, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const SubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [submissionToEdit, setSubmissionToEdit] = useState<Submission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await submissionApi.getSubmissions();
      setSubmissions(data);
    } catch (err: any) {
      console.error('Failed to load submissions:', err);
      setError(err.response?.data?.message || err.message || 'Không thể kết nối tới máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleOpenCreateModal = () => {
    setSubmissionToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (submission: Submission) => {
    setSubmissionToEdit(submission);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSubmissionToEdit(null);
  };

  const handleFormSubmit = async (formData: SubmissionFormData) => {
    setIsSubmitting(true);
    try {
      if (submissionToEdit) {
        await submissionApi.updateSubmission(submissionToEdit.id, formData);
        showToast('Cập nhật bài nộp / chấm điểm thành công!', 'success');
      } else {
        await submissionApi.createSubmission(formData);
        showToast('Nộp bài tập mới thành công!', 'success');
      }
      handleCloseForm();
      await fetchSubmissions();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Thao tác thất bại';
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmission = async (id: number) => {
    try {
      await submissionApi.deleteSubmission(id);
      showToast('Xóa bài nộp thành công!', 'success');
      await fetchSubmissions();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa bài nộp';
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
          <h2 className="page-title">Quản lý bài nộp</h2>
          <p className="page-subtitle">Theo dõi danh sách nộp bài và chấm điểm học viên</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchSubmissions} title="Làm mới danh sách">
            <RefreshCw size={18} /> Làm mới
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={20} /> Nộp bài tập
          </button>
        </div>
      </div>

      <SubmissionList
        submissions={submissions}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteSubmission}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchSubmissions}
      />

      {isFormOpen && (
        <SubmissionForm
          submissionToEdit={submissionToEdit}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
