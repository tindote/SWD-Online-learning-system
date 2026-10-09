import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseApi } from '../services/courseApi';
import { enrollmentApi } from '../services/enrollmentApi';
import { reviewApi } from '../services/reviewApi';
import { Course } from '../types/course';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Star,
  Users,
  PlayCircle,
  FileText,
  ArrowRight,
  ShieldAlert,
  Send,
  ExternalLink
} from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [enrolling, setEnrolling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Review state
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  const fetchCourseDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await courseApi.getCourseById(Number(id));
      setCourse(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id, isAuthenticated]);

  const isInstructorOwner = Boolean(
    user && (
      course?.isInstructorOwner ||
      (course?.instructor_id != null && Number(course.instructor_id) === Number(user.id)) ||
      (user.name && (
        (course?.instructor && course.instructor.trim().toLowerCase() === user.name.trim().toLowerCase()) ||
        (course?.instructor_name && course.instructor_name.trim().toLowerCase() === user.name.trim().toLowerCase())
      ))
    )
  );

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }

    if (!course) return;

    // If it's the instructor's own course, directly open the lessons without showing any error
    if (isInstructorOwner) {
      navigate(`/learn/${course.id}`);
      return;
    }

    setEnrolling(true);
    setMessage(null);
    try {
      await enrollmentApi.enrollInCourse(course.id);
      setMessage({ type: 'success', text: 'Chúc mừng bạn đã ghi danh khóa học thành công!' });
      // Refresh course state
      await fetchCourseDetails();
    } catch (err: any) {
      // If it's the instructor's own course, directly navigate to classroom
      if (err.response?.status === 400 && err.response?.data?.message?.includes('giảng viên')) {
        navigate(`/learn/${course.id}`);
        return;
      }
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Đăng ký không thành công'
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    setSubmittingReview(true);
    try {
      await reviewApi.createReview({
        course_id: course.id,
        rating,
        review: reviewText.trim()
      });
      setReviewText('');
      setMessage({ type: 'success', text: 'Cảm ơn bạn đã gửi đánh giá cho khóa học!' });
      await fetchCourseDetails();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Không thể gửi đánh giá'
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="state-card" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <p>Đang tải thông tin chi tiết khóa học...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="state-card state-error" style={{ minHeight: '60vh' }}>
        <ShieldAlert size={48} />
        <h2>{error || 'Không tìm thấy khóa học'}</h2>
        <Link to="/courses" className="btn btn-primary">
          Quay lại danh mục khóa học
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Toast Alert */}
      {message && (
        <div className={`toast toast-${message.type}`} style={{ zIndex: 3000 }}>
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '10px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
          padding: '56px 24px'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', marginBottom: '16px' }}>
            <span
              className="badge category-badge"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: 600 }}
            >
              {course.category}
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 800,
              lineHeight: 1.3,
              marginBottom: '16px',
              maxWidth: '850px'
            }}
          >
            {course.title}
          </h1>

          <p style={{ color: '#c7d2fe', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '800px', marginBottom: '24px' }}>
            {course.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', fontSize: '0.9rem', color: '#e0e7ff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}
              >
                {course.instructor.charAt(0)}
              </div>
              <span>Giảng viên: <strong>{course.instructor}</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={18} color="#fbbf24" fill="#fbbf24" />
              <span>
                <strong>{course.average_rating ? Number(course.average_rating).toFixed(1) : '5.0'}</strong> ({course.reviews_count || 3} đánh giá)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={18} color="#93c5fd" />
              <span>{course.enrollments_count || 12} học viên đã đăng ký</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '40px', alignItems: 'start' }} className="course-detail-grid">
          {/* Left Column: Curriculum & Overview */}
          <div>
            {/* What you'll learn */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '28px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '32px'
              }}
            >
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                Bạn sẽ học được gì từ khóa học này?
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span style={{ fontSize: '0.9rem', color: '#334155' }}>Nắm vững kiến thức nền tảng và chuyên sâu về {course.category}.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span style={{ fontSize: '0.9rem', color: '#334155' }}>Thực hành xây dựng các dự án thực tế sát với yêu cầu doanh nghiệp.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span style={{ fontSize: '0.9rem', color: '#334155' }}>Hoàn thành các bài tập có chấm điểm và nhận xét chi tiết.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span style={{ fontSize: '0.9rem', color: '#334155' }}>Được cấp chứng nhận hoàn thành khi đạt 100% tiến độ bài học.</span>
                </div>
              </div>
            </div>

            {/* Course Curriculum / Lessons */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '28px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '32px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>Nội dung khóa học</h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {course.lessons?.length || 0} bài giảng chất lượng cao
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {course.lessons && course.lessons.length > 0 ? (
                  course.lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '10px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: '#eef2ff',
                            color: '#4f46e5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                            {lesson.title}
                          </div>
                          {lesson.video_url && (
                            <span style={{ fontSize: '0.75rem', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <PlayCircle size={14} /> Video bài giảng
                            </span>
                          )}
                        </div>
                      </div>

                      {course.isEnrolled && (
                        <Link
                          to={`/learn/${course.id}/lesson/${lesson.id}`}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', textDecoration: 'none' }}
                        >
                          Học bài
                        </Link>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Bài giảng đang được cập nhật...</p>
                )}
              </div>
            </div>

            {/* Instructor Bio Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '28px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '32px'
              }}
            >
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                Giảng viên hướng dẫn
              </h2>
              <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    flexShrink: 0
                  }}
                >
                  {course.instructor.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{course.instructor}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#6366f1', marginBottom: '8px' }}>Chuyên gia đào tạo công nghệ cao</p>
                  <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
                    {course.instructor_bio || 'Giảng viên giàu kinh nghiệm giảng dạy và phát triển sản phẩm công nghệ quy mô lớn, luôn nhiệt huyết đồng hành và hỗ trợ học viên.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '28px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
                Đánh giá từ học viên ({course.reviews?.length || 0})
              </h2>

              {/* Review Submission Form if Enrolled and not course owner */}
              {course.isEnrolled && !isInstructorOwner && (
                <form
                  onSubmit={handleReviewSubmit}
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '10px' }}>
                    Để lại cảm nhận của bạn về khóa học
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>Đánh giá:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                      >
                        <Star
                          size={20}
                          color="#f59e0b"
                          fill={star <= rating ? '#f59e0b' : 'none'}
                        />
                      </button>
                    ))}
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginLeft: '6px' }}>
                      {rating} sao
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Viết nhận xét chi tiết của bạn về khóa học..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      marginBottom: '12px'
                    }}
                  />

                  <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                    <Send size={16} /> {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {course.reviews && course.reviews.length > 0 ? (
                  course.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                          {rev.user_name || 'Học viên'}
                        </span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              color="#f59e0b"
                              fill={s <= rev.rating ? '#f59e0b' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                        {rev.review || 'Khóa học rất hay và bổ ích.'}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                        {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Chưa có đánh giá nào cho khóa học này.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Action & Pricing Card */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {/* Thumbnail */}
              <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                  alt={course.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px' }}>
                  {course.price === 0 ? (
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb' }}>Miễn phí</span>
                  ) : (
                    <>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>
                        ${Number(course.price).toFixed(2)}
                      </span>
                      <span style={{ fontSize: '1rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                        ${(Number(course.price) * 1.5).toFixed(2)}
                      </span>
                    </>
                  )}
                </div>

                {/* Primary Action Button */}
                {isInstructorOwner ? (
                  <Link
                    to={`/learn/${course.id}`}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem', textDecoration: 'none' }}
                  >
                    <PlayCircle size={18} /> Vào xem bài giảng <ArrowRight size={18} />
                  </Link>
                ) : course.isEnrolled ? (
                  <div>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, color: '#475569' }}>Tiến độ học tập:</span>
                        <span style={{ fontWeight: 700, color: '#4f46e5' }}>{course.progressPercentage || 0}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${course.progressPercentage || 0}%`,
                            height: '100%',
                            backgroundColor: '#4f46e5',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                    </div>

                    <Link
                      to={`/learn/${course.id}`}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem', textDecoration: 'none' }}
                    >
                      Tiếp tục học <ArrowRight size={18} />
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
                  >
                    {enrolling ? 'Đang ghi danh...' : !isAuthenticated ? 'Đăng nhập để đăng ký học' : 'Đăng ký khóa học ngay'}
                  </button>
                )}

                {/* Features List */}
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                    Khóa học bao gồm:
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#475569' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PlayCircle size={16} color="#4f46e5" /> {course.lessons?.length || 4} bài giảng video & tài liệu
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} color="#4f46e5" /> Bài tập thực hành có chấm điểm
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} color="#4f46e5" /> Quyền truy cập trọn đời
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={16} color="#4f46e5" /> Chứng nhận hoàn thành khóa học
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
