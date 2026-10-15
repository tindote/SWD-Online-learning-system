import React from 'react';
import { Category } from '../../types/category';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface IndividualCategoryDeleteModalProps {
  category: Category | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const IndividualCategoryDeleteModal: React.FC<IndividualCategoryDeleteModalProps> = ({
  category,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !category) return null;

  return (
    <div className="modal-overlay" onClick={isDeleting ? undefined : onCancel}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', width: '90%' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: '#991b1b' }}>
                Xác nhận xóa danh mục
              </h2>
            </div>
          </div>
          <button
            className="icon-btn"
            onClick={onCancel}
            disabled={isDeleting}
            title="Hủy thao tác"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '16px 0 24px 0' }}>
          <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px' }}>
            Bạn có chắc chắn muốn xóa danh mục sau khỏi hệ thống không? Hành động này không thể hoàn tác.
          </p>

          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '14px 16px'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
              Danh mục được chọn (ID #{category.id})
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#7f1d1d' }}>
              {category.name}
            </div>
            {category.description && (
              <div style={{ fontSize: '0.85rem', color: '#b91c1c', marginTop: '6px', lineHeight: 1.4 }}>
                {category.description}
              </div>
            )}
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '14px', marginBottom: 0 }}>
            * Lưu ý: Thao tác sẽ thất bại nếu danh mục này đang liên kết với các khóa học đã tồn tại.
          </p>
        </div>

        <div className="modal-actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className="btn"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontWeight: 600
            }}
          >
            <Trash2 size={16} />
            {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};
