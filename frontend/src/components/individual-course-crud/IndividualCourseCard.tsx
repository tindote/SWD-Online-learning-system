import React from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  Star,
  Users,
  FileText,
  Sparkles
} from 'lucide-react';
import { Course } from '../../types/course';
import { useAuth } from '../../context/AuthContext';

interface IndividualCourseCardProps {
  course: Course;
  onViewDetails: (course: Course) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

export const IndividualCourseCard: React.FC<IndividualCourseCardProps> = ({
  course,
  onViewDetails,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();
  const role = user?.role || 'guest';
  const isAdmin = role === 'admin';
  const isInstructor = role === 'instructor';

  const canModify = (() => {
    if (isAdmin) return true;
    if (isInstructor && user) {
      if (course.instructor_id != null && Number(course.instructor_id) === Number(user.id)) {
        return true;
      }
      if (course.instructor && user.name && course.instructor.trim().toLowerCase() === user.name.trim().toLowerCase()) {
        return true;
      }
    }
    return false;
  })();

  const numPrice = Number(course.price);
  const isFree = isNaN(numPrice) || numPrice === 0;
  const rating = Number(course.average_rating) || 0;
  const lessons = Number(course.lessons_count) || 0;
  const enrolls = Number(course.enrollments_count) || 0;

  const renderStatusBadge = (status?: string) => {
    const s = (status || 'published').toLowerCase();
    let bg = '#ecfdf5';
    let text = '#047857';
    let label = 'Đã xuất bản';

    if (s === 'draft') {
      bg = '#fffbeb';
      text = '#b45309';
      label = 'Bản nháp';
    } else if (s === 'archived') {
      bg = '#f1f5f9';
      text = '#475569';
      label = 'Lưu trữ';
    }

    return (
      <span
        style={{
          display: 'inline-block',
          padding: '0.15rem 0.55rem',
          borderRadius: '9999px',
          fontSize: '0.7rem',
          fontWeight: 700,
          backgroundColor: bg,
          color: text,
          backdropFilter: 'blur(4px)'
        }}
      >
        {label}
      </span>
    );
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
      className="course-card-hover"
    >
      {/* Thumbnail + Overlays */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#f1f5f9' }}>
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
          alt={course.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60';
          }}
        />

        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '0.65rem', left: '0.65rem', display: 'flex', gap: '0.35rem' }}>
          <span
            style={{
              padding: '0.15rem 0.5rem',
              borderRadius: '0.25rem',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 600
            }}
          >
            {course.category}
          </span>
          {renderStatusBadge(course.status)}
        </div>

        {/* Price Badge */}
        <div style={{ position: 'absolute', bottom: '0.65rem', right: '0.65rem' }}>
          <span
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              backgroundColor: isFree ? '#10b981' : '#2563eb',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
            }}
          >
            {isFree ? 'Miễn phí' : `$${numPrice.toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {course.isInstructorOwner && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#92400e',
              backgroundColor: '#fef3c7',
              padding: '0.1rem 0.45rem',
              borderRadius: '0.25rem',
              marginBottom: '0.5rem',
              width: 'fit-content'
            }}
          >
            <Sparkles size={11} /> Khóa học của bạn
          </div>
        )}

        <h4
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 0.4rem 0',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
          title={course.title}
        >
          {course.title}
        </h4>

        <p
          style={{
            fontSize: '0.825rem',
            color: '#64748b',
            lineHeight: 1.45,
            margin: '0 0 0.85rem 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1
          }}
        >
          {course.description}
        </p>

        {/* Instructor */}
        <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.75rem' }}>
          Giảng viên: <strong style={{ color: '#1e293b' }}>{course.instructor_name || course.instructor}</strong>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.65rem',
            borderTop: '1px solid #f1f5f9',
            fontSize: '0.75rem',
            color: '#64748b'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <FileText size={13} style={{ color: '#6366f1' }} /> {lessons} bài
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Users size={13} style={{ color: '#059669' }} /> {enrolls} học viên
          </span>
          {rating > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#d97706', fontWeight: 600 }}>
              <Star size={13} fill="#f59e0b" color="#f59e0b" /> {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem'
        }}
      >
        <button
          type="button"
          onClick={() => onViewDetails(course)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#2563eb',
            cursor: 'pointer'
          }}
        >
          <Eye size={14} /> Chi tiết
        </button>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={() => onEdit(course)}
            disabled={!canModify}
            title={canModify ? 'Chỉnh sửa' : 'Không có quyền sửa'}
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: '0.375rem',
              border: '1px solid #e2e8f0',
              backgroundColor: canModify ? '#ffffff' : '#f8fafc',
              color: canModify ? '#059669' : '#cbd5e1',
              cursor: canModify ? 'pointer' : 'not-allowed'
            }}
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(course)}
            disabled={!canModify}
            title={canModify ? 'Xóa' : 'Không có quyền xóa'}
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: '0.375rem',
              border: '1px solid #e2e8f0',
              backgroundColor: canModify ? '#ffffff' : '#f8fafc',
              color: canModify ? '#dc2626' : '#cbd5e1',
              cursor: canModify ? 'pointer' : 'not-allowed'
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
