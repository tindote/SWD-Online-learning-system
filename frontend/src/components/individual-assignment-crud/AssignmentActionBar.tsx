import React from 'react';
import { Plus, RotateCw, Filter, Sparkles, CalendarDays } from 'lucide-react';

interface AssignmentActionBarProps {
  totalCount: number;
  filteredCount?: number;
  onRefresh: () => void;
  onOpenCreate: () => void;
  isRefreshing: boolean;
  canManage: boolean;
}

export const AssignmentActionBar: React.FC<AssignmentActionBarProps> = ({
  totalCount,
  filteredCount,
  onRefresh,
  onOpenCreate,
  isRefreshing,
  canManage
}) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #ccfbf1',
      borderLeft: '5px solid #0d9488',
      borderRadius: '12px',
      padding: '20px 24px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(13, 148, 136, 0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#ccfbf1',
            color: '#0f766e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CalendarDays size={18} />
          </div>
          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#134e4a',
            margin: 0,
            letterSpacing: '-0.01em'
          }}>
            Assignment Management
          </h1>
        </div>

        <p style={{
          fontSize: '0.88rem',
          color: '#115e59',
          margin: '6px 0 0 40px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>Theo dõi tiến độ, thiết lập hạn nộp và chấm bài tập học viên</span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{
            backgroundColor: '#f0fdfa',
            color: '#0f766e',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.78rem',
            fontWeight: 600,
            border: '1px solid #99f6e4'
          }}>
            Tổng: {totalCount} bài tập
          </span>
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            color: '#334155',
            padding: '9px 16px',
            borderRadius: '8px',
            fontSize: '0.86rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
          title="Tải lại danh sách"
        >
          <RotateCw size={15} className={isRefreshing ? 'spinner' : ''} />
          <span>Làm mới</span>
        </button>

        {canManage && (
          <button
            type="button"
            onClick={onOpenCreate}
            style={{
              backgroundColor: '#0d9488',
              color: '#ffffff',
              border: '1px solid #0f766e',
              padding: '9px 18px',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)',
              transition: 'all 0.15s ease'
            }}
            title="Thêm bài tập mới"
          >
            <Plus size={17} strokeWidth={2.5} />
            <span>Thêm bài tập mới</span>
          </button>
        )}
      </div>
    </div>
  );
};
