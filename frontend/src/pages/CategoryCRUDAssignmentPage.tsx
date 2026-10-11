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
import {
  AlertCircle,
  CheckCircle2,
  Info,
  ShieldAlert,
  LogIn,
  Layers,
  Database,
  ExternalLink,
  Code
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

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
    setIsLoadingDetail(true);
    try {
      // Direct call to fetch fresh data by ID
      const singleData = await categoryApi.getCategoryById(cat.id);
      setCategoryToView(singleData);
    } catch (err: any) {
      // Fallback to existing record if network error occurs
      console.warn('Fallback to local category details:', err);
      setCategoryToView(cat);
    } finally {
      setIsLoadingDetail(false);
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
      showToast(`Đã xóa danh mục "${categoryToDelete.name}" (ID #${categoryToDelete.id}) thành công!`, 'success');
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

      {/* Prominent Assignment Header */}
      <IndividualCategoryHeader
        totalCount={categories.length}
        onRefresh={() => fetchCategories(false)}
        onOpenCreate={handleOpenCreate}
        isRefreshing={isRefreshing}
      />

      {/* Admin Notice Banner if not logged in as Admin */}
      {!isAdmin && (
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#dbeafe',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#1e3a8a', fontSize: '0.92rem' }}>
                Chế độ xem thông tin danh mục (Read-only)
              </div>
              <div style={{ color: '#3b82f6', fontSize: '0.84rem' }}>
                Hệ thống yêu cầu quyền <strong>Quản trị viên (Admin)</strong> để thực hiện Thêm, Sửa hoặc Xóa. Để kiểm thử đầy đủ CRUD, vui lòng đăng nhập tài khoản Admin (ví dụ: <code style={{ backgroundColor: '#ffffff', padding: '1px 5px', borderRadius: '4px' }}>cuong.le@example.com</code> / <code style={{ backgroundColor: '#ffffff', padding: '1px 5px', borderRadius: '4px' }}>Password123!</code>).
              </div>
            </div>
          </div>

          <Link
            to="/login"
            className="btn btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '0.86rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none'
            }}
          >
            <LogIn size={16} />
            <span>Đăng nhập Admin</span>
          </Link>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="state-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '6px' }}>
            Đang tải dữ liệu danh mục...
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Đang kết nối tới API <code>/api/categories</code> và nạp danh sách vào bảng dữ liệu
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

      {/* Category Table */}
      {!isLoading && !error && (
        <IndividualCategoryTable
          categories={categories}
          onView={handleViewCategory}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          isAdmin={isAdmin}
        />
      )}

      {/* Assignment Technical Meta & API Endpoint Reference Strip */}
      <div style={{
        marginTop: '8px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '20px 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Database size={18} color="var(--primary-color)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Đặc tả kỹ thuật & Bảng API Endpoints (Member 1)
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
          fontSize: '0.84rem'
        }}>
          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ color: '#16a34a', fontWeight: 700, marginRight: '6px' }}>GET</span>
            <code>/api/categories</code>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>Lấy toàn bộ danh sách danh mục (Công khai)</div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ color: '#16a34a', fontWeight: 700, marginRight: '6px' }}>GET</span>
            <code>/api/categories/:id</code>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>Xem chi tiết danh mục theo ID (Công khai)</div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ color: '#2563eb', fontWeight: 700, marginRight: '6px' }}>POST</span>
            <code>/api/categories</code>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>Tạo danh mục mới (Yêu cầu Admin JWT)</div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ color: '#d97706', fontWeight: 700, marginRight: '6px' }}>PUT</span>
            <code>/api/categories/:id</code>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>Cập nhật danh mục theo ID (Yêu cầu Admin JWT)</div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ color: '#dc2626', fontWeight: 700, marginRight: '6px' }}>DELETE</span>
            <code>/api/categories/:id</code>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>Xóa danh mục theo ID (Yêu cầu Admin JWT)</div>
          </div>
        </div>
      </div>

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
