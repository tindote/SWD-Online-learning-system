import React, { useState, useEffect } from 'react';
import { Assignment, AssignmentFormData } from '../types/assignment';
import { Course } from '../types/course';
import { courseApi } from '../services/courseApi';
import { useAuth } from '../context/AuthContext';
import { X, Save, AlertCircle } from 'lucide-react';

interface AssignmentFormProps {
  assignmentToEdit?: Assignment | null;
  onSubmit: (formData: AssignmentFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  assignmentToEdit,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const { user } = useAuth();
  const isInstructor = user?.role === 'instructor';

  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<AssignmentFormData>({
    course_id: '',
    title: '',
    description: '',
    due_date: ''
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
  }, [assignmentToEdit, isInstructor]);

  useEffect(() => {
    if (assignmentToEdit) {
      let formattedDate = '';
      if (assignmentToEdit.due_date) {
        const d = new Date(assignmentToEdit.due_date);
        formattedDate = d.toISOString().slice(0, 16);
      }

      setFormData({
        course_id: assignmentToEdit.course_id,
        title: assignmentToEdit.title,
        description: assignmentToEdit.description || '',
        due_date: formattedDate
      });
    }
    setErrors({});
    setGeneralError(null);
  }, [assignmentToEdit]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.course_id) {
      newErrors.course_id = 'Vui lòng chọn khóa học';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Tên bài tập không được để trống';
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
          <h2>{assignmentToEdit ? 'Cập nhật bài tập' : 'Thêm mới bài tập'}</h2>
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
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            {errors.course_id && <span className="field-error">{errors.course_id}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="title">Tên bài tập <span className="required">*</span></label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Ví dụ: Assignment 1: React Todo App"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Hạn nộp bài</label>
            <input
              type="datetime-local"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Yêu cầu & Mô tả chi tiết</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Nhập hướng dẫn và yêu cầu chấm điểm bài tập..."
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
                : assignmentToEdit
                ? 'Cập nhật'
                : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
