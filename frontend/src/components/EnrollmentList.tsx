import React, { useState } from 'react';
import { Enrollment } from '../types/enrollment';
import { Edit2, Trash2, Search, UserCheck, AlertCircle, RefreshCw, CheckCircle, Clock, XCircle, BookOpen, User } from 'lucide-react';

interface EnrollmentListProps {
  enrollments: Enrollment[];
  onEdit: (enrollment: Enrollment) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const EnrollmentList: React.FC<EnrollmentListProps> = ({
  enrollments,
  onEdit,
  onDelete,
  isLoading,
  error,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredEnrollments = enrollments.filter((e) => {
    const term = searchTerm.toLowerCase();
    return (
      (e.user_name && e.user_name.toLowerCase().includes(term)) ||
      (e.user_email && e.user_email.toLowerCase().includes(term)) ||
      (e.course_title && e.course_title.toLowerCase().includes(term)) ||
      e.status.toLowerCase().includes(term)
    );
  });

  const handleDeleteConfirm = (id: number, userName?: string, courseTitle?: string) => {
    const label = userName && courseTitle ? `đăng ký của ${userName} tại ${courseTitle}` : `#${id}`;
    if (window.confirm(`Bạn có chắc chắn muốn xóa lượt ${label} không?`)) {
      setDeletingId(id);
      onDelete(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <span className="badge status-badge status-completed">
            <CheckCircle size={14} /> Hoàn thành
          </span>
        );
      case 'cancelled':
        return (
          <span className="badge status-badge status-cancelled">
            <XCircle size={14} /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="badge status-badge status-active">
            <Clock size={14} /> Đang học
          </span>
        );
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="state-card">
        <div className="spinner"></div>
        <p>Đang tải danh sách đăng ký học...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-card state-error">
        <AlertCircle size={40} />
        <h3>Lỗi tải đăng ký</h3>
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={onRefresh}>
          <RefreshCw size={16} /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="entity-list-container">
      <div className="list-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm đăng ký theo tên học viên, email, khóa học, trạng thái..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>
        <div className="catalog-counter">
          Tổng số: <strong>{filteredEnrollments.length}</strong> lượt đăng ký
        </div>
      </div>

      {filteredEnrollments.length === 0 ? (
        <div className="state-card state-empty">
          <UserCheck size={48} />
          <h3>Không tìm thấy lượt đăng ký</h3>
          <p>
            {searchTerm
              ? `Không tìm thấy lượt đăng ký phù hợp với từ khóa "${searchTerm}".`
              : 'Danh sách đăng ký hiện tại đang trống. Nhấn "Đăng ký khóa học" để bắt đầu.'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="courses-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Học viên</th>
                <th>Khóa học đăng ký</th>
                <th>Trạng thái</th>
                <th>Ngày đăng ký</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((item) => (
                <tr key={item.id}>
                  <td className="td-id">#{item.id}</td>
                  <td>
                    <div className="user-info-cell">
                      <User size={14} className="cell-icon" />
                      <div>
                        <div className="user-name">{item.user_name || `Học viên #${item.user_id}`}</div>
                        <div className="user-email">{item.user_email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="course-name-tag">
                      <BookOpen size={14} />
                      <span>{item.course_title || `Khóa học #${item.course_id}`}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td className="date-text">{formatDate(item.enrolled_at || item.created_at)}</td>
                  <td className="td-actions text-right">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit(item)}
                      title="Chỉnh sửa lượt đăng ký"
                    >
                      <Edit2 size={16} />
                      <span>Sửa</span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteConfirm(item.id, item.user_name, item.course_title)}
                      disabled={deletingId === item.id}
                      title="Xóa lượt đăng ký"
                    >
                      <Trash2 size={16} />
                      <span>Xóa</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
