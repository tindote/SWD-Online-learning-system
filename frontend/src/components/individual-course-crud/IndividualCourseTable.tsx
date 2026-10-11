import React from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  Star,
  Users,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Course } from '../../types/course';
import { useAuth } from '../../context/AuthContext';

interface IndividualCourseTableProps {
  courses: Course[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalCourses: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onViewDetails: (course: Course) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

export const IndividualCourseTable: React.FC<IndividualCourseTableProps> = ({
  courses,
  isLoading,
  currentPage,
  totalPages,
  totalCourses,
  itemsPerPage,
  onPageChange,
  onViewDetails,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();
  const role = user?.role || 'guest';
  const isAdmin = role === 'admin';
  const isInstructor = role === 'instructor';

  const checkCanModify = (course: Course): boolean => {
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
  };

  const formatPrice = (price: number | string) => {
    const num = Number(price);
    if (isNaN(num) || num === 0) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.15rem 0.55rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: '#dcfce7',
            color: '#15803d'
          }}
        >
          Miễn phí
        </span>
      );
    }
    return (
      <span style={{ fontWeight: 700, color: '#0f172a' }}>
        ${num.toFixed(2)}
      </span>
    );
  };

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
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: bg,
          color: text
        }}
      >
        {label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          border: '1px solid #e2e8f0',
          padding: '3rem 2rem',
          textAlign: 'center',
          color: '#64748b'
        }}
      >
        <div className="spin-anim" style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
          ⌛
        </div>
        <div>Đang tải danh sách khóa học...</div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          border: '1px solid #e2e8f0',
          padding: '3.5rem 2rem',
          textAlign: 'center'
        }}
      >
        <AlertCircle size={40} style={{ color: '#94a3b8', margin: '0 auto 0.75rem auto' }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
          Không tìm thấy khóa học nào
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto' }}>
          Không có kết quả phù hợp với tiêu chí lọc hiện tại. Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr
              style={{
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              <th style={{ padding: '0.85rem 1rem', width: '60px' }}>ID</th>
              <th style={{ padding: '0.85rem 1rem', minWidth: '280px' }}>Khóa học</th>
              <th style={{ padding: '0.85rem 1rem', minWidth: '150px' }}>Giảng viên</th>
              <th style={{ padding: '0.85rem 1rem', width: '110px' }}>Giá</th>
              <th style={{ padding: '0.85rem 1rem', width: '120px' }}>Trạng thái</th>
              <th style={{ padding: '0.85rem 1rem', minWidth: '140px' }}>Thống kê</th>
              <th style={{ padding: '0.85rem 1rem', width: '130px', textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, idx) => {
              const canModify = checkCanModify(course);
              const rating = Number(course.average_rating) || 0;
              const lessons = Number(course.lessons_count) || 0;
              const enrolls = Number(course.enrollments_count) || 0;

              return (
                <tr
                  key={course.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                    transition: 'background-color 0.15s ease'
                  }}
                  className="table-row-hover"
                >
                  {/* ID */}
                  <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontWeight: 600 }}>
                    #{course.id}
                  </td>

                  {/* Course Details with Thumbnail */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <img
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                        alt={course.title}
                        style={{
                          width: '56px',
                          height: '42px',
                          objectFit: 'cover',
                          borderRadius: '0.375rem',
                          backgroundColor: '#e2e8f0',
                          flexShrink: 0
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60';
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: '#0f172a',
                            lineHeight: 1.3,
                            marginBottom: '0.2rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                          title={course.title}
                        >
                          {course.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.1rem 0.45rem',
                              borderRadius: '0.25rem',
                              backgroundColor: '#e0e7ff',
                              color: '#3730a3',
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}
                          >
                            {course.category}
                          </span>
                          {course.isInstructorOwner && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                padding: '0.1rem 0.45rem',
                                borderRadius: '0.25rem',
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                fontSize: '0.675rem',
                                fontWeight: 700
                              }}
                            >
                              <Sparkles size={10} /> Khóa học của bạn
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Instructor */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>
                      {course.instructor_name || course.instructor}
                    </div>
                    {course.instructor_id && (
                      <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                        ID: #{course.instructor_id}
                      </div>
                    )}
                  </td>

                  {/* Price */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {formatPrice(course.price)}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {renderStatusBadge(course.status)}
                  </td>

                  {/* Stats (Lessons, Enrolled, Rating) */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.75rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FileText size={13} style={{ color: '#6366f1' }} /> {lessons} bài học
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Users size={13} style={{ color: '#059669' }} /> {enrolls} học viên
                      </span>
                      {rating > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#d97706', fontWeight: 600 }}>
                          <Star size={13} fill="#f59e0b" color="#f59e0b" /> {rating.toFixed(1)} / 5.0
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => onViewDetails(course)}
                        title="Xem chi tiết khóa học"
                        style={{
                          padding: '0.4rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#ffffff',
                          color: '#2563eb',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Eye size={15} />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEdit(course)}
                        disabled={!canModify}
                        title={canModify ? 'Chỉnh sửa khóa học' : 'Bạn không có quyền sửa khóa học này'}
                        style={{
                          padding: '0.4rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #e2e8f0',
                          backgroundColor: canModify ? '#ffffff' : '#f8fafc',
                          color: canModify ? '#059669' : '#cbd5e1',
                          cursor: canModify ? 'pointer' : 'not-allowed',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Edit2 size={15} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDelete(course)}
                        disabled={!canModify}
                        title={canModify ? 'Xóa khóa học' : 'Bạn không có quyền xóa khóa học này'}
                        style={{
                          padding: '0.4rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #e2e8f0',
                          backgroundColor: canModify ? '#ffffff' : '#f8fafc',
                          color: canModify ? '#dc2626' : '#cbd5e1',
                          cursor: canModify ? 'pointer' : 'not-allowed',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          gap: '0.75rem',
          fontSize: '0.825rem',
          color: '#64748b'
        }}
      >
        <div>
          Hiển thị <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> -{' '}
          <strong>{Math.min(currentPage * itemsPerPage, totalCourses)}</strong> trên tổng số{' '}
          <strong>{totalCourses}</strong> khóa học
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '0.375rem',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: currentPage <= 1 ? '#94a3b8' : '#334155',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              fontWeight: 600
            }}
          >
            <ChevronLeft size={15} /> Trước
          </button>

          <span style={{ padding: '0 0.5rem', fontWeight: 600, color: '#0f172a' }}>
            Trang {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '0.375rem',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: currentPage >= totalPages ? '#94a3b8' : '#334155',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              fontWeight: 600
            }}
          >
            Sau <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
