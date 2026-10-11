import React from 'react';
import { Assignment } from '../../types/assignment';
import { X, Calendar, BookOpen, Clock, FileText, UserCheck, Send } from 'lucide-react';

interface IndividualAssignmentDetailModalProps {
  assignment: Assignment | null;
  onClose: () => void;
}

export const IndividualAssignmentDetailModal: React.FC<IndividualAssignmentDetailModalProps> = ({
  assignment,
  onClose
}) => {
  if (!assignment) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Không có hạn nộp';
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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px', width: '92%' }}
      >
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Chi tiết bài tập</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mã bài tập #{assignment.id}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} title="Đóng" type="button">
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Assignment Title & Course */}
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              {assignment.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary-color)', fontSize: '0.9rem', fontWeight: 600 }}>
              <BookOpen size={16} />
              <span>{assignment.course_title || `Khóa học #${assignment.course_id}`}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 600 }}>
              <FileText size={15} />
              <span>Yêu cầu & Hướng dẫn</span>
            </div>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              color: assignment.description ? 'var(--text-main)' : 'var(--text-light)',
              fontStyle: assignment.description ? 'normal' : 'italic',
              lineHeight: 1.6,
              minHeight: '80px',
              whiteSpace: 'pre-wrap'
            }}>
              {assignment.description || 'Không có yêu cầu mô tả thêm cho bài tập này.'}
            </div>
          </div>

          {/* Meta Info Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px'
          }}>
            <div style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                <Clock size={14} />
                <span>Hạn nộp bài</span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: assignment.due_date ? '#b91c1c' : 'var(--text-main)' }}>
                {formatDate(assignment.due_date)}
              </div>
            </div>

            <div style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                <Send size={14} />
                <span>Số bài nộp</span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {assignment.submissions_count ?? 0} bài đã nộp
              </div>
            </div>

            <div style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                <Calendar size={14} />
                <span>Ngày tạo</span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {formatDate(assignment.created_at)}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
