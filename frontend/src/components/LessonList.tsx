import React, { useState } from 'react';
import { Lesson } from '../types/lesson';
import { Edit2, Trash2, Search, FileText, AlertCircle, RefreshCw, BookOpen } from 'lucide-react';

interface LessonListProps {
  lessons: Lesson[];
  onEdit: (lesson: Lesson) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const LessonList: React.FC<LessonListProps> = ({
  lessons,
  onEdit,
  onDelete,
  isLoading,
  error,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredLessons = lessons.filter((lesson) => {
    const term = searchTerm.toLowerCase();
    return (
      lesson.title.toLowerCase().includes(term) ||
      (lesson.course_title && lesson.course_title.toLowerCase().includes(term)) ||
      (lesson.content && lesson.content.toLowerCase().includes(term))
    );
  });

  const handleDeleteConfirm = (id: number, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài học "${title}" không?`)) {
      setDeletingId(id);
      onDelete(id);
    }
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
        <p>Đang tải danh sách bài học...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-card state-error">
        <AlertCircle size={40} />
        <h3>Lỗi tải bài học</h3>
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={onRefresh}>
          <RefreshCw size={16} /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="entity-list-container">
      <div className="list-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bài học theo tiêu đề, tên khóa học, nội dung..."
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
          Tổng số: <strong>{filteredLessons.length}</strong> bài học
        </div>
      </div>

      {filteredLessons.length === 0 ? (
        <div className="state-card state-empty">
          <FileText size={48} />
          <h3>Không tìm thấy bài học</h3>
          <p>
            {searchTerm
              ? `Không tìm thấy bài học phù hợp với từ khóa "${searchTerm}".`
              : 'Danh sách bài học hiện tại đang trống. Nhấn "Thêm bài học" để bắt đầu.'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="courses-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Thứ tự</th>
                <th>Bài học</th>
                <th>Khóa học</th>
                <th>Ngày tạo</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((lesson) => (
                <tr key={lesson.id}>
                  <td className="td-id">#{lesson.id}</td>
                  <td>
                    <span className="order-badge">Bài {lesson.lesson_order}</span>
                  </td>
                  <td className="td-details">
                    <div className="course-title">{lesson.title}</div>
                    <div className="course-desc" title={lesson.content}>
                      {lesson.content && lesson.content.length > 80
                        ? `${lesson.content.substring(0, 80)}...`
                        : lesson.content || 'Chưa có nội dung'}
                    </div>
                  </td>
                  <td>
                    <div className="course-name-tag">
                      <BookOpen size={14} />
                      <span>{lesson.course_title || `Khóa học #${lesson.course_id}`}</span>
                    </div>
                  </td>
                  <td className="date-text">{formatDate(lesson.created_at)}</td>
                  <td className="td-actions text-right">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit(lesson)}
                      title="Chỉnh sửa bài học"
                    >
                      <Edit2 size={16} />
                      <span>Sửa</span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteConfirm(lesson.id, lesson.title)}
                      disabled={deletingId === lesson.id}
                      title="Xóa bài học"
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
