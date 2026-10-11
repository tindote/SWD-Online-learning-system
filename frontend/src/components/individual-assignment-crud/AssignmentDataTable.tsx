import React, { useState } from 'react';
import { Assignment } from '../../types/assignment';
import { Edit2, Trash2, Search, Eye, BookOpen, Clock, Calendar, ArrowUpDown, Filter, X, Send } from 'lucide-react';

interface AssignmentDataTableProps {
  assignments: Assignment[];
  onView: (assignment: Assignment) => void;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
  canManage: boolean;
  currentUserId?: number;
  userRole?: string;
}

export const AssignmentDataTable: React.FC<AssignmentDataTableProps> = ({
  assignments,
  onView,
  onEdit,
  onDelete,
  canManage,
  currentUserId,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'overdue'>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'due_date'>('due_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Extract unique course titles for the filter dropdown
  const uniqueCourses = Array.from(
    new Set(assignments.map((a) => a.course_title).filter(Boolean))
  ) as string[];

  const filteredAssignments = assignments.filter((a) => {
    // 1. Search term
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      const match =
        a.title.toLowerCase().includes(term) ||
        (a.course_title && a.course_title.toLowerCase().includes(term)) ||
        (a.description && a.description.toLowerCase().includes(term)) ||
        String(a.id).includes(term);
      if (!match) return false;
    }

    // 2. Status filter
    if (statusFilter !== 'all') {
      const isOverdue = a.due_date ? new Date(a.due_date).getTime() < Date.now() : false;
      if (statusFilter === 'active' && isOverdue) return false;
      if (statusFilter === 'overdue' && !isOverdue) return false;
    }

    // 3. Course filter
    if (courseFilter !== 'all') {
      if (a.course_title !== courseFilter) return false;
    }

    return true;
  });

  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    let comp = 0;
    if (sortBy === 'id') {
      comp = a.id - b.id;
    } else if (sortBy === 'title') {
      comp = a.title.localeCompare(b.title);
    } else if (sortBy === 'due_date') {
      const tA = a.due_date ? new Date(a.due_date).getTime() : 0;
      const tB = b.due_date ? new Date(b.due_date).getTime() : 0;
      comp = tA - tB;
    }
    return sortOrder === 'asc' ? comp : -comp;
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

  const canModifyAssignment = (item: Assignment) => {
    if (!canManage) return false;
    if (userRole === 'admin') return true;
    if (userRole === 'instructor') {
      return item.instructor_id === currentUserId;
    }
    return false;
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      overflow: 'hidden'
    }}>
      {/* Filter Tabs & Search Controls */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        backgroundColor: '#fafafa'
      }}>
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: statusFilter === 'all' ? '1px solid #0d9488' : '1px solid #e2e8f0',
              backgroundColor: statusFilter === 'all' ? '#0d9488' : '#ffffff',
              color: statusFilter === 'all' ? '#ffffff' : '#475569',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Tất cả ({assignments.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: statusFilter === 'active' ? '1px solid #059669' : '1px solid #e2e8f0',
              backgroundColor: statusFilter === 'active' ? '#059669' : '#ffffff',
              color: statusFilter === 'active' ? '#ffffff' : '#475569',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Đang mở
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('overdue')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: statusFilter === 'overdue' ? '1px solid #dc2626' : '1px solid #e2e8f0',
              backgroundColor: statusFilter === 'overdue' ? '#dc2626' : '#ffffff',
              color: statusFilter === 'overdue' ? '#ffffff' : '#475569',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Đã hết hạn
          </button>
        </div>

        {/* Course Filter Dropdown & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {uniqueCourses.length > 0 && (
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                backgroundColor: '#ffffff',
                color: '#334155',
                outline: 'none',
                maxWidth: '220px'
              }}
            >
              <option value="all">-- Lọc theo khóa học --</option>
              {uniqueCourses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, khóa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 32px 7px 34px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '7px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Body */}
      {sortedAssignments.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            <Search size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', color: '#334155', margin: '0 0 6px 0' }}>
            Không tìm thấy bài tập phù hợp
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            {searchTerm || statusFilter !== 'all' || courseFilter !== 'all'
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc'
              : 'Hiện chưa có bài tập nào'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="courses-table">
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th
                  onClick={() => toggleSort('id')}
                  style={{ width: '70px', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>#ID</span>
                    <ArrowUpDown size={13} color={sortBy === 'id' ? '#0d9488' : '#94a3b8'} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('title')}
                  style={{ cursor: 'pointer', userSelect: 'none', width: '320px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Tiêu đề bài tập</span>
                    <ArrowUpDown size={13} color={sortBy === 'title' ? '#0d9488' : '#94a3b8'} />
                  </div>
                </th>
                <th style={{ width: '220px' }}>Khóa học</th>
                <th
                  onClick={() => toggleSort('due_date')}
                  style={{ cursor: 'pointer', userSelect: 'none', width: '170px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Hạn nộp</span>
                    <ArrowUpDown size={13} color={sortBy === 'due_date' ? '#0d9488' : '#94a3b8'} />
                  </div>
                </th>
                <th style={{ width: '100px', textAlign: 'center' }}>Bài nộp</th>
                <th style={{ width: '180px', textAlign: 'right' }}>Thao tác</th>
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
                        color: '#64748b',
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}>
                        #{item.id}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                        {item.title}
                      </div>
                      {item.description && (
                        <div style={{
                          fontSize: '0.78rem',
                          color: '#64748b',
                          marginTop: '3px',
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.description}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', color: '#0d9488', fontWeight: 600 }}>
                        <BookOpen size={14} />
                        <span>{item.course_title || `Khóa học #${item.course_id}`}</span>
                      </div>
                      {item.course_instructor && (
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                          GV: {item.course_instructor}
                        </div>
                      )}
                    </td>

                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        backgroundColor: isOverdue ? '#fef2f2' : '#f0fdf4',
                        color: isOverdue ? '#b91c1c' : '#15803d',
                        border: `1px solid ${isOverdue ? '#fecaca' : '#bbf7d0'}`
                      }}>
                        <Clock size={12} />
                        {formatDate(item.due_date)}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#334155',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}>
                        <Send size={11} color="#0d9488" />
                        {item.submissions_count ?? 0}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => onView(item)}
                          title="Xem chi tiết"
                          style={{
                            backgroundColor: '#f0fdfa',
                            border: '1px solid #ccfbf1',
                            color: '#0f766e',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Eye size={14} />
                          <span>Chi tiết</span>
                        </button>

                        {canModify && (
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            title="Sửa bài tập"
                            style={{
                              backgroundColor: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Edit2 size={13} />
                            <span>Sửa</span>
                          </button>
                        )}

                        {canModify && (
                          <button
                            type="button"
                            onClick={() => onDelete(item)}
                            title="Xóa bài tập"
                            style={{
                              backgroundColor: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Trash2 size={13} />
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
