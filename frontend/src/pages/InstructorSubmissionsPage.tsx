import React, { useState, useEffect } from 'react';
import { submissionApi } from '../services/submissionApi';
import { Submission } from '../types/submission';
import {
  Send,
  Award,
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  Clock
} from 'lucide-react';

export const InstructorSubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded'>('all');

  // Grading Modal
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('');
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await submissionApi.getSubmissions();
      setSubmissions(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách bài nộp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const openGradingModal = (sub: Submission) => {
    setActiveSubmission(sub);
    setGradeInput(sub.grade !== null && sub.grade !== undefined ? String(sub.grade) : '90');
    setFeedbackInput(sub.feedback || '');
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;

    const numGrade = parseFloat(gradeInput);
    if (isNaN(numGrade) || numGrade < 0 || numGrade > 100) {
      alert('Điểm số phải từ 0 đến 100');
      return;
    }

    setIsSubmitting(true);
    try {
      await submissionApi.gradeSubmission(activeSubmission.id, {
        grade: numGrade,
        feedback: feedbackInput.trim()
      });
      setToastMessage('Đã cập nhật điểm số và nhận xét thành công!');
      setActiveSubmission(null);
      await fetchSubmissions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi chấm điểm');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      (sub.user_name && sub.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.assignment_title && sub.assignment_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.course_title && sub.course_title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'pending') return sub.grade === null || sub.grade === undefined;
    if (statusFilter === 'graded') return sub.grade !== null && sub.grade !== undefined;
    return true;
  });

  if (loading) {
    return (
      <div className="state-card">
        <div className="spinner" />
        <p>Đang tải danh sách bài nộp của học viên...</p>
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

      <div className="page-header">
        <div>
          <h1 className="page-title">Chấm bài nộp của học viên</h1>
          <p className="page-subtitle">Theo dõi, đánh giá và gửi nhận xét phản hồi cho các bài tập</p>
        </div>
      </div>

      <div className="entity-list-container">
        {/* Toolbar */}
        <div className="list-toolbar">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên học viên, bài tập, khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn"
              style={{
                fontSize: '0.8rem',
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: statusFilter === 'all' ? '#4f46e5' : '#f1f5f9',
                color: statusFilter === 'all' ? '#ffffff' : '#475569',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setStatusFilter('all')}
            >
              Tất cả ({submissions.length})
            </button>
            <button
              className="btn"
              style={{
                fontSize: '0.8rem',
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: statusFilter === 'pending' ? '#ef4444' : '#f1f5f9',
                color: statusFilter === 'pending' ? '#ffffff' : '#475569',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setStatusFilter('pending')}
            >
              Chờ chấm ({submissions.filter(s => s.grade === null).length})
            </button>
            <button
              className="btn"
              style={{
                fontSize: '0.8rem',
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: statusFilter === 'graded' ? '#10b981' : '#f1f5f9',
                color: statusFilter === 'graded' ? '#ffffff' : '#475569',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setStatusFilter('graded')}
            >
              Đã chấm ({submissions.filter(s => s.grade !== null).length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="courses-table">
            <thead>
              <tr>
                <th>Học viên</th>
                <th>Bài tập</th>
                <th>Khóa học</th>
                <th>Thời gian nộp</th>
                <th>Bài làm</th>
                <th>Điểm số</th>
                <th className="text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    Không có bài nộp nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isGraded = sub.grade !== null && sub.grade !== undefined;
                  return (
                    <tr key={sub.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{sub.user_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{sub.user_email}</div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{sub.assignment_title}</td>
                      <td>
                        <span className="badge category-badge">{sub.course_title}</span>
                      </td>
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
                          <span style={{ fontSize: '0.85rem', color: '#334155' }}>
                            {sub.content.length > 35 ? sub.content.slice(0, 35) + '...' : sub.content}
                          </span>
                        )}
                      </td>
                      <td>
                        {isGraded ? (
                          <span className="badge grade-badge">{sub.grade}/100</span>
                        ) : (
                          <span className="badge status-active">Chờ chấm</span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          className="btn btn-primary"
                          onClick={() => openGradingModal(sub)}
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          <Award size={14} /> {isGraded ? 'Chấm lại' : 'Chấm điểm'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grading Modal */}
      {activeSubmission && (
        <div className="modal-overlay" onClick={() => setActiveSubmission(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chấm điểm bài nộp</h2>
              <button className="icon-btn" onClick={() => setActiveSubmission(null)}>✕</button>
            </div>

            <form onSubmit={handleGradeSubmit}>
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Học viên: <strong>{activeSubmission.user_name}</strong> ({activeSubmission.user_email})
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                  Bài tập: <strong>{activeSubmission.assignment_title}</strong> - {activeSubmission.course_title}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '6px' }}>
                  Nội dung bài làm:{' '}
                  {activeSubmission.content.startsWith('http') ? (
                    <a href={activeSubmission.content} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5' }}>
                      {activeSubmission.content}
                    </a>
                  ) : (
                    <span>{activeSubmission.content}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="modal-grade">
                  Điểm số (Thang điểm 0 - 100) <span className="required">*</span>
                </label>
                <input
                  id="modal-grade"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-feedback">
                  Nhận xét & Phản hồi chi tiết
                </label>
                <textarea
                  id="modal-feedback"
                  rows={4}
                  placeholder="Ghi nhận xét và chỉ dẫn cho học viên..."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveSubmission(null)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : 'Lưu kết quả chấm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
