import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  User,
  Star,
  Users,
  FileText,
  Calendar,
  ExternalLink,
  Edit2,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Course } from '../../types/course';
import { courseApi } from '../../services/courseApi';
import { useAuth } from '../../context/AuthContext';

interface IndividualCourseDetailModalProps {
  courseId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (course: Course) => void;
}

export const IndividualCourseDetailModal: React.FC<IndividualCourseDetailModalProps> = ({
  courseId,
  isOpen,
  onClose,
  onEdit
}) => {
  const { user } = useAuth();
  const role = user?.role || 'guest';
  const isAdmin = role === 'admin';
  const isInstructor = role === 'instructor';

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !courseId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const fetchDetails = async () => {
      try {
        const data = await courseApi.getCourseById(courseId);
        if (isMounted) {
          setCourse(data);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error fetching course details:', err);
          setError(err.response?.data?.message || err.message || 'Không thể tải chi tiết khóa học');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [isOpen, courseId]);

  if (!isOpen) return null;

  const canModify = course ? (
    isAdmin || (isInstructor && user && (
      (course.instructor_id != null && Number(course.instructor_id) === Number(user.id)) ||
      (course.instructor && user.name && course.instructor.trim().toLowerCase() === user.name.trim().toLowerCase())
    ))
  ) : false;

  const numPrice = Number(course?.price || 0);
  const isFree = isNaN(numPrice) || numPrice === 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.875rem',
          maxWidth: '740px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s ease-out'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} style={{ color: '#2563eb' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Chi tiết Khóa học
            </h3>
            {course && (
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                (ID #{course.id})
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ overflowY: 'auto', padding: '1.5rem', flex: 1 }}>
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
              <div className="spin-anim" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⌛</div>
              <div>Đang tải chi tiết khóa học...</div>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !error && course && (
            <div>
              {/* Hero Banner with Image */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '210px',
                  borderRadius: '0.625rem',
                  overflow: 'hidden',
                  marginBottom: '1.25rem',
                  backgroundColor: '#0f172a'
                }}
              >
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                  alt={course.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.2) 60%)'
                  }}
                />
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <span
                    style={{
                      padding: '0.2rem 0.65rem',
                      borderRadius: '0.375rem',
                      backgroundColor: 'rgba(37,99,235,0.9)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    {course.category}
                  </span>
                  <span
                    style={{
                      padding: '0.2rem 0.65rem',
                      borderRadius: '0.375rem',
                      backgroundColor: course.status === 'published' ? 'rgba(16,185,129,0.9)' : 'rgba(245,158,11,0.9)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    {course.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                </div>

                <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem' }}>
                  <h2
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: 0,
                      lineHeight: 1.3
                    }}
                  >
                    {course.title}
                  </h2>
                </div>
              </div>

              {/* Stats Bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.75rem',
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Học phí</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: isFree ? '#10b981' : '#0f172a', marginTop: '0.15rem' }}>
                    {isFree ? 'Miễn phí' : `$${numPrice.toFixed(2)}`}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Bài học</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#6366f1', marginTop: '0.15rem' }}>
                    {course.lessons_count || (course.lessons ? course.lessons.length : 0)} bài
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Học viên</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#059669', marginTop: '0.15rem' }}>
                    {course.enrollments_count || 0} người
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Đánh giá</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.15rem' }}>
                    ★ {Number(course.average_rating || 0).toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                  Mô tả khóa học
                </h4>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: '#475569',
                    lineHeight: 1.6,
                    backgroundColor: '#ffffff',
                    border: '1px solid #f1f5f9',
                    padding: '0.85rem',
                    borderRadius: '0.5rem',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {course.description}
                </div>
              </div>

              {/* Instructor Information */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    flexShrink: 0
                  }}
                >
                  {course.instructor_name ? course.instructor_name.charAt(0) : course.instructor.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.775rem', color: '#64748b' }}>Giảng viên hướng dẫn</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    {course.instructor_name || course.instructor}
                  </div>
                  {course.instructor_bio && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.15rem' }}>
                      {course.instructor_bio}
                    </div>
                  )}
                </div>
              </div>

              {/* Curriculum Lessons Preview */}
              {course.lessons && course.lessons.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                    Danh sách bài giảng ({course.lessons.length} bài)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {course.lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.55rem 0.75rem',
                          backgroundColor: '#f8fafc',
                          borderRadius: '0.375rem',
                          fontSize: '0.825rem',
                          border: '1px solid #f1f5f9'
                        }}
                      >
                        <span style={{ fontWeight: 700, color: '#64748b', width: '22px' }}>
                          #{idx + 1}
                        </span>
                        <FileText size={15} style={{ color: '#2563eb' }} />
                        <span style={{ fontWeight: 600, color: '#1e293b', flex: 1 }}>
                          {lesson.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #f1f5f9',
                  fontSize: '0.75rem',
                  color: '#94a3b8'
                }}
              >
                <span>Ngày tạo: {course.created_at ? new Date(course.created_at).toLocaleDateString('vi-VN') : 'N/A'}</span>
                <span>Cập nhật: {course.updated_at ? new Date(course.updated_at).toLocaleDateString('vi-VN') : 'N/A'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}
        >
          {course && (
            <a
              href={`/courses/${course.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.85rem',
                color: '#2563eb',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Mở trang khóa học công khai <ExternalLink size={14} />
            </a>
          )}

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Đóng
            </button>

            {course && canModify && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(course);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.5rem 1.15rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <Edit2 size={15} /> Chỉnh sửa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
