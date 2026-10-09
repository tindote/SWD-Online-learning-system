import React, { useState, useEffect } from 'react';
import { Category, CategoryFormData } from '../types/category';
import { X, Save, AlertCircle } from 'lucide-react';

interface CategoryFormProps {
  categoryToEdit?: Category | null;
  onSubmit: (formData: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  categoryToEdit,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        name: categoryToEdit.name,
        description: categoryToEdit.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
    setErrors({});
    setGeneralError(null);
  }, [categoryToEdit]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên danh mục không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.message || 'Đã xảy ra lỗi';
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && Array.isArray(serverErrors)) {
        setGeneralError(serverErrors.join(', '));
      } else {
        setGeneralError(serverMsg);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2>{categoryToEdit ? 'Cập nhật danh mục' : 'Thêm mới danh mục'}</h2>
          <button className="icon-btn" onClick={onCancel} title="Đóng biểu mẫu" type="button">
            <X size={20} />
          </button>
        </div>

        {generalError && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Tên danh mục <span className="required">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Ví dụ: Web Development"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả danh mục</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Ví dụ: Các khóa học liên quan đến lập trình web..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <Save size={18} />
              {isSubmitting
                ? 'Đang lưu...'
                : categoryToEdit
                ? 'Cập nhật'
                : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
