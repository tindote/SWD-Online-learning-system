import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';

interface IndividualCategoryHeaderProps {
  totalCount: number;
  onRefresh: () => void;
  onOpenCreate: () => void;
  isRefreshing: boolean;
}

export const IndividualCategoryHeader: React.FC<IndividualCategoryHeaderProps> = ({
  onRefresh,
  onOpenCreate,
  isRefreshing
}) => {
  return (
    <div className="page-header" style={{ marginBottom: '20px' }}>
      <div>
        <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
          Category Management
        </h1>
        <p className="page-subtitle" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
          Quản lý và phân loại các ngành học, lĩnh vực đào tạo trong hệ thống
        </p>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Làm mới danh sách"
        >
          <RefreshCw size={16} className={isRefreshing ? 'spinner' : ''} />
          <span>Làm mới</span>
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenCreate}
          title="Thêm mới danh mục"
        >
          <Plus size={18} />
          <span>Thêm danh mục</span>
        </button>
      </div>
    </div>
  );
};
