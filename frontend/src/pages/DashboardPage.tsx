import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/dashboardApi';
import { DashboardStats } from '../types/dashboard';
import {
  BookOpen,
  Users,
  FolderTree,
  FileText,
  UserCheck,
  ClipboardList,
  Send,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Star,
  Award
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load dashboard stats:', err);
      setError(err.response?.data?.message || err.message || 'Không thể kết nối đến máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Khóa học hệ thống',
      count: stats?.totalCourses ?? 0,
      icon: BookOpen,
      color: '#4f46e5',
      bgColor: '#e0e7ff',
      link: '/admin/courses'
    },
    {
      title: 'Học viên (Students)',
      count: stats?.totalStudents ?? 0,
      icon: Users,
      color: '#0284c7',
      bgColor: '#e0f2fe',
      link: '/admin/users'
    },
    {
      title: 'Giảng viên (Instructors)',
      count: stats?.totalInstructors ?? 0,
      icon: Award,
      color: '#7c3aed',
      bgColor: '#ede9fe',
      link: '/admin/users'
    },
    {
      title: 'Tổng số Danh mục',
      count: stats?.totalCategories ?? 0,
      icon: FolderTree,
      color: '#059669',
      bgColor: '#d1fae5',
      link: '/admin/categories'
    },
    {
      title: 'Tổng số Bài học',
      count: stats?.totalLessons ?? 0,
      icon: FileText,
      color: '#d97706',
      bgColor: '#fef3c7',
      link: '/admin/lessons'
    },
    {
      title: 'Tổng số Đăng ký học',
      count: stats?.totalEnrollments ?? 0,
      icon: UserCheck,
      color: '#2563eb',
      bgColor: '#dbeafe',
      link: '/admin/enrollments'
    },
    {
      title: 'Tổng số Bài tập',
      count: stats?.totalAssignments ?? 0,
      icon: ClipboardList,
      color: '#db2777',
      bgColor: '#fce7f3',
      link: '/admin/assignments'
    },
    {
      title: 'Tổng số Bài nộp',
      count: stats?.totalSubmissions ?? 0,
      icon: Send,
      color: '#0d9488',
      bgColor: '#ccfbf1',
      link: '/admin/submissions'
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Tổng quan hệ thống (Admin Control)</h2>
          <p className="page-subtitle">Thống kê dữ liệu tổng hợp và hoạt động mới nhất trên hệ thống</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchStats} title="Làm mới thống kê">
          <RefreshCw size={18} /> Làm mới
        </button>
      </div>

      {isLoading ? (
        <div className="state-card">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu tổng quan...</p>
        </div>
      ) : error ? (
        <div className="state-card state-error">
          <AlertCircle size={40} />
          <h3>Không thể tải thống kê</h3>
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={fetchStats}>
            <RefreshCw size={16} /> Thử lại
          </button>
        </div>
      ) : (
        <>
          <div className="dashboard-grid">
            {cards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className="dashboard-card">
                  <div className="card-top">
                    <div className="icon-wrapper" style={{ backgroundColor: card.bgColor, color: card.color }}>
                      <Icon size={26} />
                    </div>
                    <span className="card-count">{card.count}</span>
                  </div>
                  <h3 className="card-title">{card.title}</h3>
                  <Link to={card.link} className="card-link">
                    Quản lý chi tiết <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Recent Activities Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '16px' }}>
            {/* Recent Enrollments */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Đăng ký học gần đây</h3>
                <Link to="/admin/enrollments" style={{ fontSize: '0.85rem', color: '#4f46e5', textDecoration: 'none' }}>
                  Xem tất cả
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats?.recentEnrollments && stats.recentEnrollments.length > 0 ? (
                  stats.recentEnrollments.map((e) => (
                    <div
                      key={e.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '10px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{e.user_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{e.course_title}</div>
                      </div>
                      <span className={`badge status-${e.status}`}>{e.status}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Chưa có đăng ký mới</p>
                )}
              </div>
            </div>

            {/* Recent Submissions */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Bài nộp mới nhất</h3>
                <Link to="/admin/submissions" style={{ fontSize: '0.85rem', color: '#4f46e5', textDecoration: 'none' }}>
                  Xem tất cả
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats?.recentSubmissions && stats.recentSubmissions.length > 0 ? (
                  stats.recentSubmissions.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '10px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{s.user_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.assignment_title} ({s.course_title})</div>
                      </div>
                      {s.grade !== null && s.grade !== undefined ? (
                        <span className="badge grade-badge">{s.grade}/100</span>
                      ) : (
                        <span className="badge status-active">Chờ chấm</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Chưa có bài nộp</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
