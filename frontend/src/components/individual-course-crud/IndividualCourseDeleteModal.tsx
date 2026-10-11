import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Course } from '../../types/course';

interface IndividualCourseDeleteModalProps {
  isOpen: boolean;
  course: Course | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const IndividualCourseDeleteModal: React.FC<IndividualCourseDeleteModalProps> = ({
  isOpen,
  course,
  isDeleting,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !course) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.875rem',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #fee2e2',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s ease-out'
        }}
      >
        {/* Header with Danger Accent */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: '#fef2f2',
            borderBottom: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#991b1b', margin: 0 }}>
              Xác nhận Xóa Khóa học
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: '#334155', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
            Bạn có chắc chắn muốn xóa vĩnh viễn khóa học này không? Hành động này <strong>không thể hoàn tác</strong>.
          </p>

          {/* Preview snippet */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              marginBottom: '1rem'
            }}
          >
            <img
              src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
              alt={course.title}
              style={{
                width: '60px',
                height: '45px',
                objectFit: 'cover',
                borderRadius: '0.375rem',
                flexShrink: 0
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {course.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                ID #{course.id} • {course.category} • Giảng viên: {course.instructor_name || course.instructor}
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: '0.775rem',
              color: '#b91c1c',
              backgroundColor: '#fff1f2',
              padding: '0.65rem 0.85rem',
              borderRadius: '0.375rem',
              border: '1px solid #ffe4e6',
              lineHeight: 1.4
            }}
          >
            ⚠️ <strong>Lưu ý:</strong> Toàn bộ bài giảng, bài tập và bản ghi danh sách học viên liên quan đến khóa học này sẽ tự động bị xóa theo ràng buộc Cascade của cơ sở dữ liệu.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: isDeleting ? 'not-allowed' : 'pointer'
            }}
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: isDeleting ? '#fca5a5' : '#dc2626',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(220,38,38,0.25)'
            }}
          >
            <Trash2 size={16} />
            {isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
          </button>
        </div>
      </div>
    </div>
  );
};
