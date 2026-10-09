import React, { useState, useEffect } from 'react';
import { Course, CourseFormData } from '../types/course';
import { X, Save, AlertCircle } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

interface CourseFormProps {
  courseToEdit?: Course | null;
  onSubmit: (formData: CourseFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const CATEGORIES = [
  'Web Development',
  'Data Science & AI',
  'Mobile Development',
  'UI/UX Design & Product',
  'DevOps & Cloud',
  'Cyber Security'
];

export const CourseForm: React.FC<CourseFormProps> = ({
  courseToEdit,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const { user } = useAuth();
  const isInstructor = user?.role === 'instructor';

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    instructor: isInstructor && user ? user.name : '',
    price: 0,
    category: '',
    thumbnail: '',
    status: 'published'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        title: courseToEdit.title,
        description: courseToEdit.description,
        instructor: courseToEdit.instructor,
        price: courseToEdit.price,
        category: courseToEdit.category,
        thumbnail: courseToEdit.thumbnail || '',
        status: courseToEdit.status || 'published'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        instructor: isInstructor && user ? user.name : '',
        price: 0,
        category: '',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
        status: 'published'
      });
    }
    setErrors({});
    setGeneralError(null);
  }, [courseToEdit, isInstructor, user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tên khóa học không được để trống';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả khóa học không được để trống';
    }

    if (!formData.instructor.trim()) {
      newErrors.instructor = 'Tên giảng viên không được để trống';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Danh mục không được để trống';
    }

    const priceNum = Number(formData.price);
    if (formData.price === '' || isNaN(priceNum) || priceNum < 0) {
      newErrors.price = 'Giá khóa học phải là một số không âm hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
          <h2>{courseToEdit ? 'Cập nhật khóa học' : 'Thêm mới khóa học'}</h2>
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
            <label htmlFor="title">Tên khóa học <span className="required">*</span></label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Ví dụ: Full-Stack Web Development với React & Node.js"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="instructor">
                Giảng viên phụ trách <span className="required">*</span>
                {isInstructor && <small style={{ color: '#64748b', marginLeft: '6px' }}>(Tài khoản của bạn)</small>}
              </label>
              <input
                type="text"
                id="instructor"
                name="instructor"
                placeholder="Ví dụ: Dr. Alex Morgan"
                value={formData.instructor}
                onChange={handleChange}
                disabled={isInstructor}
                className={errors.instructor ? 'input-error' : ''}
                style={isInstructor ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed' } : undefined}
              />
              {errors.instructor && <span className="field-error">{errors.instructor}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Danh mục <span className="required">*</span></label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? 'input-error' : ''}
              >
                <option value="">-- Chọn danh mục --</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <span className="field-error">{errors.category}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Giá học phí ($ USD) <span className="required">*</span></label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                className={errors.price ? 'input-error' : ''}
              />
              {errors.price && <span className="field-error">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="status">Trạng thái phát hành</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="published">Xuất bản công khai (Published)</option>
                <option value="draft">Bản nháp (Draft)</option>
                <option value="archived">Lưu trữ (Archived)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="thumbnail">Ảnh bìa khóa học (Thumbnail URL)</label>
            <input
              type="text"
              id="thumbnail"
              name="thumbnail"
              placeholder="https://images.unsplash.com/..."
              value={formData.thumbnail || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả khóa học <span className="required">*</span></label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Nhập mô tả chi tiết nội dung khóa học..."
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'input-error' : ''}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
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
                : courseToEdit
                ? 'Cập nhật'
                : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
