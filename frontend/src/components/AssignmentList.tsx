import React, { useState } from 'react';
import { Assignment } from '../types/assignment';
import { Edit2, Trash2, Search, ClipboardList, AlertCircle, RefreshCw, BookOpen, Calendar } from 'lucide-react';

interface AssignmentListProps {
  assignments: Assignment[];
  onEdit: (assignment: Assignment) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const AssignmentList: React.FC<AssignmentListProps> = ({
  assignments,
  onEdit,
  onDelete,
  isLoading,
  error,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredAssignments = assignments.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      a.title.toLowerCase().includes(term) ||
      (a.course_title && a.course_title.toLowerCase().includes(term)) ||
      (a.description && a.description.toLowerCase().includes(term))
    );
  });

  const handleDeleteConfirm = (id: number, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài tập "${title}" không?`)) {
      setDeletingId(id);
      onDelete(id);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Không có hạn';
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

  if (isLoading) {
    return (
      <div className="state-card">
        <div className="spinner"></div>
        <p>Đang tải danh sách bài tập...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-card state-error">
        <AlertCircle size={40} />
        <h3>Lỗi tải bài tập</h3>
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
            placeholder="Tìm kiếm bài tập theo tên bài tập, khóa học, yêu cầu..."
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
          Tổng số: <strong>{filteredAssignments.length}</strong> bài tập
        </div>
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="state-card state-empty">
          <ClipboardList size={48} />
          <h3>Không tìm thấy bài tập</h3>
          <p>
            {searchTerm
              ? `Không tìm thấy bài tập phù hợp với từ khóa "${searchTerm}".`
              : 'Danh sách bài tập hiện tại đang trống. Nhấn "Thêm bài tập" để bắt đầu.'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="courses-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Thông tin bài tập</th>
                <th>Khóa học</th>
                <th>Hạn nộp bài</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((a) => (
                <tr key={a.id}>
                  <td className="td-id">#{a.id}</td>
                  <td className="td-details">
                    <div className="course-title">{a.title}</div>
                    <div className="course-desc" title={a.description}>
                      {a.description && a.description.length > 80
                        ? `${a.description.substring(0, 80)}...`
                        : a.description || 'Chưa có yêu cầu chi tiết'}
                    </div>
                  </td>
                  <td>
                    <div className="course-name-tag">
                      <BookOpen size={14} />
                      <span>{a.course_title || `Khóa học #${a.course_id}`}</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      <span>{formatDate(a.due_date || undefined)}</span>
                    </div>
                  </td>
                  <td className="td-actions text-right">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit(a)}
                      title="Chỉnh sửa bài tập"
                    >
                      <Edit2 size={16} />
                      <span>Sửa</span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteConfirm(a.id, a.title)}
                      disabled={deletingId === a.id}
                      title="Xóa bài tập"
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
