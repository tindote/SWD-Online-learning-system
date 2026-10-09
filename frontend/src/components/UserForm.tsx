import React, { useState, useEffect } from 'react';
import { User, UserFormData } from '../types/user';
import { X, Save, AlertCircle } from 'lucide-react';

interface UserFormProps {
  userToEdit?: User | null;
  onSubmit: (formData: UserFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  userToEdit,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'student'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'student'
      });
    }
    setErrors({});
    setGeneralError(null);
  }, [userToEdit]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Họ và tên không được để trống';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
          <h2>{userToEdit ? 'Cập nhật người dùng' : 'Thêm mới người dùng'}</h2>
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
            <label htmlFor="name">Họ và tên <span className="required">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Ví dụ: Nguyễn Văn An"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Địa chỉ Email <span className="required">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Ví dụ: an.nguyen@example.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="role">Vai trò <span className="required">*</span></label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Học viên (Student)</option>
              <option value="instructor">Giảng viên (Instructor)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
          </div>

          {!userToEdit && (
            <div className="form-group">
              <label htmlFor="password">Mật khẩu ban đầu (Mặc định: Password123!)</label>
              <input
                type="text"
                id="password"
                name="password"
                placeholder="Password123!"
                value={formData.password || ''}
                onChange={handleChange}
              />
            </div>
          )}

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
                : userToEdit
                ? 'Cập nhật'
                : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
