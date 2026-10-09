import React, { useState, useEffect } from 'react';
import { assignmentApi } from '../services/assignmentApi';
import { submissionApi } from '../services/submissionApi';
import { Assignment } from '../types/assignment';
import { Submission } from '../types/submission';
import {
  ClipboardList,
  Calendar,
  Send,
  CheckCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Award,
  AlertCircle
} from 'lucide-react';

export const StudentAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal submission state
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submitContent, setSubmitContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignData, subData] = await Promise.all([
        assignmentApi.getAssignments({ as_student: 'true' }),
        submissionApi.getSubmissions({ my_submissions: 'true' })
      ]);
      setAssignments(assignData);
      setSubmissions(subData);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách bài tập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openSubmitModal = (assign: Assignment) => {
    setSelectedAssignment(assign);
    // If student already has a submission for this assignment, prepopulate content
    const existing = submissions.find(s => s.assignment_id === assign.id);
    setSubmitContent(existing ? existing.content : '');
  };

  const closeSubmitModal = () => {
    setSelectedAssignment(null);
    setSubmitContent('');
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !submitContent.trim()) return;

    setIsSubmitting(true);
    try {
      await submissionApi.createSubmission({
        assignment_id: selectedAssignment.id,
        content: submitContent.trim()
      });
      setToastMessage({ type: 'success', text: 'Nộp bài tập thành công!' });
      closeSubmitModal();
      await fetchData();
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || 'Lỗi khi nộp bài tập'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="state-card">
        <div className="spinner" />
        <p>Đang tải danh sách bài tập của bạn...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {toastMessage && (
        <div className={`toast toast-${toastMessage.type}`}>
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '10px' }}>
            ✕
          </button>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Bài tập & Điểm số</h1>
          <p className="page-subtitle">Theo dõi các bài tập thực hành trong các khóa học bạn đang tham gia</p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="state-card state-empty">
          <ClipboardList size={48} color="#94a3b8" />
          <h3>Chưa có bài tập nào được giao</h3>
          <p>Các bài tập sẽ xuất hiện tại đây khi giảng viên giao bài cho các khóa học bạn đã đăng ký.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {assignments.map((assign) => {
            const userSub = submissions.find(s => s.assignment_id === assign.id);
            const isGraded = userSub && userSub.grade !== null && userSub.grade !== undefined;
            const isSubmitted = !!userSub;

            return (
              <div
                key={assign.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span className="badge category-badge" style={{ marginBottom: '8px' }}>
                      {assign.course_title}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                      {assign.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isGraded ? (
                      <span className="badge grade-badge" style={{ fontSize: '1rem', padding: '6px 14px' }}>
                        <Award size={16} /> Điểm: {userSub.grade}/100
                      </span>
                    ) : isSubmitted ? (
                      <span className="badge status-active" style={{ fontSize: '0.85rem' }}>
                        <Clock size={14} /> Đã nộp bài (Chờ chấm)
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.85rem' }}>
                        <AlertCircle size={14} /> Chưa nộp bài
                      </span>
                    )}

                    <button
                      className="btn btn-primary"
                      onClick={() => openSubmitModal(assign)}
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      <Send size={14} /> {isSubmitted ? 'Sửa bài nộp' : 'Nộp bài ngay'}
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                  {assign.description || 'Không có mô tả chi tiết cho bài tập này.'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} />
                    <span>Hạn nộp: {assign.due_date ? new Date(assign.due_date).toLocaleString('vi-VN') : 'Không giới hạn'}</span>
                  </div>
                </div>

                {/* Submitted Content Preview */}
                {userSub && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Bài làm của bạn (nộp lúc: {new Date(userSub.submitted_at).toLocaleString('vi-VN')}):
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#0f172a', wordBreak: 'break-all' }}>
                      {userSub.content.startsWith('http') ? (
                        <a
                          href={userSub.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="content-url-link"
                          style={{ fontSize: '0.9rem' }}
                        >
                          <ExternalLink size={14} /> {userSub.content}
                        </a>
                      ) : (
                        userSub.content
                      )}
                    </div>

                    {/* Feedback from Instructor */}
                    {userSub.feedback && (
                      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <MessageSquare size={16} color="#4f46e5" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5' }}>Nhận xét từ Giảng viên: </span>
                          <span style={{ fontSize: '0.85rem', color: '#334155' }}>{userSub.feedback}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="modal-overlay" onClick={closeSubmitModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nộp bài tập</h2>
              <button className="icon-btn" onClick={closeSubmitModal}>✕</button>
            </div>

            <form onSubmit={handleSubmitAssignment}>
              <div style={{ marginBottom: '16px' }}>
                <span className="badge category-badge" style={{ marginBottom: '6px' }}>
                  {selectedAssignment.course_title}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  {selectedAssignment.title}
                </h3>
              </div>

              <div className="form-group">
                <label htmlFor="submit-content">
                  Nội dung bài nộp / Đường dẫn GitHub / Demo URL <span className="required">*</span>
                </label>
                <textarea
                  id="submit-content"
                  rows={5}
                  placeholder="Dán đường dẫn kho lưu trữ GitHub (ví dụ: https://github.com/username/project) hoặc câu trả lời bài tập của bạn tại đây..."
                  value={submitContent}
                  onChange={(e) => setSubmitContent(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeSubmitModal}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  <Send size={16} /> {isSubmitting ? 'Đang gửi bài...' : 'Xác nhận nộp bài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
