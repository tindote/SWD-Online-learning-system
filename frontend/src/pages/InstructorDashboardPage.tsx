import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../services/dashboardApi';
import { submissionApi } from '../services/submissionApi';
import { InstructorDashboardStats } from '../types/dashboard';
import {
  BookOpen,
  Users,
  ClipboardList,
  Clock,
  Star,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export const InstructorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<InstructorDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Grading modal state
  const [gradingSubId, setGradingSubId] = useState<number | null>(null);
  const [gradeValue, setGradeValue] = useState<string>('');
  const [feedbackValue, setFeedbackValue] = useState<string>('');
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getInstructorStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải bảng điều khiển giảng viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleOpenGrading = (subId: number) => {
    setGradingSubId(subId);
    setGradeValue('90');
    setFeedbackValue('Bài làm tốt, cấu trúc rõ ràng!');
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubId) return;

    const numGrade = parseFloat(gradeValue);
    if (isNaN(numGrade) || numGrade < 0 || numGrade > 100) {
      alert('Điểm số phải từ 0 đến 100');
      return;
    }

    setIsGrading(true);
    try {
      await submissionApi.gradeSubmission(gradingSubId, {
        grade: numGrade,
        feedback: feedbackValue.trim()
      });
      setToastMessage('Đã chấm điểm và gửi nhận xét thành công!');
      setGradingSubId(null);
      await fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi chấm điểm');
    } finally {
      setIsGrading(false);
    }
  };

  if (loading) {
    return (
      <div className="state-card">
        <div className="spinner" />
        <p>Đang tải thông tin giảng viên...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {toastMessage && (
        <div className="toast toast-success">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '10px' }}>
            ✕
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
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
            <span>Khu vực Giảng viên</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>
            Xin chào, Giảng viên {user?.name}!
          </h1>
          <p style={{ color: '#e0e7ff', fontSize: '0.95rem', marginTop: '6px' }}>
            Quản lý các khóa học, theo dõi học viên và đánh giá kết quả bài tập của lớp bạn phụ trách.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            to="/instructor/courses"
            className="btn"
            style={{ backgroundColor: '#ffffff', color: '#1e1b4b', fontWeight: 700, textDecoration: 'none' }}
          >
            <BookOpen size={18} /> Khóa học của tôi
          </Link>
          <Link
            to="/instructor/submissions"
            className="btn btn-primary"
            style={{ backgroundColor: '#4f46e5', textDecoration: 'none' }}
          >
            <ClipboardList size={18} /> Chấm bài nộp
          </Link>
        </div>
      </div>

      {/* 5 Stats Cards */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-top">
            <span className="card-title">Khóa học phụ trách</span>
            <div className="icon-wrapper" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
              <BookOpen size={24} />
            </div>
          </div>
          <div className="card-count">{stats?.totalCourses || 0}</div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Khóa học do bạn tạo</span>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <span className="card-title">Học viên theo học</span>
            <div className="icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <Users size={24} />
            </div>
          </div>
          <div className="card-count">{stats?.totalStudents || 0}</div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Học viên đã đăng ký</span>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <span className="card-title">Bài tập đã giao</span>
            <div className="icon-wrapper" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
              <ClipboardList size={24} />
            </div>
          </div>
          <div className="card-count">{stats?.totalAssignments || 0}</div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Nhiệm vụ cho học viên</span>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <span className="card-title">Bài chờ chấm điểm</span>
            <div className="icon-wrapper" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
              <Clock size={24} />
            </div>
          </div>
          <div className="card-count" style={{ color: (stats?.pendingGradingCount || 0) > 0 ? '#dc2626' : undefined }}>
            {stats?.pendingGradingCount || 0}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600 }}>Cần hoàn tất chấm</span>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <span className="card-title">Đánh giá trung bình</span>
            <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
              <Star size={24} />
            </div>
          </div>
          <div className="card-count">{stats?.averageRating ? `${stats.averageRating} ★` : '5.0 ★'}</div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Từ đánh giá của học viên</span>
        </div>
      </div>

      {/* Pending Submissions Queue */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>
              Danh sách bài nộp chờ chấm điểm
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Chấm điểm và phản hồi nhận xét trực tiếp cho học viên</p>
          </div>
          <Link to="/instructor/submissions" style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
            Xem toàn bộ bài nộp &rarr;
          </Link>
        </div>

        {!stats?.pendingSubmissions || stats.pendingSubmissions.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#10b981', backgroundColor: '#f0fdf4', borderRadius: '12px' }}>
            <CheckCircle size={36} style={{ marginBottom: '8px' }} />
            <div style={{ fontWeight: 600 }}>Tuyệt vời! Không có bài nộp nào đang chờ chấm điểm.</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Bài tập</th>
                  <th>Khóa học</th>
                  <th>Thời gian nộp</th>
                  <th>Bài làm</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {stats.pendingSubmissions.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{sub.user_name}</td>
                    <td>{sub.assignment_title}</td>
                    <td><span className="badge category-badge">{sub.course_title}</span></td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {new Date(sub.submitted_at).toLocaleString('vi-VN')}
                    </td>
                    <td>
                      {sub.content.startsWith('http') ? (
                        <a
                          href={sub.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="content-url-link"
                        >
                          <ExternalLink size={14} /> Mở bài làm
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                          {sub.content.length > 40 ? sub.content.slice(0, 40) + '...' : sub.content}
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleOpenGrading(sub.id)}
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        Chấm bài ngay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grading Modal */}
      {gradingSubId && (
        <div className="modal-overlay" onClick={() => setGradingSubId(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chấm điểm & Nhận xét bài làm</h2>
              <button className="icon-btn" onClick={() => setGradingSubId(null)}>✕</button>
            </div>

            <form onSubmit={handleGradeSubmit}>
              <div className="form-group">
                <label htmlFor="grade-input">
                  Điểm số (Thang điểm 0 - 100) <span className="required">*</span>
                </label>
                <input
                  id="grade-input"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="feedback-input">
                  Nhận xét / Phản hồi chi tiết cho học viên
                </label>
                <textarea
                  id="feedback-input"
                  rows={4}
                  placeholder="Ghi nhận xét ưu điểm, những chỗ cần cải thiện hoặc lời khuyên cho học viên..."
                  value={feedbackValue}
                  onChange={(e) => setFeedbackValue(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setGradingSubId(null)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={isGrading}>
                  {isGrading ? 'Đang lưu...' : 'Lưu kết quả chấm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
