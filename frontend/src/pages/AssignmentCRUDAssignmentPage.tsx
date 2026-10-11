import React, { useState, useEffect, useCallback } from 'react';
import { Assignment, AssignmentFormData } from '../types/assignment';
import { assignmentApi } from '../services/assignmentApi';
import {
  AssignmentActionBar,
  AssignmentDataTable,
  AssignmentDrawerForm,
  AssignmentDeleteDialog,
  AssignmentDetailDrawer
} from '../components/individual-assignment-crud';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const AssignmentCRUDAssignmentPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const canManage = isAuthenticated && (user?.role === 'admin' || user?.role === 'instructor');

  // State Management
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Drawer State (Create / Edit)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<Assignment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delete Dialog State
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // View Details Drawer State
  const [assignmentToView, setAssignmentToView] = useState<Assignment | null>(null);

  // Toast State
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch Assignments List (GET /api/assignments)
  const fetchAssignments = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setIsRefreshing(true);
    setError(null);
    try {
      const data = await assignmentApi.getAssignments();
      setAssignments(data);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách bài tập:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể kết nối tới máy chủ';
      setError(msg);
      showToast(`Không thể tải dữ liệu: ${msg}`, 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Open Create Drawer
  const handleOpenCreate = () => {
    if (!canManage) {
      showToast('Chỉ Quản trị viên và Giảng viên mới có quyền tạo bài tập', 'error');
      return;
    }
    setAssignmentToEdit(null);
    setIsFormOpen(true);
  };

  // Open Edit Drawer
  const handleOpenEdit = (assignment: Assignment) => {
    if (!canManage) {
      showToast('Bạn không có quyền chỉnh sửa bài tập này', 'error');
      return;
    }
    setAssignmentToEdit(assignment);
    setIsFormOpen(true);
  };

  // Close Form Drawer
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setAssignmentToEdit(null);
  };

  // Open View Details Drawer (GET /api/assignments/:id)
  const handleViewAssignment = async (item: Assignment) => {
    try {
      const singleData = await assignmentApi.getAssignmentById(item.id);
      setAssignmentToView(singleData);
    } catch (err: any) {
      setAssignmentToView(item);
    }
  };

  // Close View Details Drawer
  const handleCloseView = () => {
    setAssignmentToView(null);
  };

  // Open Delete Confirmation Dialog
  const handleOpenDelete = (assignment: Assignment) => {
    if (!canManage) {
      showToast('Bạn không có quyền xóa bài tập này', 'error');
      return;
    }
    setAssignmentToDelete(assignment);
    setIsDeleteOpen(true);
  };

  // Close Delete Confirmation Dialog
  const handleCloseDelete = () => {
    if (isDeleting) return;
    setIsDeleteOpen(false);
    setAssignmentToDelete(null);
  };

  // Handle Form Submission (Create or Update)
  const handleFormSubmit = async (formData: AssignmentFormData) => {
    setIsSubmitting(true);
    try {
      if (assignmentToEdit) {
        // PUT /api/assignments/:id
        await assignmentApi.updateAssignment(assignmentToEdit.id, formData);
        showToast(`Cập nhật bài tập "${formData.title}" thành công!`, 'success');
      } else {
        // POST /api/assignments
        await assignmentApi.createAssignment(formData);
        showToast(`Tạo bài tập "${formData.title}" thành công!`, 'success');
      }
      handleCloseForm();
      await fetchAssignments(true);
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.message || 'Thao tác không thành công';
      if (err.response?.status === 401 || err.response?.status === 403) {
        showToast(serverMsg, 'error');
      }
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation (DELETE /api/assignments/:id)
  const handleConfirmDelete = async () => {
    if (!assignmentToDelete) return;
    setIsDeleting(true);
    try {
      await assignmentApi.deleteAssignment(assignmentToDelete.id);
      showToast(`Đã xóa bài tập "${assignmentToDelete.title}" thành công!`, 'success');
      handleCloseDelete();
      await fetchAssignments(true);
    } catch (err: any) {
      console.error('Lỗi xóa bài tập:', err);
      const serverMsg = err.response?.data?.message || err.message || 'Không thể xóa bài tập';
      showToast(serverMsg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-container individual-crud-page">
      {/* Toast Notification Container */}
      {toast && (
        <div
          className={`toast toast-${toast.type}`}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {toast.type === 'success' && <CheckCircle2 size={20} />}
          {toast.type === 'error' && <AlertCircle size={20} />}
          {toast.type === 'info' && <Info size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Action Bar Header */}
      <AssignmentActionBar
        totalCount={assignments.length}
        onRefresh={() => fetchAssignments(false)}
        onOpenCreate={handleOpenCreate}
        isRefreshing={isRefreshing}
        canManage={canManage}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="state-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '6px' }}>
            Đang tải danh sách bài tập...
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Vui lòng chờ trong giây lát
          </p>
        </div>
      )}

      {/* Global Error State */}
      {!isLoading && error && (
        <div className="state-card state-error" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <AlertCircle size={44} color="#dc2626" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#991b1b', marginBottom: '8px' }}>
            Không thể tải danh sách bài tập
          </h3>
          <p style={{ color: '#b91c1c', maxWidth: '500px', margin: '0 auto 18px', fontSize: '0.92rem' }}>
            {error}
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fetchAssignments(false)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
          >
            <Info size={16} />
            <span>Thử tải lại</span>
          </button>
        </div>
      )}

      {/* Assignment Data Table */}
      {!isLoading && !error && (
        <AssignmentDataTable
          assignments={assignments}
          onView={handleViewAssignment}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          canManage={canManage}
          currentUserId={user?.id}
          userRole={user?.role}
        />
      )}

      {/* Slide-over Drawer: Create & Edit Assignment */}
      <AssignmentDrawerForm
        assignmentToEdit={assignmentToEdit}
        isOpen={isFormOpen}
        isSubmitting={isSubmitting}
        onSubmit={handleFormSubmit}
        onClose={handleCloseForm}
      />

      {/* Confirmation Dialog: Delete Assignment */}
      <AssignmentDeleteDialog
        assignment={assignmentToDelete}
        isOpen={isDeleteOpen}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDelete}
      />

      {/* Slide-over Drawer: View Assignment Details */}
      <AssignmentDetailDrawer
        assignment={assignmentToView}
        onClose={handleCloseView}
      />
    </div>
  );
};
