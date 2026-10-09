import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { learningApi } from '../services/learningApi';
import { CourseLearningData, LessonWithProgress } from '../types/progress';
import {
  GraduationCap,
  ArrowLeft,
  CheckCircle,
  PlayCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Award,
  BookOpen
} from 'lucide-react';

export const LearningPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId?: string }>();
  const navigate = useNavigate();

  const [learningData, setLearningData] = useState<CourseLearningData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLearning = async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await learningApi.getCourseLearning(Number(courseId));
      setLearningData(data);

      // Select active lesson
      if (data.lessons && data.lessons.length > 0) {
        if (lessonId) {
          const found = data.lessons.find(l => l.id === Number(lessonId));
          setCurrentLesson(found || data.lessons[0]);
        } else {
          // Find first uncompleted lesson, or the first lesson
          const firstIncomplete = data.lessons.find(l => !l.isCompleted);
          setCurrentLesson(firstIncomplete || data.lessons[0]);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi tải phòng học trực tuyến');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearning();
  }, [courseId]);

  // When URL lessonId changes
  useEffect(() => {
    if (learningData && learningData.lessons && lessonId) {
      const found = learningData.lessons.find(l => l.id === Number(lessonId));
      if (found) setCurrentLesson(found);
    }
  }, [lessonId, learningData]);

  const handleToggleComplete = async () => {
    if (!learningData || !currentLesson) return;

    setToggling(true);
    try {
      const res = await learningApi.toggleLessonProgress(learningData.course.id, currentLesson.id);

      // Update local state
      setLearningData(prev => {
        if (!prev) return null;
        const updatedLessons = prev.lessons.map(l =>
          l.id === currentLesson.id ? { ...l, isCompleted: res.isCompleted } : l
        );
        return {
          ...prev,
          lessons: updatedLessons,
          progressPercentage: res.progressPercentage,
          completedCount: res.completedCount
        };
      });

      setCurrentLesson(prev => prev ? { ...prev, isCompleted: res.isCompleted } : null);
    } catch (err: any) {
      console.error('Error toggling complete:', err);
    } finally {
      setToggling(false);
    }
  };

  const handleSelectLesson = (lesson: LessonWithProgress) => {
    setCurrentLesson(lesson);
    navigate(`/learn/${courseId}/lesson/${lesson.id}`);
  };

  // Previous and Next navigation
  const currentIndex = learningData?.lessons.findIndex(l => l.id === currentLesson?.id) ?? -1;
  const prevLesson = currentIndex > 0 ? learningData?.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex !== -1 && learningData && currentIndex < learningData.lessons.length - 1
    ? learningData.lessons[currentIndex + 1]
    : null;

  if (loading) {
    return (
      <div className="state-card" style={{ minHeight: '80vh' }}>
        <div className="spinner" />
        <p>Đang chuẩn bị bài học cho bạn...</p>
      </div>
    );
  }

  if (error || !learningData) {
    return (
      <div className="state-card state-error" style={{ minHeight: '80vh' }}>
        <h2>{error || 'Không thể truy cập phòng học'}</h2>
        <Link to="/courses" className="btn btn-primary">Quay lại danh mục</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top Navbar */}
      <header
        style={{
          height: '60px',
          backgroundColor: '#1e1b4b',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            to="/student/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#c7d2fe',
              textDecoration: 'none',
              fontSize: '0.85rem'
            }}
          >
            <ArrowLeft size={16} /> Rời phòng học
          </Link>
          <div style={{ height: '20px', width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
            {learningData.course.title}
          </h2>
        </div>

        {/* Progress Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#c7d2fe' }}>
              Tiến độ: <strong>{learningData.progressPercentage}%</strong>
            </div>
          </div>
          <div style={{ width: '100px', height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${learningData.progressPercentage}%`,
                height: '100%',
                backgroundColor: learningData.progressPercentage === 100 ? '#10b981' : '#6366f1',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      </header>

      {/* Classroom Body (Left Syllabus Sidebar + Right Content Area) */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }} className="classroom-container">
        {/* Left Lesson Navigation Sidebar */}
        <aside
          style={{
            width: '320px',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}
          className="classroom-sidebar"
        >
          <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Danh sách bài học</h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
              Đã hoàn thành {learningData.completedCount} / {learningData.totalLessons} bài học
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {learningData.lessons.map((lesson, idx) => {
              const isActive = currentLesson?.id === lesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#eef2ff' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: lesson.isCompleted ? '#dcfce7' : isActive ? '#4f46e5' : '#f1f5f9',
                        color: lesson.isCompleted ? '#15803d' : isActive ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {lesson.isCompleted ? '✓' : idx + 1}
                    </div>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#4f46e5' : '#334155',
                        lineHeight: 1.3
                      }}
                    >
                      {lesson.title}
                    </span>
                  </div>

                  {isActive && <span style={{ color: '#4f46e5', fontWeight: 700 }}>&rarr;</span>}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '36px' }}>
          {currentLesson ? (
            <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
              {/* Lesson Title */}
              <div style={{ marginBottom: '24px' }}>
                <span className="badge category-badge" style={{ marginBottom: '8px' }}>
                  Bài học #{currentLesson.lesson_order}
                </span>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
                  {currentLesson.title}
                </h1>
              </div>

              {/* Video Player Area */}
              {currentLesson.video_url && (
                <div
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: '#000000',
                    marginBottom: '28px',
                    boxShadow: 'var(--shadow-md)',
                    position: 'relative',
                    paddingBottom: '56.25%', // 16:9 aspect ratio
                    height: 0
                  }}
                >
                  <iframe
                    src={currentLesson.video_url}
                    title={currentLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  />
                </div>
              )}

              {/* Resource Download / Link */}
              {currentLesson.resource_url && (
                <div
                  style={{
                    backgroundColor: '#eef2ff',
                    border: '1px solid #c7d2fe',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '24px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} color="#4f46e5" />
                    <span style={{ fontSize: '0.9rem', color: '#1e1b4b', fontWeight: 600 }}>Tài liệu tham khảo đính kèm</span>
                  </div>
                  <a
                    href={currentLesson.resource_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem', textDecoration: 'none' }}
                  >
                    Xem tài liệu <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {/* Lesson Text / Syllabus Content */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '32px',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'var(--shadow-sm)',
                  marginBottom: '36px',
                  lineHeight: 1.7,
                  color: '#334155',
                  fontSize: '0.95rem'
                }}
              >
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
                  Nội dung chi tiết bài học
                </h3>
                <p style={{ whiteSpace: 'pre-line' }}>
                  {currentLesson.content || 'Nội dung bài giảng đang được đồng bộ hóa.'}
                </p>
              </div>

              {/* Bottom Controls Bar (Previous, Mark Complete, Next) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '20px',
                  borderTop: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={!prevLesson}
                  onClick={() => prevLesson && handleSelectLesson(prevLesson)}
                >
                  <ChevronLeft size={16} /> Bài trước
                </button>

                <button
                  type="button"
                  className={`btn ${currentLesson.isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                  disabled={toggling}
                  onClick={handleToggleComplete}
                  style={{
                    backgroundColor: currentLesson.isCompleted ? '#dcfce7' : undefined,
                    color: currentLesson.isCompleted ? '#15803d' : undefined,
                    borderColor: currentLesson.isCompleted ? '#86efac' : undefined
                  }}
                >
                  <CheckCircle size={16} />
                  {currentLesson.isCompleted ? '✓ Đã hoàn thành (Bấm để hủy)' : 'Đánh dấu đã hoàn thành'}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && handleSelectLesson(nextLesson)}
                >
                  Bài kế tiếp <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <p>Chọn bài học để bắt đầu học tập.</p>
          )}
        </main>
      </div>
    </div>
  );
};
