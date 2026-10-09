import React, { useState, useEffect } from 'react';
import { Submission, SubmissionFormData } from '../types/submission';
import { Assignment } from '../types/assignment';
import { User } from '../types/user';
import { assignmentApi } from '../services/assignmentApi';
import { userApi } from '../services/userApi';
import { X, Save, AlertCircle } from 'lucide-react';

interface SubmissionFormProps {
  submissionToEdit?: Submission | null;
  onSubmit: (formData: SubmissionFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({
  submissionToEdit,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<SubmissionFormData>({
    assignment_id: '',
    user_id: '',
    content: '',
    grade: '',
    feedback: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    const loadSelectData = async () => {
      try {
        const [assignmentData, userData] = await Promise.all([
          assignmentApi.getAssignments(),
          userApi.getUsers()
        ]);
        setAssignments(assignmentData);
        setUsers(userData);
      } catch (err) {
        console.error('Failed to load select data', err);
      }
    };
    loadSelectData();
  }, []);

  useEffect(() => {
    if (submissionToEdit) {
      setFormData({
        assignment_id: submissionToEdit.assignment_id,
        user_id: submissionToEdit.user_id,
        content: submissionToEdit.content,
        grade: submissionToEdit.grade !== undefined && submissionToEdit.grade !== null ? submissionToEdit.grade : '',
        feedback: submissionToEdit.feedback || ''
      });
    } else {
      setFormData({
        assignment_id: '',
        user_id: '',
        content: '',
        grade: '',
        feedback: ''
      });
    }
    setErrors({});
    setGeneralError(null);
  }, [submissionToEdit]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.assignment_id) {
      newErrors.assignment_id = 'Vui lòng chọn bài tập';
    }

    if (!formData.user_id) {
      newErrors.user_id = 'Vui lòng chọn học viên';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Nội dung nộp bài không được để trống';
    }

    if (formData.grade !== undefined && formData.grade !== '') {
      const g = Number(formData.grade);
      if (isNaN(g) || g < 0 || g > 100) {
        newErrors.grade = 'Điểm số phải từ 0 đến 100';
      }
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
          <h2>{submissionToEdit ? 'Chỉnh sửa & Chấm điểm bài nộp' : 'Nộp bài tập mới'}</h2>
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
            <label htmlFor="assignment_id">Bài tập <span className="required">*</span></label>
            <select
              id="assignment_id"
              name="assignment_id"
              value={formData.assignment_id}
              onChange={handleChange}
              className={errors.assignment_id ? 'input-error' : ''}
            >
              <option value="">-- Chọn bài tập --</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.course_title || 'Khóa học'})
                </option>
              ))}
            </select>
            {errors.assignment_id && <span className="field-error">{errors.assignment_id}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="user_id">Học viên nộp bài <span className="required">*</span></label>
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
            <label htmlFor="content">Nội dung nộp bài (Đường dẫn GitHub / Link bài làm) <span className="required">*</span></label>
            <textarea
              id="content"
              name="content"
              rows={3}
              placeholder="Ví dụ: https://github.com/username/repository..."
              value={formData.content}
              onChange={handleChange}
              className={errors.content ? 'input-error' : ''}
            />
            {errors.content && <span className="field-error">{errors.content}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="grade">Điểm số (Thang điểm 0 - 100)</label>
            <input
              type="number"
              id="grade"
              name="grade"
              min="0"
              max="100"
              step="0.5"
              placeholder="Để trống nếu chưa chấm"
              value={formData.grade ?? ''}
              onChange={handleChange}
              className={errors.grade ? 'input-error' : ''}
            />
            {errors.grade && <span className="field-error">{errors.grade}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="feedback">Nhận xét & Phản hồi của giảng viên</label>
            <textarea
              id="feedback"
              name="feedback"
              rows={3}
              placeholder="Nhập nhận xét chi tiết cho bài làm..."
              value={formData.feedback || ''}
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
                : submissionToEdit
                ? 'Cập nhật / Chấm điểm'
                : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
