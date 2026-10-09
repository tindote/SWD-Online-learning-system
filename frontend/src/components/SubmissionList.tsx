import React, { useState } from 'react';
import { Submission } from '../types/submission';
import { Edit2, Trash2, Search, Send, AlertCircle, RefreshCw, User, Award, ExternalLink } from 'lucide-react';

interface SubmissionListProps {
  submissions: Submission[];
  onEdit: (submission: Submission) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const SubmissionList: React.FC<SubmissionListProps> = ({
  submissions,
  onEdit,
  onDelete,
  isLoading,
  error,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredSubmissions = submissions.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      (s.user_name && s.user_name.toLowerCase().includes(term)) ||
      (s.assignment_title && s.assignment_title.toLowerCase().includes(term)) ||
      (s.course_title && s.course_title.toLowerCase().includes(term)) ||
      s.content.toLowerCase().includes(term)
    );
  });

  const handleDeleteConfirm = (id: number, userName?: string) => {
    const label = userName ? `bài nộp của ${userName}` : `#${id}`;
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${label} không?`)) {
      setDeletingId(id);
      onDelete(id);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const isUrl = (str: string) => {
    return str.startsWith('http://') || str.startsWith('https://');
  };

  if (isLoading) {
    return (
      <div className="state-card">
        <div className="spinner"></div>
        <p>Đang tải danh sách bài nộp...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-card state-error">
        <AlertCircle size={40} />
        <h3>Lỗi tải bài nộp</h3>
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
            placeholder="Tìm kiếm bài nộp theo học viên, bài tập, liên kết/nội dung..."
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
          Tổng số: <strong>{filteredSubmissions.length}</strong> bài nộp
        </div>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="state-card state-empty">
          <Send size={48} />
          <h3>Không tìm thấy bài nộp</h3>
          <p>
            {searchTerm
              ? `Không tìm thấy bài nộp phù hợp với từ khóa "${searchTerm}".`
              : 'Danh sách bài nộp hiện tại đang trống. Nhấn "Nộp bài tập" để bắt đầu.'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="courses-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Học viên</th>
                <th>Bài tập & Khóa học</th>
                <th>Nội dung bài nộp</th>
                <th>Điểm số</th>
                <th>Thời gian nộp</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((s) => (
                <tr key={s.id}>
                  <td className="td-id">#{s.id}</td>
                  <td>
                    <div className="user-info-cell">
                      <User size={14} className="cell-icon" />
                      <div>
                        <div className="user-name">{s.user_name || `Học viên #${s.user_id}`}</div>
                        <div className="user-email">{s.user_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="td-details">
                    <div className="course-title">{s.assignment_title || `Bài tập #${s.assignment_id}`}</div>
                    <div className="course-desc">{s.course_title}</div>
                  </td>
                  <td className="content-cell">
                    {isUrl(s.content) ? (
                      <a href={s.content} target="_blank" rel="noopener noreferrer" className="content-url-link">
                        <span>{s.content}</span>
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <div className="content-text" title={s.content}>
                        {s.content.length > 60 ? `${s.content.substring(0, 60)}...` : s.content}
                      </div>
                    )}
                  </td>
                  <td>
                    {s.grade !== undefined && s.grade !== null ? (
                      <span className="grade-badge">
                        <Award size={14} /> {Number(s.grade).toFixed(1)} / 100
                      </span>
                    ) : (
                      <span className="grade-badge pending">Chưa chấm</span>
                    )}
                  </td>
                  <td className="date-text">{formatDate(s.submitted_at || s.created_at)}</td>
                  <td className="td-actions text-right">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit(s)}
                      title="Chỉnh sửa hoặc chấm điểm"
                    >
                      <Edit2 size={16} />
                      <span>Sửa/Chấm</span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteConfirm(s.id, s.user_name)}
                      disabled={deletingId === s.id}
                      title="Xóa bài nộp"
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
