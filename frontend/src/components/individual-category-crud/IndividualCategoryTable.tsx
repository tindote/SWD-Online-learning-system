import React, { useState } from 'react';
import { Category } from '../../types/category';
import { Edit2, Trash2, Search, Eye, FolderTree, ArrowUpDown, Calendar, RefreshCw } from 'lucide-react';

interface IndividualCategoryTableProps {
  categories: Category[];
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  isAdmin: boolean;
}

export const IndividualCategoryTable: React.FC<IndividualCategoryTableProps> = ({
  categories,
  onView,
  onEdit,
  onDelete,
  isAdmin
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'created_at'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredCategories = categories.filter((cat) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      cat.name.toLowerCase().includes(term) ||
      (cat.description && cat.description.toLowerCase().includes(term)) ||
      String(cat.id).includes(term)
    );
  });

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'id') {
      comparison = a.id - b.id;
    } else if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'created_at') {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      comparison = dateA - dateB;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: 'id' | 'name' | 'created_at') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
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

  return (
    <div className="entity-list-container">
      {/* Search & Tool bar */}
      <div className="list-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo ID, tên danh mục, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm('')}
              title="Xóa tìm kiếm"
              type="button"
            >
              ×
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.88rem' }}>
          <div className="catalog-counter">
            Hiển thị: <strong>{sortedCategories.length}</strong> / <strong>{categories.length}</strong> danh mục
          </div>
        </div>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="state-card state-empty" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <FolderTree size={48} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-main)' }}>
            {searchTerm ? 'Không tìm thấy danh mục phù hợp' : 'Danh sách danh mục trống'}
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 16px' }}>
            {searchTerm
              ? `Không có kết quả nào khớp với cụm từ "${searchTerm}". Vui lòng thử lại với từ khóa khác.`
              : 'Hiện chưa có danh mục nào trong cơ sở dữ liệu. Nhấn "Thêm danh mục" phía trên để tạo mới.'}
          </p>
          {searchTerm && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSearchTerm('')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} /> Xóa bộ lọc tìm kiếm
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="courses-table">
            <thead>
              <tr>
                <th
                  onClick={() => toggleSort('id')}
                  style={{ cursor: 'pointer', userSelect: 'none', width: '80px' }}
                  title="Nhấn để sắp xếp theo ID"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>ID</span>
                    <ArrowUpDown size={14} color={sortBy === 'id' ? 'var(--primary-color)' : '#94a3b8'} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('name')}
                  style={{ cursor: 'pointer', userSelect: 'none', width: '220px' }}
                  title="Nhấn để sắp xếp theo Tên"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Tên danh mục</span>
                    <ArrowUpDown size={14} color={sortBy === 'name' ? 'var(--primary-color)' : '#94a3b8'} />
                  </div>
                </th>
                <th>Mô tả chi tiết</th>
                <th
                  onClick={() => toggleSort('created_at')}
                  style={{ cursor: 'pointer', userSelect: 'none', width: '130px' }}
                  title="Nhấn để sắp xếp theo Ngày tạo"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Ngày tạo</span>
                    <ArrowUpDown size={14} color={sortBy === 'created_at' ? 'var(--primary-color)' : '#94a3b8'} />
                  </div>
                </th>
                <th className="text-right" style={{ width: '220px', textAlign: 'right' }}>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map((cat) => (
                <tr key={cat.id}>
                  <td className="td-id">
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--bg-subtle)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)'
                    }}>
                      #{cat.id}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge category-badge" style={{
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        padding: '5px 12px',
                        borderRadius: '6px'
                      }}>
                        {cat.name}
                      </span>
                    </div>
                  </td>

                  <td className="td-details">
                    <div
                      className="course-desc"
                      title={cat.description || 'Chưa có mô tả'}
                      style={{
                        color: cat.description ? 'var(--text-main)' : 'var(--text-light)',
                        fontStyle: cat.description ? 'normal' : 'italic',
                        maxWidth: '380px'
                      }}
                    >
                      {cat.description || 'Chưa có mô tả'}
                    </div>
                  </td>

                  <td className="date-text">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}>
                      <Calendar size={13} color="var(--text-light)" />
                      <span>{formatDate(cat.created_at)}</span>
                    </div>
                  </td>

                  <td className="td-actions text-right" style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      {/* View Details Action */}
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => onView(cat)}
                        title="Xem chi tiết danh mục"
                        style={{
                          backgroundColor: 'var(--bg-subtle)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--secondary-color)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={15} />
                        <span>Xem</span>
                      </button>

                      {/* Edit Action */}
                      <button
                        type="button"
                        className="action-btn edit-btn"
                        onClick={() => onEdit(cat)}
                        title={isAdmin ? 'Chỉnh sửa danh mục' : 'Cần quyền Admin để sửa'}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit2 size={15} />
                        <span>Sửa</span>
                      </button>

                      {/* Delete Action */}
                      <button
                        type="button"
                        className="action-btn delete-btn"
                        onClick={() => onDelete(cat)}
                        title={isAdmin ? 'Xóa danh mục' : 'Cần quyền Admin để xóa'}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={15} />
                        <span>Xóa</span>
                      </button>
                    </div>
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
