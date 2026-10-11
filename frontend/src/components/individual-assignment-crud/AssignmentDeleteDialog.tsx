import React from 'react';
import { Assignment } from '../../types/assignment';
import { Trash2, AlertCircle, X } from 'lucide-react';

interface AssignmentDeleteDialogProps {
  assignment: Assignment | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const AssignmentDeleteDialog: React.FC<AssignmentDeleteDialogProps> = ({
  assignment,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !assignment) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(3px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} onClick={isDeleting ? undefined : onCancel}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        maxWidth: '460px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ padding: '24px 24px 0 24px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Trash2 size={22} />
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#991b1b', margin: '0 0 6px 0' }}>
              Xóa bài tập này?
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              Hành động này sẽ gỡ bài tập khỏi khóa học. Bạn có chắc chắn muốn tiếp tục không?
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '16px 24px' }}>
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px'
          }}>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
              {assignment.title}
            </div>
            {assignment.course_title && (
              <div style={{ fontSize: '0.82rem', color: '#0d9488', fontWeight: 600, marginTop: '4px' }}>
                Khóa học: {assignment.course_title}
              </div>
            )}
          </div>
        </div>

        <div style={{
          padding: '16px 24px 20px 24px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              padding: '9px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Trash2 size={15} />
            <span>{isDeleting ? 'Đang xóa...' : 'Xóa bài tập'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
