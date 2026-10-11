import React, { useState, useEffect } from 'react';
import { Assignment, AssignmentFormData } from '../../types/assignment';
import { Course } from '../../types/course';
import { courseApi } from '../../services/courseApi';
import { useAuth } from '../../context/AuthContext';
import { X, Check, AlertCircle, BookOpen, Clock, FileText, Sparkles } from 'lucide-react';

interface AssignmentDrawerFormProps {
  assignmentToEdit?: Assignment | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onSubmit: (formData: AssignmentFormData) => Promise<void>;
  onClose: () => void;
}

export const AssignmentDrawerForm: React.FC<AssignmentDrawerFormProps> = ({
  assignmentToEdit,
  isOpen,
  isSubmitting,
  onSubmit,
  onClose
}) => {
  const { user } = useAuth();
  const isInstructor = user?.role === 'instructor';

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(false);

  const [formData, setFormData] = useState<AssignmentFormData>({
    course_id: '',
    title: '',
    description: '',
    due_date: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isEditing = Boolean(assignmentToEdit);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const data = isInstructor
          ? await courseApi.getMyInstructorCourses()
          : await courseApi.getCourses();
        setCourses(data);
      } catch (err) {
        console.error('Lỗi tải khóa học:', err);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [isOpen, isInstructor]);

  useEffect(() => {
    if (assignmentToEdit) {
      let formattedDate = '';
      if (assignmentToEdit.due_date) {
        try {
          const d = new Date(assignmentToEdit.due_date);
          const tzOffset = d.getTimezoneOffset() * 60000;
          formattedDate = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
        } catch {
          formattedDate = '';
        }
      }

      setFormData({
        course_id: String(assignmentToEdit.course_id),
        title: assignmentToEdit.title || '',
        description: assignmentToEdit.description || '',
        due_date: formattedDate
      });
    } else {
      setFormData({
        course_id: '',
        title: '',
        description: '',
        due_date: ''
      });
    }

    setErrors({});
    setServerError(null);
    setTouched({});
  }, [assignmentToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = (data: AssignmentFormData) => {
    const newErrors: Record<string, string> = {};

    if (!data.course_id || String(data.course_id).trim() === '') {
      newErrors.course_id = 'Vui lòng chọn khóa học áp dụng bài tập';
    }

    const trimmedTitle = data.title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Tiêu đề bài tập không được bỏ trống';
    } else if (trimmedTitle.length < 3) {
      newErrors.title = 'Tiêu đề bài tập phải có ít nhất 3 ký tự';
    } else if (trimmedTitle.length > 255) {
      newErrors.title = 'Tiêu đề không được vượt quá 255 ký tự';
    }

    if (data.due_date && isNaN(Date.parse(data.due_date))) {
      newErrors.due_date = 'Hạn nộp bài không đúng định dạng ngày giờ';
    }

    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (serverError) setServerError(null);

    if (touched[name]) {
      const valErrors = validate(updated);
      setErrors((prev) => ({ ...prev, [name]: valErrors[name] }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const valErrors = validate(formData);
    setErrors((prev) => ({ ...prev, [field]: valErrors[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const valErrors = validate(formData);
    setErrors(valErrors);
    setTouched({ course_id: true, title: true, due_date: true });

    if (Object.keys(valErrors).length > 0) return;

    try {
      await onSubmit({
        course_id: Number(formData.course_id),
        title: formData.title.trim(),
        description: formData.description ? formData.description.trim() : '',
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : ''
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
      transition: 'opacity 0.2s ease'
    }} onClick={isSubmitting ? undefined : onClose}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '560px',
        height: '100%',
        boxShadow: '-8px 0 30px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Drawer Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f0fdfa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
              {isEditing ? `Chỉnh sửa bài tập #${assignmentToEdit?.id}` : 'Soạn bài tập mới'}
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#134e4a', margin: 0 }}>
              {isEditing ? 'Cập nhật nội dung bài tập' : 'Giao bài tập cho học viên'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #ccfbf1',
              borderRadius: '8px',
              padding: '6px',
              color: '#64748b',
              cursor: 'pointer'
            }}
            title="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: '28px', flex: 1 }}>
          {serverError && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#b91c1c',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Course select */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px' }}>
                Khóa học áp dụng <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                name="course_id"
                value={formData.course_id}
                onChange={handleChange}
                onBlur={() => handleBlur('course_id')}
                disabled={isSubmitting || isLoadingCourses}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: errors.course_id ? '1px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="">-- Chọn khóa học --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} (#{c.id})
                  </option>
                ))}
              </select>
              {errors.course_id && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>
                  {errors.course_id}
                </div>
              )}
            </div>

            {/* Title */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>
                  Tiêu đề bài tập <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span style={{ fontSize: '0.78rem', color: formData.title.length > 255 ? '#ef4444' : '#94a3b8' }}>
                  {formData.title.length}/255
                </span>
              </div>
              <input
                type="text"
                name="title"
                placeholder="Nhập tiêu đề bài tập..."
                value={formData.title}
                onChange={handleChange}
                onBlur={() => handleBlur('title')}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: errors.title ? '1px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              {errors.title && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>
                  {errors.title}
                </div>
              )}
            </div>

            {/* Due date */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px' }}>
                Hạn chót nộp bài (Due date)
              </label>
              <input
                type="datetime-local"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                onBlur={() => handleBlur('due_date')}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: errors.due_date ? '1px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              {errors.due_date && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>
                  {errors.due_date}
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px' }}>
                Nội dung yêu cầu & Tiêu chí chấm điểm
              </label>
              <textarea
                name="description"
                rows={5}
                placeholder="Ghi rõ yêu cầu đề bài, định dạng file nộp bài (zip/github link), tiêu chí đánh giá..."
                value={formData.description}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '110px',
                  lineHeight: 1.5
                }}
              />
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '10px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(13, 148, 136, 0.3)'
                }}
              >
                <Check size={16} />
                <span>{isSubmitting ? 'Đang lưu...' : isEditing ? 'Lưu cập nhật' : 'Tạo bài tập'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
