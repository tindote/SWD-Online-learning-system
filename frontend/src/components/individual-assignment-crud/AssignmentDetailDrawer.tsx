import React from 'react';
import { Assignment } from '../../types/assignment';
import { X, Calendar, BookOpen, Clock, FileText, Send, User, CheckCircle } from 'lucide-react';

interface AssignmentDetailDrawerProps {
  assignment: Assignment | null;
  onClose: () => void;
}

export const AssignmentDetailDrawer: React.FC<AssignmentDetailDrawerProps> = ({
  assignment,
  onClose
}) => {
  if (!assignment) return null;

  const isOverdue = assignment.due_date && new Date(assignment.due_date).getTime() < Date.now();

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Không quy định hạn nộp';
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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '560px',
        height: '100%',
        boxShadow: '-8px 0 30px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Drawer Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f0fdfa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
              Thông tin chi tiết bài tập #{assignment.id}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#134e4a', margin: 0, lineHeight: 1.4 }}>
              {assignment.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #ccfbf1',
              borderRadius: '8px',
              padding: '6px',
              color: '#64748b',
              cursor: 'pointer'
            }}
            title="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Course card */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
              Khóa học áp dụng
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="#0d9488" />
              <span>{assignment.course_title || `Khóa học #${assignment.course_id}`}</span>
            </div>
            {assignment.course_instructor && (
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="#64748b" />
                <span>Giảng viên: <strong>{assignment.course_instructor}</strong></span>
              </div>
            )}
          </div>

          {/* Due date status banner */}
          <div style={{
            backgroundColor: isOverdue ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${isOverdue ? '#fecaca' : '#bbf7d0'}`,
            borderRadius: '10px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: isOverdue ? '#991b1b' : '#166534', fontWeight: 600, textTransform: 'uppercase' }}>
                Trạng thái hạn chót
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isOverdue ? '#b91c1c' : '#15803d', marginTop: '2px' }}>
                {formatDate(assignment.due_date)}
              </div>
            </div>
            <span style={{
              backgroundColor: isOverdue ? '#fee2e2' : '#dcfce7',
              color: isOverdue ? '#991b1b' : '#166534',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              {isOverdue ? 'Đã hết hạn' : 'Đang mở nộp'}
            </span>
          </div>

          {/* Description & guidelines */}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={15} color="#0d9488" />
              <span>Nội dung đề bài & Hướng dẫn</span>
            </div>
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '16px',
              fontSize: '0.9rem',
              color: assignment.description ? '#1e293b' : '#94a3b8',
              fontStyle: assignment.description ? 'normal' : 'italic',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              minHeight: '100px'
            }}>
              {assignment.description || 'Không có mô tả chi tiết cho bài tập này.'}
            </div>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div style={{
              backgroundColor: '#f0fdfa',
              border: '1px solid #ccfbf1',
              borderRadius: '8px',
              padding: '12px 16px'
            }}>
              <div style={{ fontSize: '0.78rem', color: '#0f766e', fontWeight: 600 }}>Số bài nộp hiện tại</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#134e4a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={18} />
                <span>{assignment.submissions_count ?? 0}</span>
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px'
            }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Thời gian tạo</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginTop: '6px' }}>
                {formatDate(assignment.created_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: '20px 28px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 24px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
