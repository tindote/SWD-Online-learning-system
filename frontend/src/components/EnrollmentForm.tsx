import React, { useState, useEffect } from 'react';
import { Enrollment, EnrollmentFormData } from '../types/enrollment';
import { User } from '../types/user';
import { Course } from '../types/course';
import { userApi } from '../services/userApi';
import { courseApi } from '../services/courseApi';
import { X, Save, AlertCircle } from 'lucide-react';

interface EnrollmentFormProps {
  enrollmentToEdit?: Enrollment | null;
  onSubmit: (formData: EnrollmentFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const EnrollmentForm: React.FC<EnrollmentFormProps> = ({
  enrollmentToEdit,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<EnrollmentFormData>({
    user_id: '',
    course_id: '',
    status: 'active'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    const loadSelectData = async () => {
      try {
        const [userData, courseData] = await Promise.all([
          userApi.getUsers(),
          courseApi.getCourses()
        ]);
        setUsers(userData);
        setCourses(courseData);
      } catch (err) {
        console.error('Failed to load selection data', err);
      }
    };
    loadSelectData();
  }, []);

  useEffect(() => {
    if (enrollmentToEdit) {
      setFormData({
        user_id: enrollmentToEdit.user_id,
        course_id: enrollmentToEdit.course_id,
        status: enrollmentToEdit.status
      });
    }
    setErrors({});
    setGeneralError(null);
  }, [enrollmentToEdit]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.user_id) {
      newErrors.user_id = 'Vui lòng chọn học viên';
    }

    if (!formData.course_id) {
      newErrors.course_id = 'Vui lòng chọn khóa học';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement>
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
          <h2>{enrollmentToEdit ? 'Cập nhật đăng ký' : 'Đăng ký khóa học mới'}</h2>
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
            <label htmlFor="user_id">Học viên <span className="required">*</span></label>
            <select
              id="user_id"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              className={errors.user_id ? 'input-error' : ''}
            >
              <option value="">-- Chọn học viên --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            {errors.user_id && <span className="field-error">{errors.user_id}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="course_id">Khóa học đăng ký <span className="required">*</span></label>
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
            <label htmlFor="status">Trạng thái đăng ký <span className="required">*</span></label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Đang học (Active)</option>
              <option value="completed">Hoàn thành (Completed)</option>
              <option value="cancelled">Đã hủy (Cancelled)</option>
            </select>
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
                : enrollmentToEdit
                ? 'Cập nhật'
                : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
