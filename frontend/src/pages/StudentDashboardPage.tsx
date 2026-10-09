import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../services/dashboardApi';
import { enrollmentApi } from '../services/enrollmentApi';
import { StudentDashboardStats } from '../types/dashboard';
import { MyEnrollmentCourse } from '../types/enrollment';
import {
  BookOpen,
  GraduationCap,
  Clock,
  Award,
  ArrowRight,
  ClipboardList,
  Sparkles,
  PlayCircle
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [myCourses, setMyCourses] = useState<MyEnrollmentCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsData, coursesData] = await Promise.all([
          dashboardApi.getStudentStats(),
          enrollmentApi.getMyEnrollments()
        ]);
        setStats(statsData);
        setMyCourses(coursesData);
      } catch (err: any) {
        console.error('Error fetching student dashboard:', err);
        setError(err.message || 'Lỗi khi tải bảng điều khiển');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="state-card">
        <div className="spinner" />
        <p>Đang tải không gian học tập của bạn...</p>
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
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
          borderRadius: '16px',
          padding: '32px',
          color: '#ffffff',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#c7d2fe', marginBottom: '8px' }}>
            <Sparkles size={16} color="#fbbf24" />
            <span>Chào mừng trở lại!</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>
            Xin chào, {user?.name}!
          </h1>
          <p style={{ color: '#e0e7ff', fontSize: '0.95rem', marginTop: '6px' }}>
            Tiếp tục lộ trình học tập để sớm đạt được chứng chỉ và hoàn thành mục tiêu nghề nghiệp.
          </p>
        </div>

        <Link
          to="/courses"
          className="btn"
          style={{
            backgroundColor: '#ffffff',
            color: '#4338ca',
            fontWeight: 700,
            padding: '12px 20px',
            textDecoration: 'none'
          }}
        >
          <BookOpen size={18} /> Khám phá thêm khóa học
        </Link>
      </div>

      {/* 4 Metric Cards */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-top">
            <span className="card-title">Khóa học đã đăng ký</span>
            <div className="icon-wrapper" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
              <BookOpen size={24} />
            </div>
          </div>
          <div className="card-count">{stats?.enrolledCount || 0}</div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Đang theo học các chuyên đề</span>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <span className="card-title">Đang học tích cực</span>
            <div className="icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <Clock size={24} />
            </div>
          </div>
          <div className="card-count">{stats?.activeCoursesCount || 0}</div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Khóa học cần tiếp tục</span>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <span className="card-title">Khóa học hoàn thành</span>
            <div className="icon-wrapper" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
              <Award size={24} />
            </div>
          </div>
          <div className="card-count">{stats?.completedCoursesCount || 0}</div>
          <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>100% tiến độ bài học</span>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <span className="card-title">Điểm trung bình</span>
            <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
              <GraduationCap size={24} />
            </div>
          </div>
          <div className="card-count">{stats?.averageGrade ? `${stats.averageGrade}/100` : 'Chưa có'}</div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Từ các bài tập đã chấm</span>
        </div>
      </div>

      {/* My Enrolled Courses Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
              Khóa học của tôi
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Tiếp tục học ngay từ vị trí bài học gần nhất</p>
          </div>
          <Link to="/student/courses" style={{ fontSize: '0.875rem', color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
            Xem tất cả &rarr;
          </Link>
        </div>

        {myCourses.length === 0 ? (
          <div className="state-card state-empty">
            <BookOpen size={48} color="#94a3b8" />
            <h3>Bạn chưa đăng ký khóa học nào</h3>
            <p>Khám phá kho khóa học công nghệ thực chiến và bắt đầu học ngay hôm nay.</p>
            <Link to="/courses" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Khám phá khóa học ngay
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {myCourses.map((c) => (
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
                <div style={{ height: '140px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                    alt={c.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    <span className={`badge status-${c.enrollment_status}`}>
                      {c.enrollment_status === 'completed' ? 'Đã hoàn thành' : 'Đang học'}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', lineHeight: 1.4 }}>
                    {c.title}
                  </h3>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
                    Giảng viên: <strong>{c.instructor}</strong>
                  </div>

                  {/* Progress bar */}
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
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                      Đã học {c.completed_lessons} / {c.total_lessons} bài giảng
                    </div>
                  </div>

                  <Link
                    to={`/learn/${c.course_id}`}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                  >
                    <PlayCircle size={16} /> Tiếp tục học
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Assignments */}
      {stats?.upcomingAssignments && stats.upcomingAssignments.length > 0 && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={20} color="#4f46e5" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                Bài tập sắp đến hạn
              </h3>
            </div>
            <Link to="/student/assignments" style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
              Xem tất cả bài tập &rarr;
            </Link>
          </div>

          <div className="table-responsive">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Khóa học</th>
                  <th>Bài tập</th>
                  <th>Hạn nộp</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {stats.upcomingAssignments.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{a.course_title}</td>
                    <td>{a.title}</td>
                    <td style={{ color: '#64748b' }}>
                      {a.due_date ? new Date(a.due_date).toLocaleString('vi-VN') : 'Không giới hạn'}
                    </td>
                    <td>
                      {a.grade !== null && a.grade !== undefined ? (
                        <span className="badge grade-badge">{a.grade}/100</span>
                      ) : a.submission_id ? (
                        <span className="badge status-active">Đã nộp bài</span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>Chưa nộp</span>
                      )}
                    </td>
                    <td className="text-right">
                      <Link to="/student/assignments" className="action-btn edit-btn" style={{ textDecoration: 'none' }}>
                        Nộp bài
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
