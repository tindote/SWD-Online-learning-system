import React, { useState } from 'react';
import { Assignment } from '../../types/assignment';
import { Edit2, Trash2, Search, Eye, ClipboardList, ArrowUpDown, Calendar, BookOpen, Clock, Send, RefreshCw } from 'lucide-react';

interface IndividualAssignmentTableProps {
  assignments: Assignment[];
  onView: (assignment: Assignment) => void;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
  canManage: boolean;
  currentUserId?: number;
  userRole?: string;
}

export const IndividualAssignmentTable: React.FC<IndividualAssignmentTableProps> = ({
  assignments,
  onView,
  onEdit,
  onDelete,
  canManage,
  currentUserId,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'due_date'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredAssignments = assignments.filter((a) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      a.title.toLowerCase().includes(term) ||
      (a.course_title && a.course_title.toLowerCase().includes(term)) ||
      (a.description && a.description.toLowerCase().includes(term)) ||
      String(a.id).includes(term)
    );
  });

  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'id') {
      comparison = a.id - b.id;
    } else if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === 'due_date') {
      const dateA = a.due_date ? new Date(a.due_date).getTime() : 0;
      const dateB = b.due_date ? new Date(b.due_date).getTime() : 0;
      comparison = dateA - dateB;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: 'id' | 'title' | 'due_date') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateStr?: string | null) => {
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
      return String(dateStr);
    }
  };

  // Check if current user owns this assignment (Admin owns all, instructor must match instructor_id)
  const canModifyAssignment = (item: Assignment) => {
    if (!canManage) return false;
    if (userRole === 'admin') return true;
    if (userRole === 'instructor') {
      return item.instructor_id === currentUserId;
    }
    return false;
  };

  return (
    <div className="entity-list-container">
      {/* Search Toolbar */}
      <div className="list-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bài tập theo ID, tiêu đề, khóa học, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm('')}
              title="Xóa tìm kiếm"
              type="button"
            >
              ×
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.88rem' }}>
          <div className="catalog-counter">
            Hiển thị: <strong>{sortedAssignments.length}</strong> / <strong>{assignments.length}</strong> bài tập
          </div>
        </div>
      </div>

      {sortedAssignments.length === 0 ? (
        <div className="state-card state-empty" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <ClipboardList size={48} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-main)' }}>
            {searchTerm ? 'Không tìm thấy bài tập phù hợp' : 'Danh sách bài tập trống'}
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 16px' }}>
            {searchTerm
              ? `Không có kết quả nào khớp với từ khóa "${searchTerm}". Vui lòng thử lại.`
              : 'Hiện chưa có bài tập nào được giao. Nhấn "Thêm bài tập" để tạo bài đầu tiên.'}
          </p>
          {searchTerm && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSearchTerm('')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} /> Xóa bộ lọc tìm kiếm
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="courses-table">
            <thead>
              <tr>
                <th
                  onClick={() => toggleSort('id')}
                  style={{ cursor: 'pointer', userSelect: 'none', width: '80px' }}
                  title="Nhấn để sắp xếp theo ID"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>ID</span>
                    <ArrowUpDown size={14} color={sortBy === 'id' ? 'var(--primary-color)' : '#94a3b8'} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('title')}
                  style={{ cursor: 'pointer', userSelect: 'none', width: '280px' }}
                  title="Nhấn để sắp xếp theo Tiêu đề"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Tiêu đề bài tập</span>
                    <ArrowUpDown size={14} color={sortBy === 'title' ? 'var(--primary-color)' : '#94a3b8'} />
                  </div>
                </th>
                <th style={{ width: '220px' }}>Khóa học áp dụng</th>
                <th
                  onClick={() => toggleSort('due_date')}
                  style={{ cursor: 'pointer', userSelect: 'none', width: '160px' }}
                  title="Nhấn để sắp xếp theo Hạn nộp"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Hạn nộp bài</span>
                    <ArrowUpDown size={14} color={sortBy === 'due_date' ? 'var(--primary-color)' : '#94a3b8'} />
                  </div>
                </th>
                <th style={{ width: '110px' }}>Bài nộp</th>
                <th className="text-right" style={{ width: '200px', textAlign: 'right' }}>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAssignments.map((item) => {
                const canModify = canModifyAssignment(item);
                const isOverdue = item.due_date && new Date(item.due_date).getTime() < Date.now();

                return (
                  <tr key={item.id}>
                    <td className="td-id">
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-subtle)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)'
                      }}>
                        #{item.id}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                        {item.title}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '2px', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.description}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', color: 'var(--secondary-color)', fontWeight: 500 }}>
                        <BookOpen size={14} />
                        <span>{item.course_title || `Khóa học #${item.course_id}`}</span>
                      </div>
                      {item.course_instructor && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '2px' }}>
                          GV: {item.course_instructor}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.84rem',
                        color: isOverdue ? '#dc2626' : 'var(--text-main)',
                        fontWeight: isOverdue ? 600 : 400
                      }}>
                        <Clock size={13} color={isOverdue ? '#dc2626' : 'var(--text-light)'} />
                        <span>{formatDate(item.due_date)}</span>
                      </div>
                    </td>

                    <td>
                      <span className="badge" style={{
                        backgroundColor: 'var(--bg-subtle)',
                        color: 'var(--text-main)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Send size={12} />
                        {item.submissions_count ?? 0}
                      </span>
                    </td>

                    <td className="td-actions text-right" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        {/* View action */}
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => onView(item)}
                          title="Xem chi tiết bài tập"
                          style={{
                            backgroundColor: 'var(--bg-subtle)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--secondary-color)',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={15} />
                          <span>Xem</span>
                        </button>

                        {/* Edit action */}
                        {canModify && (
                          <button
                            type="button"
                            className="action-btn edit-btn"
                            onClick={() => onEdit(item)}
                            title="Chỉnh sửa bài tập"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit2 size={15} />
                            <span>Sửa</span>
                          </button>
                        )}

                        {/* Delete action */}
                        {canModify && (
                          <button
                            type="button"
                            className="action-btn delete-btn"
                            onClick={() => onDelete(item)}
                            title="Xóa bài tập"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={15} />
                            <span>Xóa</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
