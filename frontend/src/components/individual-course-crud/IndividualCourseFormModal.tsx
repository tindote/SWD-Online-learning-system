import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  HelpCircle,
  Tag
} from 'lucide-react';
import { Course, CourseFormData } from '../../types/course';
import { Category } from '../../types/category';
import { categoryApi } from '../../services/categoryApi';
import { useAuth } from '../../context/AuthContext';

interface IndividualCourseFormModalProps {
  isOpen: boolean;
  courseToEdit?: Course | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (formData: CourseFormData) => Promise<void>;
}

const DEFAULT_THUMBNAILS = [
  { label: 'Web Dev', url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60' },
  { label: 'Data Science', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60' },
  { label: 'Mobile App', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=60' },
  { label: 'Cloud & DevOps', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60' },
  { label: 'UI/UX Design', url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=60' },
  { label: 'Cyber Security', url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60' }
];

export const IndividualCourseFormModal: React.FC<IndividualCourseFormModalProps> = ({
  isOpen,
  courseToEdit,
  isSubmitting,
  onClose,
  onSubmit
}) => {
  const { user } = useAuth();
  const isInstructor = user?.role === 'instructor';
  const isAdmin = user?.role === 'admin';

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    instructor: isInstructor && user ? user.name : '',
    price: 0,
    category: 'Web Development',
    thumbnail: DEFAULT_THUMBNAILS[0].url,
    status: 'published'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Fetch dynamic categories from Category API
  useEffect(() => {
    if (!isOpen) return;
    const loadCategories = async () => {
      try {
        const list = await categoryApi.getCategories();
        if (list && list.length > 0) {
          setCategories(list);
        }
      } catch (err) {
        // Fallback default categories
        setCategories([
          { id: 1, name: 'Web Development', description: '' },
          { id: 2, name: 'Data Science & AI', description: '' },
          { id: 3, name: 'Mobile Development', description: '' },
          { id: 4, name: 'DevOps & Cloud', description: '' },
          { id: 5, name: 'UI/UX Design & Product', description: '' },
          { id: 6, name: 'Cyber Security', description: '' }
        ]);
      }
    };
    loadCategories();
  }, [isOpen]);

  // Sync edit data
  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        title: courseToEdit.title,
        description: courseToEdit.description,
        instructor: courseToEdit.instructor_name || courseToEdit.instructor,
        instructor_id: courseToEdit.instructor_id,
        price: courseToEdit.price,
        category: courseToEdit.category,
        thumbnail: courseToEdit.thumbnail || DEFAULT_THUMBNAILS[0].url,
        status: courseToEdit.status || 'published'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        instructor: isInstructor && user ? user.name : '',
        instructor_id: isInstructor && user ? user.id : undefined,
        price: 0,
        category: categories.length > 0 ? categories[0].name : 'Web Development',
        thumbnail: DEFAULT_THUMBNAILS[0].url,
        status: 'published'
      });
    }
    setErrors({});
    setGeneralError(null);
  }, [courseToEdit, isOpen, isInstructor, user, categories]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.title.trim()) {
      errs.title = 'Tiêu đề khóa học không được để trống';
    } else if (formData.title.trim().length < 5) {
      errs.title = 'Tiêu đề khóa học phải có ít nhất 5 ký tự';
    }

    if (!formData.description.trim()) {
      errs.description = 'Mô tả khóa học không được để trống';
    } else if (formData.description.trim().length < 15) {
      errs.description = 'Mô tả khóa học nên chi tiết hơn (tối thiểu 15 ký tự)';
    }

    if (!formData.category.trim()) {
      errs.category = 'Vui lòng chọn danh mục cho khóa học';
    }

    if (!formData.instructor.trim()) {
      errs.instructor = 'Tên giảng viên không được để trống';
    }

    const priceNum = Number(formData.price);
    if (formData.price === '' || isNaN(priceNum) || priceNum < 0) {
      errs.price = 'Giá khóa học phải là một số không âm hợp lệ (>= 0)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    try {
      await onSubmit({
        ...formData,
        price: parseFloat(String(formData.price)) || 0,
        instructor: isInstructor && user ? user.name : formData.instructor,
        instructor_id: isInstructor && user ? user.id : formData.instructor_id
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi lưu khóa học';
      setGeneralError(msg);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.875rem',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s ease-out'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {courseToEdit ? 'Chỉnh sửa Khóa học' : 'Tạo Khóa học Mới'}
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              {courseToEdit
                ? `Cập nhật thông tin cho khóa học ID #${courseToEdit.id}`
                : 'Điền đầy đủ các thông tin bắt buộc dưới đây để thêm khóa học vào hệ thống'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem', flex: 1 }}>
          {generalError && (
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{generalError}</span>
            </div>
          )}

          {/* Title */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Tiêu đề khóa học <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Full-Stack Web Development với React & Node.js"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '0.5rem',
                border: `1px solid ${errors.title ? '#ef4444' : '#cbd5e1'}`,
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {errors.title && (
              <span style={{ color: '#ef4444', fontSize: '0.775rem', marginTop: '0.25rem', display: 'block' }}>
                {errors.title}
              </span>
            )}
          </div>

          {/* Category & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.15rem' }}>
            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Danh mục <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${errors.category ? '#ef4444' : '#cbd5e1'}`,
                  fontSize: '0.9rem',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {categories.map((c) => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span style={{ color: '#ef4444', fontSize: '0.775rem', marginTop: '0.25rem', display: 'block' }}>
                  {errors.category}
                </span>
              )}
            </div>

            {/* Status */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Trạng thái phát hành
              </label>
              <select
                value={formData.status || 'published'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="published">Đã xuất bản (Published)</option>
                <option value="draft">Bản nháp (Draft - Ẩn)</option>
                <option value="archived">Lưu trữ (Archived)</option>
              </select>
            </div>
          </div>

          {/* Price & Instructor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.15rem' }}>
            {/* Price */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Học phí (USD) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    fontWeight: 700
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 1.85rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${errors.price ? '#ef4444' : '#cbd5e1'}`,
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                Nhập 0 để đặt khóa học miễn phí.
              </span>
              {errors.price && (
                <span style={{ color: '#ef4444', fontSize: '0.775rem', marginTop: '0.25rem', display: 'block' }}>
                  {errors.price}
                </span>
              )}
            </div>

            {/* Instructor */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Giảng viên phụ trách <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.instructor}
                disabled={isInstructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                placeholder="VD: Dr. Alex Morgan"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${errors.instructor ? '#ef4444' : '#cbd5e1'}`,
                  fontSize: '0.9rem',
                  backgroundColor: isInstructor ? '#f1f5f9' : '#ffffff',
                  color: isInstructor ? '#64748b' : '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: isInstructor ? 'not-allowed' : 'text'
                }}
              />
              {isInstructor && (
                <span style={{ fontSize: '0.725rem', color: '#059669', marginTop: '0.2rem', display: 'block' }}>
                  ✓ Tự động gán cho tài khoản của bạn ({user?.name})
                </span>
              )}
              {errors.instructor && (
                <span style={{ color: '#ef4444', fontSize: '0.775rem', marginTop: '0.25rem', display: 'block' }}>
                  {errors.instructor}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail URL */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Ảnh đại diện (Thumbnail URL)
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="text"
                value={formData.thumbnail || ''}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                style={{
                  flex: 1,
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {formData.thumbnail && (
                <img
                  src={formData.thumbnail}
                  alt="Preview"
                  style={{
                    width: '48px',
                    height: '36px',
                    objectFit: 'cover',
                    borderRadius: '0.375rem',
                    border: '1px solid #cbd5e1'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_THUMBNAILS[0].url;
                  }}
                />
              )}
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.45rem' }}>
              <span style={{ fontSize: '0.725rem', color: '#64748b' }}>Chọn nhanh ảnh mẫu:</span>
              {DEFAULT_THUMBNAILS.map((thumb) => (
                <button
                  key={thumb.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, thumbnail: thumb.url })}
                  style={{
                    padding: '0.15rem 0.45rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.7rem',
                    border: '1px solid #cbd5e1',
                    backgroundColor: formData.thumbnail === thumb.url ? '#eff6ff' : '#f8fafc',
                    color: formData.thumbnail === thumb.url ? '#2563eb' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {thumb.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                Mô tả chi tiết khóa học <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                {formData.description.length} ký tự
              </span>
            </div>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả mục tiêu, kiến thức người học sẽ đạt được và nội dung chi tiết của khóa học..."
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '0.5rem',
                border: `1px solid ${errors.description ? '#ef4444' : '#cbd5e1'}`,
                fontSize: '0.875rem',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
            {errors.description && (
              <span style={{ color: '#ef4444', fontSize: '0.775rem', marginTop: '0.25rem', display: 'block' }}>
                {errors.description}
              </span>
            )}
          </div>

          {/* Modal Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e2e8f0'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.35rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: isSubmitting ? '#93c5fd' : '#2563eb',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
              }}
            >
              <Save size={16} />
              {isSubmitting ? 'Đang lưu...' : courseToEdit ? 'Lưu thay đổi' : 'Tạo khóa học'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
