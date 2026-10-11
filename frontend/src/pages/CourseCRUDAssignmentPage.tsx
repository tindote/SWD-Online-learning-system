import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  BookOpen,
  ArrowUpDown,
  Tag,
  Sparkles,
  SlidersHorizontal,
  GraduationCap,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { Course, CourseFormData } from '../types/course';
import { Category } from '../types/category';
import { courseApi } from '../services/courseApi';
import { categoryApi } from '../services/categoryApi';
import { useAuth } from '../context/AuthContext';

import {
  IndividualCourseHeader,
  IndividualCourseTable,
  IndividualCourseCard,
  IndividualCourseFormModal,
  IndividualCourseDetailModal,
  IndividualCourseDeleteModal
} from '../components/individual-course-crud';

const ITEMS_PER_PAGE = 10;

export const CourseCRUDAssignmentPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const role = user?.role || 'guest';
  const isAdmin = role === 'admin';
  const isInstructor = role === 'instructor';

  // Data state
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [onlyMyCourses, setOnlyMyCourses] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating' | 'title'>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [detailCourseId, setDetailCourseId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Fetch courses from API
  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Pass allStatus: true if user is admin or instructor filtering own courses
      const params: any = {
        allStatus: isAdmin || isInstructor,
        sortBy: 'newest'
      };

      const data = await courseApi.getCourses(params);
      setCourses(data);
    } catch (err: any) {
      console.error('Failed to load courses:', err);
      setError(err.response?.data?.message || err.message || 'Không thể kết nối đến máy chủ API');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, isInstructor]);

  // Fetch categories for filtering
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catList = await categoryApi.getCategories();
        setCategories(catList);
      } catch (err) {
        console.warn('Could not fetch categories list:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Filtered courses calculation
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = course.title?.toLowerCase().includes(term);
        const matchesDesc = course.description?.toLowerCase().includes(term);
        const matchesInst = (course.instructor_name || course.instructor || '').toLowerCase().includes(term);
        const matchesCat = course.category?.toLowerCase().includes(term);
        if (!matchesTitle && !matchesDesc && !matchesInst && !matchesCat) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && course.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        const courseStatus = course.status || 'published';
        if (courseStatus !== selectedStatus) {
          return false;
        }
      }

      // Price filter
      const numPrice = Number(course.price || 0);
      if (priceFilter === 'free' && numPrice > 0) return false;
      if (priceFilter === 'paid' && numPrice === 0) return false;

      // Only my courses filter (for logged in instructors)
      if (onlyMyCourses && isInstructor && user) {
        const isOwner = (course.instructor_id != null && Number(course.instructor_id) === Number(user.id)) ||
          (course.instructor && user.name && course.instructor.trim().toLowerCase() === user.name.trim().toLowerCase());
        if (!isOwner) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === 'price_desc') return Number(b.price || 0) - Number(a.price || 0);
      if (sortBy === 'rating') return Number(b.average_rating || 0) - Number(a.average_rating || 0);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      // newest default
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [courses, searchTerm, selectedCategory, selectedStatus, priceFilter, onlyMyCourses, sortBy, isInstructor, user]);

  // Pagination calculation
  const totalCourses = filteredCourses.length;
  const totalPages = Math.ceil(totalCourses / ITEMS_PER_PAGE) || 1;
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCourses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCourses, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setPriceFilter('all');
    setOnlyMyCourses(false);
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Create & Edit Handlers
  const handleOpenCreateModal = () => {
    setCourseToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setCourseToEdit(course);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCourseToEdit(null);
  };

  const handleFormSubmit = async (formData: CourseFormData) => {
    setIsSubmitting(true);
    try {
      if (courseToEdit) {
        await courseApi.updateCourse(courseToEdit.id, formData);
        showToast(`Cập nhật khóa học "${formData.title}" thành công!`, 'success');
      } else {
        await courseApi.createCourse(formData);
        showToast(`Tạo khóa học "${formData.title}" thành công!`, 'success');
      }
      handleCloseForm();
      await fetchCourses();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Thao tác không thành công';
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Details Modal Handlers
  const handleViewDetails = (course: Course) => {
    setDetailCourseId(course.id);
    setIsDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailOpen(false);
    setDetailCourseId(null);
  };

  // Delete Modal Handlers
  const handleOpenDeleteModal = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setCourseToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      await courseApi.deleteCourse(courseToDelete.id);
      showToast(`Đã xóa vĩnh viễn khóa học "${courseToDelete.title}" thành công!`, 'success');
      handleCloseDelete();
      await fetchCourses();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa khóa học';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.25rem 4rem 1.25rem' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '5rem',
            right: '1.5rem',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.85rem 1.25rem',
            borderRadius: '0.5rem',
            backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
            color: '#ffffff',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            fontWeight: 600,
            fontSize: '0.875rem',
            animation: 'slideInRight 0.25s ease-out'
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              marginLeft: '0.5rem',
              padding: 0
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#64748b', marginBottom: '1rem' }}>
        <a href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Trang chủ</a>
        <span>/</span>
        <span style={{ color: '#64748b' }}>Bài tập cá nhân</span>
        <span>/</span>
        <span style={{ color: '#2563eb', fontWeight: 700 }}>Course Management CRUD (Member 3)</span>
      </div>

      {/* Header with Title and Overall Stats */}
      <IndividualCourseHeader
        courses={courses}
        isLoading={isLoading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={fetchCourses}
        onOpenCreateModal={handleOpenCreateModal}
      />

      {/* Filter and Search Controls Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          border: '1px solid #e2e8f0',
          padding: '1.15rem 1.25rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tiêu đề, giảng viên, mô tả..."
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem 0.55rem 2.4rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '0.65rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div style={{ minWidth: '160px' }}>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
              <option value="archived">Lưu trữ</option>
            </select>
          </div>

          {/* Price Filter */}
          <div style={{ minWidth: '140px' }}>
            <select
              value={priceFilter}
              onChange={(e) => {
                setPriceFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">Mọi mức học phí</option>
              <option value="free">Chỉ Miễn phí ($0)</option>
              <option value="paid">Khóa có phí (&gt; $0)</option>
            </select>
          </div>

          {/* Sorting Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="newest">Mới nhất trước</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="title">Tên khóa học A-Z</option>
            </select>
          </div>

          {/* My Courses Only toggle (Instructor specific) */}
          {isInstructor && (
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <input
                type="checkbox"
                checked={onlyMyCourses}
                onChange={(e) => {
                  setOnlyMyCourses(e.target.checked);
                  setCurrentPage(1);
                }}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>Chỉ khóa của tôi</span>
            </label>
          )}

          {/* Reset Filters button */}
          {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || priceFilter !== 'all' || onlyMyCourses || sortBy !== 'newest') && (
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.55rem 0.85rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} /> Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Main View Component (Table or Grid) */}
      {viewMode === 'table' ? (
        <IndividualCourseTable
          courses={paginatedCourses}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCourses={totalCourses}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
          onViewDetails={handleViewDetails}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
        />
      ) : (
        <div>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <div className="spin-anim" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⌛</div>
              <div>Đang tải danh sách khóa học...</div>
            </div>
          ) : paginatedCourses.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                padding: '3rem 2rem',
                textAlign: 'center'
              }}
            >
              <AlertCircle size={36} style={{ color: '#94a3b8', margin: '0 auto 0.5rem auto' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                Không tìm thấy khóa học nào
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Thử thay đổi các bộ lọc hoặc từ khóa tìm kiếm phía trên.
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '1.5rem'
                }}
              >
                {paginatedCourses.map((c) => (
                  <IndividualCourseCard
                    key={c.id}
                    course={c}
                    onViewDetails={handleViewDetails}
                    onEdit={handleOpenEditModal}
                    onDelete={handleOpenDeleteModal}
                  />
                ))}
              </div>

              {/* Grid Pagination */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '1rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0'
                }}
              >
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                    color: currentPage <= 1 ? '#94a3b8' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.825rem'
                  }}
                >
                  Trang trước
                </button>
                <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, margin: '0 0.5rem' }}>
                  Trang {currentPage} / {totalPages} (Tổng {totalCourses} khóa học)
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                    color: currentPage >= totalPages ? '#94a3b8' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.825rem'
                  }}
                >
                  Trang sau
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Create / Edit Form Modal */}
      <IndividualCourseFormModal
        isOpen={isFormOpen}
        courseToEdit={courseToEdit}
        isSubmitting={isSubmitting}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      {/* Course Detail Modal */}
      <IndividualCourseDetailModal
        courseId={detailCourseId}
        isOpen={isDetailOpen}
        onClose={handleCloseDetails}
        onEdit={(course) => {
          handleCloseDetails();
          handleOpenEditModal(course);
        }}
      />

      {/* Delete Confirmation Modal */}
      <IndividualCourseDeleteModal
        isOpen={isDeleteOpen}
        course={courseToDelete}
        isDeleting={isDeleting}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
