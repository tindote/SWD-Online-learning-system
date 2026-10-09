import React, { useState, useEffect } from 'react';
import { Category, CategoryFormData } from '../types/category';
import { categoryApi } from '../services/categoryApi';
import { CategoryList } from '../components/CategoryList';
import { CategoryForm } from '../components/CategoryForm';
import { Plus, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      setError(err.response?.data?.message || err.message || 'Không thể kết nối tới máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleOpenCreateModal = () => {
    setCategoryToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setCategoryToEdit(category);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCategoryToEdit(null);
  };

  const handleFormSubmit = async (formData: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      if (categoryToEdit) {
        await categoryApi.updateCategory(categoryToEdit.id, formData);
        showToast(`Cập nhật danh mục "${formData.name}" thành công!`, 'success');
      } else {
        await categoryApi.createCategory(formData);
        showToast(`Thêm danh mục "${formData.name}" thành công!`, 'success');
      }
      handleCloseForm();
      await fetchCategories();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Thao tác thất bại';
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await categoryApi.deleteCategory(id);
      showToast('Xóa danh mục thành công!', 'success');
      await fetchCategories();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa danh mục';
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
          <h2 className="page-title">Quản lý danh mục</h2>
          <p className="page-subtitle">Quản lý các phân loại ngành học và lĩnh vực đào tạo</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchCategories} title="Làm mới danh sách">
            <RefreshCw size={18} /> Làm mới
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={20} /> Thêm danh mục
          </button>
        </div>
      </div>

      <CategoryList
        categories={categories}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteCategory}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchCategories}
      />

      {isFormOpen && (
        <CategoryForm
          categoryToEdit={categoryToEdit}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
