import React from 'react';
import {
  BookOpen,
  Plus,
  RefreshCw,
  LayoutGrid,
  List,
  CheckCircle2,
  FileText,
  Star,
  Users,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { Course } from '../../types/course';
import { useAuth } from '../../context/AuthContext';

interface IndividualCourseHeaderProps {
  courses: Course[];
  isLoading: boolean;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  onRefresh: () => void;
  onOpenCreateModal: () => void;
}

export const IndividualCourseHeader: React.FC<IndividualCourseHeaderProps> = ({
  courses,
  isLoading,
  viewMode,
  onViewModeChange,
  onRefresh,
  onOpenCreateModal
}) => {
  const { user, isAuthenticated } = useAuth();
  const role = user?.role || 'guest';
  const canManage = role === 'admin' || role === 'instructor';

  // Metrics
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => (c.status || 'published') === 'published').length;
  const draftCourses = courses.filter(c => c.status === 'draft').length;
  const freeCourses = courses.filter(c => Number(c.price) === 0).length;
  const totalLessons = courses.reduce((acc, c) => acc + (Number(c.lessons_count) || 0), 0);
  const totalEnrollments = courses.reduce((acc, c) => acc + (Number(c.enrollments_count) || 0), 0);

  return (
    <div className="individual-crud-header-wrapper" style={{ marginBottom: '1.75rem' }}>
      {/* Title & Top Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe'
              }}
            >
              <GraduationCap size={14} /> Member 3 Assignment
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: role === 'admin' ? '#fdf2f8' : role === 'instructor' ? '#ecfdf5' : '#f1f5f9',
                color: role === 'admin' ? '#be185d' : role === 'instructor' ? '#047857' : '#475569',
                border: `1px solid ${role === 'admin' ? '#fbcfe8' : role === 'instructor' ? '#a7f3d0' : '#e2e8f0'}`
              }}
            >
              <ShieldCheck size={13} />
              Vai trò: {role === 'admin' ? 'Quản trị viên (Admin)' : role === 'instructor' ? 'Giảng viên (Instructor)' : role === 'student' ? 'Học viên (Student)' : 'Khách (Guest)'}
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 800,
              color: '#0f172a',
              marginTop: '0.5rem',
              marginBottom: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            <BookOpen size={30} style={{ color: '#2563eb' }} />
            Course Management CRUD
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.925rem', margin: 0 }}>
            Quản lý toàn diện các khóa học trực tuyến (Tạo, Xem, Chỉnh sửa và Xóa) với xác thực quyền sở hữu và phân quyền đa cấp.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* View mode toggle */}
          <div
            style={{
              display: 'inline-flex',
              padding: '0.2rem',
              backgroundColor: '#f1f5f9',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0'
            }}
          >
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              title="Dạng bảng (Table View)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.65rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#0f172a' : '#64748b',
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <List size={16} /> Bảng
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              title="Dạng lưới (Grid View)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.65rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                color: viewMode === 'grid' ? '#0f172a' : '#64748b',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <LayoutGrid size={16} /> Lưới
            </button>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            title="Làm mới danh sách"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.55rem',
              borderRadius: '0.5rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <RefreshCw size={17} className={isLoading ? 'spin-anim' : ''} />
          </button>

          {/* Create button */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            disabled={!canManage}
            title={canManage ? 'Thêm khóa học mới' : 'Chỉ Giảng viên và Admin mới có quyền tạo khóa học'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.15rem',
              borderRadius: '0.5rem',
              backgroundColor: canManage ? '#2563eb' : '#94a3b8',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              cursor: canManage ? 'pointer' : 'not-allowed',
              boxShadow: canManage ? '0 2px 4px rgba(37,99,235,0.25)' : 'none',
              transition: 'background-color 0.15s'
            }}
          >
            <Plus size={18} />
            Thêm khóa học mới
          </button>
        </div>
      </div>

      {/* Role Notice Banner if not logged in or student */}
      {!canManage && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: '#d97706', fontSize: '1.25rem' }}>💡</span>
            <span style={{ fontSize: '0.875rem', color: '#92400e' }}>
              <strong>Chế độ xem:</strong> Bạn đang truy cập với vai trò <strong>{role === 'student' ? 'Học viên' : 'Khách chưa đăng nhập'}</strong> (chỉ có quyền xem và tìm kiếm khóa học). Để thực hiện <strong>Thêm, Sửa, Xóa</strong> khóa học, vui lòng đăng nhập với tài khoản <strong>Giảng viên (Instructor)</strong> hoặc <strong>Admin</strong>.
            </span>
          </div>
          {!isAuthenticated && (
            <a
              href="/login"
              style={{
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#2563eb',
                textDecoration: 'underline',
                whiteSpace: 'nowrap'
              }}
            >
              Đăng nhập ngay →
            </a>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '0.85rem',
          marginTop: '1.25rem'
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1rem',
            borderRadius: '0.625rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ color: '#64748b', fontSize: '0.775rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Tổng khóa học
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
            {totalCourses}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle2 size={12} /> {publishedCourses} Đã xuất bản
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1rem',
            borderRadius: '0.625rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ color: '#64748b', fontSize: '0.775rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Khóa học Bản nháp
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
            {draftCourses}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
            Chưa công khai ra ngoài
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1rem',
            borderRadius: '0.625rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ color: '#64748b', fontSize: '0.775rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Khóa học Miễn phí
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7', marginTop: '0.25rem' }}>
            {freeCourses}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
            Học viên tiếp cận tự do
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1rem',
            borderRadius: '0.625rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ color: '#64748b', fontSize: '0.775rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Tổng số bài giảng
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1', marginTop: '0.25rem' }}>
            {totalLessons}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <FileText size={12} /> Nội dung đào tạo
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1rem',
            borderRadius: '0.625rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ color: '#64748b', fontSize: '0.775rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Lượt ghi danh
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
            {totalEnrollments}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Users size={12} /> Học viên tham gia
          </div>
        </div>
      </div>
    </div>
  );
};
