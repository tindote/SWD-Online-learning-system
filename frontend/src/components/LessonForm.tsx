import React, { useState, useEffect } from 'react';
import { Lesson, LessonFormData } from '../types/lesson';
import { Course } from '../types/course';
import { courseApi } from '../services/courseApi';
import { useAuth } from '../context/AuthContext';
import { X, Save, AlertCircle } from 'lucide-react';

interface LessonFormProps {
  lessonToEdit?: Lesson | null;
  onSubmit: (formData: LessonFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const LessonForm: React.FC<LessonFormProps> = ({
  lessonToEdit,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const { user } = useAuth();
  const isInstructor = user?.role === 'instructor';

  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<LessonFormData>({
    course_id: '',
    title: '',
    content: '',
    video_url: '',
    resource_url: '',
    lesson_order: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = isInstructor
          ? await courseApi.getMyInstructorCourses()
          : await courseApi.getCourses();
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses for selection', err);
      }
    };
    loadCourses();
  }, [lessonToEdit, isInstructor]);

  useEffect(() => {
    if (lessonToEdit) {
      setFormData({
        course_id: lessonToEdit.course_id,
        title: lessonToEdit.title,
        content: lessonToEdit.content || '',
        video_url: lessonToEdit.video_url || '',
        resource_url: lessonToEdit.resource_url || '',
        lesson_order: lessonToEdit.lesson_order
      });
    } else {
      setFormData({
        course_id: '',
        title: '',
        content: '',
        video_url: '',
        resource_url: '',
        lesson_order: 1
      });
    }
    setErrors({});
    setGeneralError(null);
  }, [lessonToEdit]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.course_id) {
      newErrors.course_id = 'Vui lòng chọn khóa học';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Tên bài học không được để trống';
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
          <h2>{lessonToEdit ? 'Cập nhật bài học' : 'Thêm mới bài học'}</h2>
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
            <label htmlFor="course_id">Khóa học <span className="required">*</span></label>
            <select
              id="course_id"
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              className={errors.course_id ? 'input-error' : ''}
            >
              <option value="">-- Chọn khóa học --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            {errors.course_id && <span className="field-error">{errors.course_id}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Tên bài học <span className="required">*</span></label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Ví dụ: Tổng quan về React 18"
                value={formData.title}
                onChange={handleChange}
                className={errors.title ? 'input-error' : ''}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lesson_order">Thứ tự bài học <span className="required">*</span></label>
              <input
                type="number"
                id="lesson_order"
                name="lesson_order"
                min="1"
                value={formData.lesson_order}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="video_url">Đường dẫn Video bài giảng (Embed URL / YouTube)</label>
            <input
              type="text"
              id="video_url"
              name="video_url"
              placeholder="https://www.youtube.com/embed/..."
              value={formData.video_url || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="resource_url">Tài liệu tham khảo / Mã nguồn đính kèm (URL)</label>
            <input
              type="text"
              id="resource_url"
              name="resource_url"
              placeholder="https://github.com/... hoặc link tài liệu"
              value={formData.resource_url || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Nội dung bài giảng</label>
            <textarea
              id="content"
              name="content"
              rows={4}
              placeholder="Nhập nội dung tóm tắt hoặc ghi chú kiến thức cho bài học..."
              value={formData.content}
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
                : lessonToEdit
                ? 'Cập nhật'
                : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
