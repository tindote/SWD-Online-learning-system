import React from 'react';
import { Category } from '../../types/category';
import { X, Calendar, Hash, FileText, Tag, Clock } from 'lucide-react';

interface IndividualCategoryDetailModalProps {
  category: Category | null;
  onClose: () => void;
}

export const IndividualCategoryDetailModal: React.FC<IndividualCategoryDetailModalProps> = ({
  category,
  onClose
}) => {
  if (!category) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Chưa cập nhật';
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', width: '90%' }}
      >
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Tag size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Chi tiết danh mục</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mã định danh ID #{category.id}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} title="Đóng" type="button">
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 600 }}>
              <Tag size={15} />
              <span>Tên danh mục</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {category.name}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 600 }}>
              <FileText size={15} />
              <span>Mô tả</span>
            </div>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              color: category.description ? 'var(--text-main)' : 'var(--text-light)',
              fontStyle: category.description ? 'normal' : 'italic',
              lineHeight: 1.6,
              minHeight: '80px',
              whiteSpace: 'pre-wrap'
            }}>
              {category.description || 'Chưa có thông tin mô tả chi tiết cho danh mục này.'}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px'
          }}>
            <div style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                <Calendar size={14} />
                <span>Ngày tạo</span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {formatDate(category.created_at)}
              </div>
            </div>

            <div style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                <Clock size={14} />
                <span>Cập nhật gần nhất</span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {formatDate(category.updated_at || category.created_at)}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
