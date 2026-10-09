import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { courseApi } from '../services/courseApi';
import { categoryApi } from '../services/categoryApi';
import { useAuth } from '../context/AuthContext';
import { Course } from '../types/course';
import { Category } from '../types/category';
import {
  Search,
  BookOpen,
  Star,
  Users,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  PlayCircle
} from 'lucide-react';

export const CourseCatalogPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating' | 'title'>('newest');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catList = await categoryApi.getCategories();
        setCategories(catList);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch courses whenever filters change
  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await courseApi.getCourses({
        search: searchTerm || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        isFree: priceFilter === 'free' ? true : priceFilter === 'paid' ? false : undefined,
        sortBy
      });
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, priceFilter, sortBy]);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
    setPriceFilter('all');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Title & Introduction */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Khám phá các khóa học công nghệ
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>
          Hơn {courses.length} khóa học chất lượng cao từ các chuyên gia hàng đầu trong ngành công nghệ thông tin
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '36px'
        }}
      >
        {/* Search Row */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học theo tiêu đề, giảng viên, từ khóa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem'
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>
            Tìm kiếm
          </button>
          {(searchTerm || selectedCategory !== 'All' || priceFilter !== 'all') && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetFilters}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw size={16} /> Đặt lại
            </button>
          )}
        </form>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
          <button
            onClick={() => setSelectedCategory('All')}
            className="btn"
            style={{
              padding: '6px 16px',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: selectedCategory === 'All' ? '#4f46e5' : '#f1f5f9',
              color: selectedCategory === 'All' ? '#ffffff' : '#475569',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Tất cả danh mục
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className="btn"
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: selectedCategory === cat.name ? '#4f46e5' : '#f1f5f9',
                color: selectedCategory === cat.name ? '#ffffff' : '#475569',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Bottom Filter Controls: Price & Sort */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Học phí:</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setPriceFilter('all')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  border: '1px solid #cbd5e1',
                  backgroundColor: priceFilter === 'all' ? '#eef2ff' : '#ffffff',
                  color: priceFilter === 'all' ? '#4f46e5' : '#475569',
                  cursor: 'pointer'
                }}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setPriceFilter('free')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  border: '1px solid #cbd5e1',
                  backgroundColor: priceFilter === 'free' ? '#eef2ff' : '#ffffff',
                  color: priceFilter === 'free' ? '#4f46e5' : '#475569',
                  cursor: 'pointer'
                }}
              >
                Miễn phí
              </button>
              <button
                type="button"
                onClick={() => setPriceFilter('paid')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  border: '1px solid #cbd5e1',
                  backgroundColor: priceFilter === 'paid' ? '#eef2ff' : '#ffffff',
                  color: priceFilter === 'paid' ? '#4f46e5' : '#475569',
                  cursor: 'pointer'
                }}
              >
                Có phí
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="newest">Mới nhất</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="title">Tên A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid Results */}
      {loading ? (
        <div className="state-card" style={{ minHeight: '300px' }}>
          <div className="spinner" />
          <p>Đang tìm kiếm khóa học...</p>
        </div>
      ) : error ? (
        <div className="state-card state-error">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchCourses}>Thử lại</button>
        </div>
      ) : courses.length === 0 ? (
        <div className="state-card state-empty">
          <BookOpen size={48} color="#94a3b8" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Không tìm thấy khóa học phù hợp</h3>
          <p>Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để hiển thị toàn bộ danh sách.</p>
          <button className="btn btn-secondary" onClick={handleResetFilters}>
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
          {courses.map((course) => (
            <div
              key={course.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              {/* Thumbnail */}
              <div style={{ height: '180px', width: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                  alt={course.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                  <span className="badge category-badge" style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: '#4338ca', fontWeight: 700 }}>
                    {course.category}
                  </span>
                </div>
              </div>

              {/* Content Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                    <Star size={16} color="#f59e0b" fill="#f59e0b" />
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      {course.average_rating ? Number(course.average_rating).toFixed(1) : '5.0'}
                    </span>
                    <span style={{ color: '#94a3b8' }}>({course.reviews_count || 1})</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BookOpen size={14} />
                    <span>{course.lessons_count || 4} bài học</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4, marginBottom: '8px' }}>
                  {course.title}
                </h3>

                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {course.description}
                </p>

                <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                      {course.instructor.charAt(0)}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
                      {course.instructor}
                    </span>
                  </div>

                  <div>
                    {course.price === 0 ? (
                      <span className="price-tag free">Miễn phí</span>
                    ) : (
                      <span className="price-tag">${Number(course.price).toFixed(2)}</span>
                    )}
                  </div>
                </div>

                {(() => {
                  const isOwner = Boolean(
                    user && (
                      course.isInstructorOwner ||
                      (course.instructor_id != null && Number(course.instructor_id) === Number(user.id)) ||
                      (user.name && (
                        (course.instructor && course.instructor.trim().toLowerCase() === user.name.trim().toLowerCase()) ||
                        (course.instructor_name && course.instructor_name.trim().toLowerCase() === user.name.trim().toLowerCase())
                      ))
                    )
                  );

                  if (isOwner) {
                    return (
                      <Link
                        to={`/learn/${course.id}`}
                        className="btn btn-primary"
                        style={{
                          marginTop: '14px',
                          width: '100%',
                          justifyContent: 'center',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <PlayCircle size={16} /> Vào xem bài giảng
                      </Link>
                    );
                  }

                  return (
                    <Link
                      to={`/courses/${course.id}`}
                      className="btn btn-primary"
                      style={{ marginTop: '14px', width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                    >
                      Xem chi tiết & Đăng ký
                    </Link>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
