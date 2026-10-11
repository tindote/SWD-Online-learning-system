import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';

interface IndividualAssignmentHeaderProps {
  totalCount: number;
  onRefresh: () => void;
  onOpenCreate: () => void;
  isRefreshing: boolean;
  canManage: boolean;
}

export const IndividualAssignmentHeader: React.FC<IndividualAssignmentHeaderProps> = ({
  onRefresh,
  onOpenCreate,
  isRefreshing,
  canManage
}) => {
  return (
    <div className="page-header" style={{ marginBottom: '20px' }}>
      <div>
        <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
          Assignment Management
        </h1>
        <p className="page-subtitle" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
          Quản lý và giao bài tập thực hành cho các khóa học trong hệ thống
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

        {canManage && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenCreate}
            title="Thêm mới bài tập"
          >
            <Plus size={18} />
            <span>Thêm bài tập</span>
          </button>
        )}
      </div>
    </div>
  );
};
