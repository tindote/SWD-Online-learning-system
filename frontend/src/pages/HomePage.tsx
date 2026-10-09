import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseApi } from '../services/courseApi';
import { categoryApi } from '../services/categoryApi';
import { enrollmentApi } from '../services/enrollmentApi';
import { useAuth } from '../context/AuthContext';
import { Course } from '../types/course';
import { Category } from '../types/category';
import { MyEnrollmentCourse } from '../types/enrollment';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Users,
  Award,
  Star,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Video,
  PlayCircle,
  LayoutDashboard,
  CheckCircle2,
  ClipboardList
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [myCourses, setMyCourses] = useState<MyEnrollmentCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseList, catList] = await Promise.all([
          courseApi.getCourses({ sortBy: 'rating' }),
          categoryApi.getCategories()
        ]);
        setCourses(courseList.slice(0, 6)); // Top 6 featured courses
        setCategories(catList.slice(0, 6));

        // If logged in (student, instructor, or admin), fetch enrolled courses to show "Resume Learning"
        if (isAuthenticated && user) {
          try {
            const enrolled = await enrollmentApi.getMyEnrollments();
            setMyCourses(enrolled.slice(0, 3)); // Top 3 active enrollments
          } catch (enrollErr) {
            console.error('Error fetching enrolled courses:', enrollErr);
          }
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);

  return (
    <div className="homepage-container">
      {/* 1. Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          color: '#ffffff',
          padding: '80px 24px 90px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Greeting Badge */}
          {isAuthenticated && user ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                padding: '8px 20px',
                borderRadius: '999px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: '20px',
                border: '1px solid rgba(255,255,255,0.25)'
              }}
            >
              <Sparkles size={16} color="#fbbf24" />
              👋 Xin chào, {user.name} ({user.role === 'admin' ? 'Quản trị viên' : user.role === 'instructor' ? 'Giảng viên' : 'Học viên'})
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#c7d2fe',
                marginBottom: '24px'
              }}
            >
              <Sparkles size={16} color="#fbbf24" />
              Nền tảng học trực tuyến thế hệ mới 2026
            </div>
          )}

          {/* Slogan & Heading depending on Auth Role */}
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 5vw, 3.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '20px',
              maxWidth: '880px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            {isAuthenticated && user ? (
              user.role === 'instructor' ? (
                'Trung tâm Giảng dạy & Phát triển Khóa học của bạn'
              ) : user.role === 'admin' ? (
                'Trung tâm Quản trị Toàn diện Hệ thống Online Learning'
              ) : (
                'Chào mừng bạn trở lại! Tiếp tục hành trình làm chủ công nghệ'
              )
            ) : (
              'Nâng tầm sự nghiệp công nghệ với các khóa học thực chiến hàng đầu'
            )}
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: '#e0e7ff',
              lineHeight: 1.6,
              maxWidth: '700px',
              margin: '0 auto 36px'
            }}
          >
            {isAuthenticated && user ? (
              user.role === 'instructor' ? (
                'Quản lý danh sách khóa học, bổ sung bài giảng mới và đánh giá các bài nộp của học viên trong hệ thống.'
              ) : user.role === 'admin' ? (
                'Giám sát các chỉ số thống kê, quản lý người dùng, khóa học, bài giảng và giao dịch trong hệ thống.'
              ) : (
                'Tiếp tục hoàn thành các bài học còn dang dở, rèn luyện bài tập thực hành và nhận phản hồi chi tiết từ giảng viên.'
              )
            ) : (
              'Làm chủ Full-Stack Web, Trí tuệ Nhân tạo AI, Lập trình Di động và Điện toán Đám mây từ các chuyên gia hàng đầu. Học mọi lúc, mọi nơi cùng hệ thống bài tập thực hành chất lượng cao.'
            )}
          </p>

          {/* Hero CTAs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap'
            }}
          >
            {isAuthenticated && user ? (
              user.role === 'instructor' ? (
                <>
                  <Link
                    to="/instructor/courses"
                    className="btn btn-primary"
                    style={{
                      padding: '14px 30px',
                      fontSize: '1rem',
                      backgroundColor: '#ffffff',
                      color: '#4338ca',
                      fontWeight: 700,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                    }}
                  >
                    <BookOpen size={20} />
                    Khóa học tôi dạy
                  </Link>
                  <Link
                    to="/instructor/assignments"
                    className="btn"
                    style={{
                      padding: '14px 28px',
                      fontSize: '1rem',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: '#ffffff',
                      fontWeight: 600,
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <ClipboardList size={18} />
                    Giao bài tập & Chấm điểm
                  </Link>
                </>
              ) : user.role === 'admin' ? (
                <>
                  <Link
                    to="/admin/courses"
                    className="btn btn-primary"
                    style={{
                      padding: '14px 30px',
                      fontSize: '1rem',
                      backgroundColor: '#ffffff',
                      color: '#4338ca',
                      fontWeight: 700,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                    }}
                  >
                    <BookOpen size={20} />
                    Quản lý khóa học
                  </Link>
                  <Link
                    to="/admin/users"
                    className="btn"
                    style={{
                      padding: '14px 28px',
                      fontSize: '1rem',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: '#ffffff',
                      fontWeight: 600,
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <Users size={18} />
                    Quản lý người dùng
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/student/courses"
                    className="btn btn-primary"
                    style={{
                      padding: '14px 30px',
                      fontSize: '1rem',
                      backgroundColor: '#ffffff',
                      color: '#4338ca',
                      fontWeight: 700,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                    }}
                  >
                    <BookOpen size={20} />
                    Khóa học của tôi
                  </Link>
                  <Link
                    to="/courses"
                    className="btn"
                    style={{
                      padding: '14px 28px',
                      fontSize: '1rem',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: '#ffffff',
                      fontWeight: 600,
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <BookOpen size={18} />
                    Khám phá thêm khóa học
                  </Link>
                </>
              )
            ) : (
              <>
                <Link
                  to="/courses"
                  className="btn btn-primary"
                  style={{
                    padding: '14px 32px',
                    fontSize: '1rem',
                    backgroundColor: '#ffffff',
                    color: '#4338ca',
                    fontWeight: 700,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                  }}
                >
                  <BookOpen size={20} />
                  Khám phá khóa học ngay
                </Link>

                <Link
                  to="/register"
                  className="btn"
                  style={{
                    padding: '14px 28px',
                    fontSize: '1rem',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    fontWeight: 600,
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  Bắt đầu học miễn phí
                  <ArrowRight size={18} />
                </Link>
              </>
            )}
          </div>

          {/* Metrics summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '24px',
              maxWidth: '800px',
              margin: '50px auto 0',
              paddingTop: '28px',
              borderTop: '1px solid rgba(255,255,255,0.15)'
            }}
          >
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>10+</div>
              <div style={{ fontSize: '0.85rem', color: '#c7d2fe' }}>Khóa học chuyên sâu</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>1,000+</div>
              <div style={{ fontSize: '0.85rem', color: '#c7d2fe' }}>Học viên đang học</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>98%</div>
              <div style={{ fontSize: '0.85rem', color: '#c7d2fe' }}>Đánh giá hài lòng</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>100%</div>
              <div style={{ fontSize: '0.85rem', color: '#c7d2fe' }}>Thực hành thực chiến</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Resume Learning Section (For Any Enrolled User: Student, Instructor, or Admin) */}
      {isAuthenticated && myCourses.length > 0 && (
        <section style={{ backgroundColor: '#ffffff', padding: '48px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                  Tiếp tục học tập của bạn
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>
                  Truy cập nhanh các khóa học đang theo học để duy trì chuỗi tiến độ
                </p>
              </div>
              <Link to="/student/courses" style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Xem tất cả khóa học của tôi <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {myCourses.map((mc) => (
                <div
                  key={mc.course_id}
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {mc.category || 'Khóa học'}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '6px 0 12px', lineHeight: 1.4 }}>
                      {mc.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                      Giảng viên: <strong style={{ color: '#334155' }}>{mc.instructor}</strong>
                    </p>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569', marginBottom: '6px' }}>
                        <span>Tiến độ hoàn thành</span>
                        <strong style={{ color: '#4f46e5' }}>{mc.progress_percentage}%</strong>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${mc.progress_percentage}%`,
                            backgroundColor: mc.progress_percentage === 100 ? '#10b981' : '#4f46e5',
                            borderRadius: '999px',
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                        {mc.completed_lessons} / {mc.total_lessons} bài giảng hoàn tất
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/learn/${mc.course_id}`}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '0.9rem' }}
                  >
                    <PlayCircle size={18} />
                    {mc.progress_percentage === 100 ? 'Xem lại khóa học' : 'Tiếp tục học ngay'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Category Browse Section */}
      <section style={{ padding: '64px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>
            Danh mục chủ đề nổi bật
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
            Lựa chọn chuyên ngành đào tạo phù hợp với mục tiêu phát triển của bạn
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/courses?category=${encodeURIComponent(cat.name)}`}
              style={{
                textDecoration: 'none',
                backgroundColor: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#eef2ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4f46e5',
                  flexShrink: 0
                }}
              >
                <BookOpen size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                  {cat.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                  {cat.description || 'Khám phá các khóa học trong chuyên mục này'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Courses Section */}
      <section style={{ backgroundColor: '#f1f5f9', padding: '72px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>
                Khóa học được đánh giá cao nhất
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
                Được biên soạn và hướng dẫn bởi các chuyên gia công nghệ hàng đầu
              </p>
            </div>
            <Link
              to="/courses"
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              Xem tất cả ({courses.length}+) <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="state-card">
              <div className="spinner"></div>
              <p>Đang tải danh sách khóa học...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="course-card"
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <div style={{ height: '170px', overflow: 'hidden', position: 'relative', backgroundColor: '#e2e8f0' }}>
                    <img
                      src={
                        course.thumbnail ||
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'
                      }
                      alt={course.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      {course.category}
                    </div>
                  </div>

                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700 }}>
                        <Star size={16} fill="#f59e0b" color="#f59e0b" />
                        <span>{course.average_rating ? Number(course.average_rating).toFixed(1) : '5.0'}</span>
                        <span style={{ color: '#94a3b8', fontWeight: 400 }}>({course.reviews_count || 12})</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {course.lessons_count || 0} bài giảng
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: '8px',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {course.title}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: '#64748b',
                        marginBottom: '16px',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {course.description}
                    </p>

                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Giảng viên</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{course.instructor}</span>
                      </div>

                      <div>
                        {Number(course.price) === 0 ? (
                          <span className="price-tag free">Miễn phí</span>
                        ) : (
                          <span className="price-tag">${Number(course.price).toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    <Link
                      to={`/courses/${course.id}`}
                      className="btn btn-secondary"
                      style={{ marginTop: '14px', width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
                    >
                      Xem chi tiết khóa học
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Benefits Section */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 50px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>
            Tại sao nên học tập trên Online Learning Platform?
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '6px' }}>
            Chúng tôi xây dựng môi trường học tập tương tác, thực tế và tập trung tối đa vào hiệu quả đầu ra
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <TrendingUp size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>Giáo trình chuẩn thực tế</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
              Cập nhật liên tục các công nghệ mới nhất trong ngành (React 18, Node.js, AI, DevOps) nhằm đáp ứng trực tiếp nhu cầu tuyển dụng.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Users size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>Giảng viên chuyên môn cao</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
              Đội ngũ tiến sĩ, giáo sư và chuyên gia công nghệ có nhiều năm kinh nghiệm làm việc tại các tập đoàn công nghệ lớn.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Video size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>Bài tập & Chấm điểm tức thì</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
              Nộp bài tập trực tiếp qua link GitHub hoặc mã nguồn, nhận phản hồi và thang điểm 100 chi tiết từ giảng viên phụ trách.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Award size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>Theo dõi tiến độ 100%</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
              Thước đo tỷ lệ phần trăm tiến độ học tập minh bạch cho từng bài học, giúp bạn luôn duy trì động lực học tập mỗi ngày.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Dynamic Call To Action Banner */}
      <section style={{ backgroundColor: '#1e1b4b', color: '#ffffff', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>
            {isAuthenticated && user
              ? `Sẵn sàng phát triển kỹ năng công nghệ hôm nay, ${user.name}?`
              : 'Sẵn sàng nâng cấp kỹ năng nghề nghiệp ngay hôm nay?'}
          </h2>
          <p style={{ color: '#c7d2fe', fontSize: '1rem', lineHeight: 1.6, marginBottom: '32px' }}>
            {isAuthenticated && user
              ? 'Tiếp tục truy cập bàn học cá nhân hoặc khám phá thêm các khóa học công nghệ mới nhất trên hệ thống.'
              : 'Tạo tài khoản học viên miễn phí chỉ trong 1 phút và truy cập ngay kho bài giảng thực tế của Online Learning.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {isAuthenticated && user ? (
              user.role === 'instructor' ? (
                <>
                  <Link
                    to="/instructor/courses"
                    className="btn btn-primary"
                    style={{ padding: '12px 30px', fontSize: '1rem', backgroundColor: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Khóa học tôi dạy
                  </Link>
                  <Link
                    to="/instructor/assignments"
                    className="btn btn-secondary"
                    style={{ padding: '12px 24px', fontSize: '1rem', backgroundColor: '#ffffff', color: '#1e1b4b', textDecoration: 'none' }}
                  >
                    Giao bài tập & Chấm điểm
                  </Link>
                </>
              ) : user.role === 'admin' ? (
                <>
                  <Link
                    to="/admin/courses"
                    className="btn btn-primary"
                    style={{ padding: '12px 30px', fontSize: '1rem', backgroundColor: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Quản lý khóa học
                  </Link>
                  <Link
                    to="/admin/users"
                    className="btn btn-secondary"
                    style={{ padding: '12px 24px', fontSize: '1rem', backgroundColor: '#ffffff', color: '#1e1b4b', textDecoration: 'none' }}
                  >
                    Quản lý người dùng
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/student/courses"
                    className="btn btn-primary"
                    style={{ padding: '12px 30px', fontSize: '1rem', backgroundColor: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Khóa học của tôi
                  </Link>
                  <Link
                    to="/courses"
                    className="btn btn-secondary"
                    style={{ padding: '12px 24px', fontSize: '1rem', backgroundColor: '#ffffff', color: '#1e1b4b', textDecoration: 'none' }}
                  >
                    Khám phá khóa học
                  </Link>
                </>
              )
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  style={{ padding: '12px 30px', fontSize: '1rem', backgroundColor: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}
                >
                  Đăng ký tài khoản miễn phí
                </Link>
                <Link
                  to="/courses"
                  className="btn btn-secondary"
                  style={{ padding: '12px 24px', fontSize: '1rem', backgroundColor: '#ffffff', color: '#1e1b4b', textDecoration: 'none' }}
                >
                  Khám phá danh mục
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
