import React, { useState, useEffect } from 'react';
import { Assignment, AssignmentFormData } from '../../types/assignment';
import { Course } from '../../types/course';
import { courseApi } from '../../services/courseApi';
import { useAuth } from '../../context/AuthContext';
import { X, Save, AlertCircle, ClipboardList, BookOpen, Clock, FileText } from 'lucide-react';

interface IndividualAssignmentFormModalProps {
  assignmentToEdit?: Assignment | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onSubmit: (formData: AssignmentFormData) => Promise<void>;
  onClose: () => void;
}

export const IndividualAssignmentFormModal: React.FC<IndividualAssignmentFormModalProps> = ({
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

  const [errors, setErrors] = useState<{
    course_id?: string;
    title?: string;
    description?: string;
    due_date?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isEditing = Boolean(assignmentToEdit);

  // Fetch available courses for the dropdown
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
        console.error('Lỗi tải danh sách khóa học:', err);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [isOpen, isInstructor]);

  // Sync form data with assignmentToEdit
  useEffect(() => {
    if (assignmentToEdit) {
      let formattedDate = '';
      if (assignmentToEdit.due_date) {
        try {
          const d = new Date(assignmentToEdit.due_date);
          const tzOffset = d.getTimezoneOffset() * 60000;
          const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
          formattedDate = localISOTime;
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
      newErrors.course_id = 'Vui lòng chọn khóa học';
    }

    const trimmedTitle = data.title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Tiêu đề bài tập không được để trống';
    } else if (trimmedTitle.length < 3) {
      newErrors.title = 'Tiêu đề bài tập phải có ít nhất 3 ký tự';
    } else if (trimmedTitle.length > 255) {
      newErrors.title = 'Tiêu đề bài tập không được vượt quá 255 ký tự';
    }

    if (data.due_date) {
      const parsedDate = Date.parse(data.due_date);
      if (isNaN(parsedDate)) {
        newErrors.due_date = 'Hạn nộp bài không đúng định dạng ngày giờ';
      }
    }

    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updated = {
      ...formData,
      [name]: value
    };
    setFormData(updated);

    if (serverError) setServerError(null);

    if (touched[name]) {
      const valErrors = validate(updated);
      setErrors((prev) => ({
        ...prev,
        [name]: valErrors[name]
      }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const valErrors = validate(formData);
    setErrors((prev) => ({
      ...prev,
      [field]: valErrors[field]
    }));
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
    <div className="modal-overlay" onClick={isSubmitting ? undefined : onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '620px', width: '92%' }}
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
              <ClipboardList size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>
                {isEditing ? `Cập nhật bài tập #${assignmentToEdit?.id}` : 'Thêm mới bài tập'}
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {isEditing ? 'Chỉnh sửa thông tin bài tập đã chọn' : 'Soạn bài tập và thiết lập hạn nộp cho học viên'}
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
          {/* Select Course */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label htmlFor="assignment-course" style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>
              Khóa học <span className="required" style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              id="assignment-course"
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              onBlur={() => handleBlur('course_id')}
              disabled={isSubmitting || isLoadingCourses}
              className={errors.course_id ? 'input-error' : ''}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: errors.course_id ? '1px solid #ef4444' : '1px solid var(--border-color)',
                fontSize: '0.92rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="">-- Chọn khóa học áp dụng bài tập --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title} (#{course.id})
                </option>
              ))}
            </select>
            {errors.course_id && (
              <span className="field-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={14} />
                {errors.course_id}
              </span>
            )}
          </div>

          {/* Title */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="assignment-title" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Tiêu đề bài tập <span className="required" style={{ color: '#ef4444' }}>*</span>
              </label>
              <span style={{ fontSize: '0.78rem', color: formData.title.length > 255 ? '#ef4444' : 'var(--text-light)' }}>
                {formData.title.length}/255 ký tự
              </span>
            </div>
            <input
              type="text"
              id="assignment-title"
              name="title"
              placeholder="Ví dụ: Bài thực hành 1: Thiết kế Responsive Layout với CSS Grid"
              value={formData.title}
              onChange={handleChange}
              onBlur={() => handleBlur('title')}
              disabled={isSubmitting}
              className={errors.title ? 'input-error' : ''}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: errors.title ? '1px solid #ef4444' : '1px solid var(--border-color)',
                fontSize: '0.92rem',
                outline: 'none',
                backgroundColor: isSubmitting ? 'var(--bg-subtle)' : '#ffffff'
              }}
            />
            {errors.title && (
              <span className="field-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={14} />
                {errors.title}
              </span>
            )}
          </div>

          {/* Due date */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label htmlFor="assignment-due-date" style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>
              Hạn nộp bài (Due Date)
            </label>
            <input
              type="datetime-local"
              id="assignment-due-date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              onBlur={() => handleBlur('due_date')}
              disabled={isSubmitting}
              className={errors.due_date ? 'input-error' : ''}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: errors.due_date ? '1px solid #ef4444' : '1px solid var(--border-color)',
                fontSize: '0.92rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
            {errors.due_date && (
              <span className="field-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={14} />
                {errors.due_date}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom: '22px' }}>
            <label htmlFor="assignment-description" style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>
              Nội dung mô tả & Hướng dẫn làm bài
            </label>
            <textarea
              id="assignment-description"
              name="description"
              rows={4}
              placeholder="Nhập nội dung đề bài, các yêu cầu kỹ thuật, tiêu chí chấm điểm..."
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.92rem',
                outline: 'none',
                resize: 'vertical',
                minHeight: '90px',
                backgroundColor: isSubmitting ? 'var(--bg-subtle)' : '#ffffff',
                lineHeight: 1.5
              }}
            />
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
                ? 'Cập nhật bài tập'
                : 'Tạo bài tập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
