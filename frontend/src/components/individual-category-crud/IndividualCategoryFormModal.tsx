import React, { useState, useEffect } from 'react';
import { Category, CategoryFormData } from '../../types/category';
import { X, Save, AlertCircle, Tag, FileText, CheckCircle2 } from 'lucide-react';

interface IndividualCategoryFormModalProps {
  categoryToEdit?: Category | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onSubmit: (formData: CategoryFormData) => Promise<void>;
  onClose: () => void;
}

export const IndividualCategoryFormModal: React.FC<IndividualCategoryFormModalProps> = ({
  categoryToEdit,
  isOpen,
  isSubmitting,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: ''
  });

  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ name?: boolean; description?: boolean }>({});

  const isEditing = Boolean(categoryToEdit);

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        name: categoryToEdit.name || '',
        description: categoryToEdit.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
    setErrors({});
    setServerError(null);
    setTouched({});
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = (data: CategoryFormData) => {
    const newErrors: { name?: string; description?: string } = {};

    const trimmedName = data.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Tên danh mục là bắt buộc và không được để trống';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Tên danh mục phải có ít nhất 2 ký tự';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Tên danh mục không được vượt quá 100 ký tự';
    }

    if (data.description && data.description.length > 1000) {
      newErrors.description = 'Mô tả không được vượt quá 1000 ký tự';
    }

    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updated = {
      ...formData,
      [name]: value
    };
    setFormData(updated);

    if (serverError) {
      setServerError(null);
    }

    if (touched[name as keyof CategoryFormData]) {
      const validationErrors = validate(updated);
      setErrors((prev) => ({
        ...prev,
        [name]: validationErrors[name as keyof CategoryFormData]
      }));
    }
  };

  const handleBlur = (name: keyof CategoryFormData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const validationErrors = validate(formData);
    setErrors((prev) => ({
      ...prev,
      [name]: validationErrors[name]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setTouched({ name: true, description: true });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description ? formData.description.trim() : ''
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Thao tác không thành công';
      const detailErrors = err.response?.data?.errors;
      if (Array.isArray(detailErrors) && detailErrors.length > 0) {
        setServerError(detailErrors.join(', '));
      } else {
        setServerError(msg);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={isSubmitting ? undefined : onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', width: '92%' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: isEditing ? 'rgba(56, 189, 248, 0.15)' : 'var(--primary-light)',
              color: isEditing ? '#0284c7' : 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Tag size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>
                {isEditing ? `Cập nhật danh mục #${categoryToEdit?.id}` : 'Thêm mới danh mục khóa học'}
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {isEditing ? 'Chỉnh sửa thông tin tên và mô tả danh mục' : 'Điền đầy đủ thông tin để tạo phân loại khóa học mới'}
              </span>
            </div>
          </div>

          <button
            className="icon-btn"
            onClick={onClose}
            disabled={isSubmitting}
            title="Đóng biểu mẫu"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {serverError && (
          <div className="alert alert-error" style={{ margin: '16px 0 0 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.9rem' }}>
              <strong>Lỗi:</strong> {serverError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ marginTop: '16px' }}>
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="category-name" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Tên danh mục <span className="required" style={{ color: '#ef4444' }}>*</span>
              </label>
              <span style={{ fontSize: '0.78rem', color: formData.name.length > 100 ? '#ef4444' : 'var(--text-light)' }}>
                {formData.name.length}/100 ký tự
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                id="category-name"
                name="name"
                placeholder="Ví dụ: Lập trình Web Full-Stack, AI & Data Science..."
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
                disabled={isSubmitting}
                className={errors.name ? 'input-error' : ''}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: errors.name ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  fontSize: '0.92rem',
                  outline: 'none',
                  backgroundColor: isSubmitting ? 'var(--bg-subtle)' : '#ffffff'
                }}
                autoFocus
              />
            </div>

            {errors.name && (
              <span className="field-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={14} />
                {errors.name}
              </span>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="category-description" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Mô tả chi tiết
              </label>
              <span style={{ fontSize: '0.78rem', color: formData.description.length > 1000 ? '#ef4444' : 'var(--text-light)' }}>
                {formData.description.length}/1000 ký tự
              </span>
            </div>

            <textarea
              id="category-description"
              name="description"
              rows={4}
              placeholder="Nhập mô tả tóm tắt về lĩnh vực hoặc mục tiêu của danh mục này..."
              value={formData.description}
              onChange={handleChange}
              onBlur={() => handleBlur('description')}
              disabled={isSubmitting}
              className={errors.description ? 'input-error' : ''}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: errors.description ? '1px solid #ef4444' : '1px solid var(--border-color)',
                fontSize: '0.92rem',
                outline: 'none',
                resize: 'vertical',
                minHeight: '90px',
                backgroundColor: isSubmitting ? 'var(--bg-subtle)' : '#ffffff',
                lineHeight: 1.5
              }}
            />

            {errors.description && (
              <span className="field-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={14} />
                {errors.description}
              </span>
            )}
          </div>

          <div className="modal-actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px'
              }}
            >
              <Save size={18} />
              {isSubmitting
                ? 'Đang lưu...'
                : isEditing
                ? 'Cập nhật danh mục'
                : 'Tạo danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
