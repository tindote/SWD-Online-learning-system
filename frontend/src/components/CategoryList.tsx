import React, { useState } from 'react';
import { Category } from '../types/category';
import { Edit2, Trash2, Search, FolderTree, AlertCircle, RefreshCw } from 'lucide-react';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onEdit,
  onDelete,
  isLoading,
  error,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredCategories = categories.filter((cat) => {
    const term = searchTerm.toLowerCase();
    return (
      cat.name.toLowerCase().includes(term) ||
      (cat.description && cat.description.toLowerCase().includes(term))
    );
  });

  const handleDeleteConfirm = (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}" không?`)) {
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
        <p>Đang tải danh sách danh mục...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-card state-error">
        <AlertCircle size={40} />
        <h3>Lỗi tải danh mục</h3>
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
            placeholder="Tìm kiếm danh mục theo tên, mô tả..."
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
          Tổng số: <strong>{filteredCategories.length}</strong> danh mục
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="state-card state-empty">
          <FolderTree size={48} />
          <h3>Không tìm thấy danh mục</h3>
          <p>
            {searchTerm
              ? `Không tìm thấy danh mục phù hợp với từ khóa "${searchTerm}".`
              : 'Danh sách danh mục hiện tại đang trống. Nhấn "Thêm danh mục" để bắt đầu.'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="courses-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Ngày tạo</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => (
                <tr key={cat.id}>
                  <td className="td-id">#{cat.id}</td>
                  <td>
                    <span className="badge category-badge">{cat.name}</span>
                  </td>
                  <td className="td-details">
                    <div className="course-desc">
                      {cat.description || 'Chưa có mô tả'}
                    </div>
                  </td>
                  <td className="date-text">{formatDate(cat.created_at)}</td>
                  <td className="td-actions text-right">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit(cat)}
                      title="Chỉnh sửa danh mục"
                    >
                      <Edit2 size={16} />
                      <span>Sửa</span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteConfirm(cat.id, cat.name)}
                      disabled={deletingId === cat.id}
                      title="Xóa danh mục"
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
