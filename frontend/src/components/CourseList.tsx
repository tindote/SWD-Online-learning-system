import React, { useState } from 'react';
import { Course } from '../types/course';
import { Edit2, Trash2, Search, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

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

  const filteredCourses = courses.filter((course) => {
    const term = searchTerm.toLowerCase();
    return (
      course.title.toLowerCase().includes(term) ||
      course.instructor.toLowerCase().includes(term) ||
      course.category.toLowerCase().includes(term) ||
      course.description.toLowerCase().includes(term)
    );
  });

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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
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
              {filteredCourses.map((course) => (
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
      )}
    </div>
  );
};
