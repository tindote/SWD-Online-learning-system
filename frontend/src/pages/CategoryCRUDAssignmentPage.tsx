import React, { useState, useEffect, useCallback } from 'react';
import { Category, CategoryFormData } from '../types/category';
import { categoryApi } from '../services/categoryApi';
import {
  IndividualCategoryHeader,
  IndividualCategoryTable,
  IndividualCategoryFormModal,
  IndividualCategoryDeleteModal,
  IndividualCategoryDetailModal
} from '../components/individual-category-crud';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const CategoryCRUDAssignmentPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // State Management
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form Modal State (Create / Edit)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // View Details Modal State
  const [categoryToView, setCategoryToView] = useState<Category | null>(null);

  // Feedback Toast State
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

  // Fetch Categories List (GET /api/categories)
  const fetchCategories = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setIsRefreshing(true);
    setError(null);
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách danh mục:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể kết nối đến máy chủ API';
      setError(msg);
      showToast(`Không thể tải dữ liệu: ${msg}`, 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Open Create Modal
  const handleOpenCreate = () => {
    if (!isAdmin) {
      showToast('Cần đăng nhập với tài khoản Quản trị viên (Admin) để tạo mới danh mục', 'info');
    }
    setCategoryToEdit(null);
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (category: Category) => {
    if (!isAdmin) {
      showToast('Cần đăng nhập với tài khoản Quản trị viên (Admin) để chỉnh sửa danh mục', 'info');
    }
    setCategoryToEdit(category);
    setIsFormOpen(true);
  };

  // Close Form Modal
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCategoryToEdit(null);
  };

  // Open View Details Modal (GET /api/categories/:id)
  const handleViewCategory = async (cat: Category) => {
    try {
      const singleData = await categoryApi.getCategoryById(cat.id);
      setCategoryToView(singleData);
    } catch (err: any) {
      setCategoryToView(cat);
    }
  };

  // Close View Details Modal
  const handleCloseView = () => {
    setCategoryToView(null);
  };

  // Open Delete Confirmation Modal
  const handleOpenDelete = (category: Category) => {
    if (!isAdmin) {
      showToast('Cần quyền Quản trị viên (Admin) để xóa danh mục này', 'info');
    }
    setCategoryToDelete(category);
    setIsDeleteOpen(true);
  };

  // Close Delete Confirmation Modal
  const handleCloseDelete = () => {
    if (isDeleting) return;
    setIsDeleteOpen(false);
    setCategoryToDelete(null);
  };

  // Handle Form Submission (Create or Update)
  const handleFormSubmit = async (formData: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      if (categoryToEdit) {
        // PUT /api/categories/:id
        await categoryApi.updateCategory(categoryToEdit.id, formData);
        showToast(`Cập nhật danh mục "${formData.name}" thành công!`, 'success');
      } else {
        // POST /api/categories
        await categoryApi.createCategory(formData);
        showToast(`Thêm danh mục "${formData.name}" thành công!`, 'success');
      }
      handleCloseForm();
      await fetchCategories(true);
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.message || 'Thao tác không thành công';
      if (err.response?.status === 401 || err.response?.status === 403) {
        showToast('Từ chối truy cập: Thao tác này yêu cầu tài khoản Quản trị viên (Admin)', 'error');
      }
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation (DELETE /api/categories/:id)
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await categoryApi.deleteCategory(categoryToDelete.id);
      showToast(`Đã xóa danh mục "${categoryToDelete.name}" thành công!`, 'success');
      handleCloseDelete();
      await fetchCategories(true);
    } catch (err: any) {
      console.error('Lỗi xóa danh mục:', err);
      const serverMsg = err.response?.data?.message || err.message || 'Không thể xóa danh mục';
      if (err.response?.status === 401 || err.response?.status === 403) {
        showToast('Từ chối truy cập: Chỉ Quản trị viên (Admin) mới có quyền xóa danh mục', 'error');
      } else {
        showToast(serverMsg, 'error');
      }
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

      {/* Clean Page Header */}
      <IndividualCategoryHeader
        totalCount={categories.length}
        onRefresh={() => fetchCategories(false)}
        onOpenCreate={handleOpenCreate}
        isRefreshing={isRefreshing}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="state-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '6px' }}>
            Đang tải dữ liệu danh mục...
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
            Không thể tải danh sách danh mục
          </h3>
          <p style={{ color: '#b91c1c', maxWidth: '500px', margin: '0 auto 18px', fontSize: '0.92rem' }}>
            {error}
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fetchCategories(false)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
          >
            <Info size={16} />
            <span>Thử tải lại</span>
          </button>
        </div>
      )}

      {/* Category Table & Actions */}
      {!isLoading && !error && (
        <IndividualCategoryTable
          categories={categories}
          onView={handleViewCategory}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          isAdmin={isAdmin}
        />
      )}

      {/* Modal: Create & Edit Category */}
      <IndividualCategoryFormModal
        categoryToEdit={categoryToEdit}
        isOpen={isFormOpen}
        isSubmitting={isSubmitting}
        onSubmit={handleFormSubmit}
        onClose={handleCloseForm}
      />

      {/* Modal: Delete Confirmation */}
      <IndividualCategoryDeleteModal
        category={categoryToDelete}
        isOpen={isDeleteOpen}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDelete}
      />

      {/* Modal: View Category Details */}
      <IndividualCategoryDetailModal
        category={categoryToView}
        onClose={handleCloseView}
      />
    </div>
  );
};
