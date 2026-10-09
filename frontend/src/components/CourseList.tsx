import React, { useState } from 'react';
import { Course } from '../types/course';
import { Edit2, Trash2, Search, BookOpen, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 15;

interface CourseListProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const CourseList: React.FC<CourseListProps> = ({
  courses,
  onEdit,
  onDelete,
  isLoading,
  error,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const filteredCourses = courses.filter((course) => {
    const term = searchTerm.toLowerCase();
    return (
      course.title.toLowerCase().includes(term) ||
      course.instructor.toLowerCase().includes(term) ||
      course.category.toLowerCase().includes(term) ||
      course.description.toLowerCase().includes(term)
    );
  });

  // Pagination calculation
  const totalCourses = filteredCourses.length;
  const totalPages = Math.ceil(totalCourses / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCourses);
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages.map((page, idx) => {
      if (page === '...') {
        return (
          <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
            ...
          </span>
        );
      }
      const pageNum = page as number;
      return (
        <button
          key={pageNum}
          type="button"
          className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
          onClick={() => handlePageChange(pageNum)}
          aria-label={`Trang ${pageNum}`}
        >
          {pageNum}
        </button>
      );
    });
  };

  const handleDeleteConfirm = (id: number, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${title}" không?`)) {
      setDeletingId(id);
      onDelete(id);
    }
  };

  const formatPrice = (price: number | string) => {
    const numeric = Number(price);
    if (isNaN(numeric) || numeric === 0) return 'Miễn phí';
    return `$${numeric.toFixed(2)}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="state-card">
        <div className="spinner"></div>
        <p>Đang tải danh sách khóa học...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-card state-error">
        <AlertCircle size={40} />
        <h3>Lỗi tải khóa học</h3>
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={onRefresh}>
          <RefreshCw size={16} /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="course-list-container">
      <div className="list-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm khóa học theo tên, giảng viên, danh mục..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => handleSearchChange('')}>
              ×
            </button>
          )}
        </div>
        <div className="catalog-counter">
          Tổng số: <strong>{filteredCourses.length}</strong> khóa học
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="state-card state-empty">
          <BookOpen size={48} />
          <h3>Không tìm thấy khóa học</h3>
          <p>
            {searchTerm
              ? `Không tìm thấy khóa học nào phù hợp với từ khóa "${searchTerm}".`
              : 'Danh sách khóa học hiện tại đang trống. Nhấn "Thêm khóa học" để bắt đầu.'}
          </p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Thông tin khóa học</th>
                  <th>Danh mục</th>
                  <th>Giảng viên</th>
                  <th>Giá học phí</th>
                  <th>Ngày tạo</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCourses.map((course) => (
                  <tr key={course.id}>
                    <td className="td-id">#{course.id}</td>
                    <td className="td-details">
                      <div className="course-title">{course.title}</div>
                      <div className="course-desc" title={course.description}>
                        {course.description.length > 80
                          ? `${course.description.substring(0, 80)}...`
                          : course.description}
                      </div>
                    </td>
                    <td>
                      <span className="badge category-badge">{course.category}</span>
                    </td>
                    <td className="instructor-name">{course.instructor}</td>
                    <td>
                      <span className={`price-tag ${Number(course.price) === 0 ? 'free' : ''}`}>
                        {formatPrice(course.price)}
                      </span>
                    </td>
                    <td className="date-text">{formatDate(course.created_at)}</td>
                    <td className="td-actions text-right">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => onEdit(course)}
                        title="Chỉnh sửa khóa học"
                      >
                        <Edit2 size={16} />
                        <span>Sửa</span>
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteConfirm(course.id, course.title)}
                        disabled={deletingId === course.id}
                        title="Xóa khóa học"
                      >
                        <Trash2 size={16} />
                        <span>Xóa</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-container" style={{ marginTop: '20px' }}>
              <div className="pagination-info">
                Hiển thị <strong>{startIndex + 1} - {endIndex}</strong> trên tổng số <strong>{totalCourses}</strong> khóa học (Trang {currentPage} / {totalPages})
              </div>
              <div className="pagination-controls">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  title="Trang trước"
                >
                  <ChevronLeft size={16} /> Trước
                </button>

                {renderPaginationButtons()}

                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  title="Trang sau"
                >
                  Sau <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
