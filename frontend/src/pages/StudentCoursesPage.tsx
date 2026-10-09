import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentApi } from '../services/enrollmentApi';
import { MyEnrollmentCourse } from '../types/enrollment';
import { BookOpen, PlayCircle, Award, Clock } from 'lucide-react';

export const StudentCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<MyEnrollmentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await enrollmentApi.getMyEnrollments();
        setCourses(data);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải danh sách khóa học');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="state-card">
        <div className="spinner" />
        <p>Đang tải danh sách khóa học của bạn...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-card state-error">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Khóa học của tôi</h1>
          <p className="page-subtitle">Quản lý và tiếp tục các khóa học bạn đã đăng ký</p>
        </div>
        <Link to="/courses" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <BookOpen size={18} /> Khám phá thêm khóa học
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="state-card state-empty">
          <BookOpen size={48} color="#94a3b8" />
          <h3>Bạn chưa đăng ký khóa học nào</h3>
          <p>Hãy tham gia ngay các khóa học chất lượng cao để tích lũy kiến thức và xây dựng hồ sơ chuyên nghiệp.</p>
          <Link to="/courses" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Xem danh mục khóa học
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
          {courses.map((c) => (
            <div
              key={c.enrollment_id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ height: '160px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                  alt={c.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                  <span className={`badge status-${c.enrollment_status}`}>
                    {c.enrollment_status === 'completed' ? 'Đã hoàn thành' : 'Đang học'}
                  </span>
                </div>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span className="badge category-badge" style={{ alignSelf: 'flex-start', marginBottom: '8px' }}>
                  {c.category}
                </span>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', lineHeight: 1.4 }}>
                  {c.title}
                </h3>

                <div style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '16px' }}>
                  Giảng viên: <strong>{c.instructor}</strong>
                </div>

                <div style={{ marginTop: 'auto', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ color: '#475569' }}>Tiến độ:</span>
                    <span style={{ fontWeight: 700, color: '#4f46e5' }}>{c.progress_percentage}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${c.progress_percentage}%`,
                        height: '100%',
                        backgroundColor: c.progress_percentage === 100 ? '#10b981' : '#4f46e5',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                    Đã hoàn thành {c.completed_lessons} / {c.total_lessons} bài học
                  </div>
                </div>

                <Link
                  to={`/learn/${c.course_id}`}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                >
                  <PlayCircle size={16} /> Vào học ngay
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
