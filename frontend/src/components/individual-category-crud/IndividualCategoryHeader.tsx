import React from 'react';
import { Plus, RefreshCw, Layers, ShieldCheck, ShieldAlert, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface IndividualCategoryHeaderProps {
  totalCount: number;
  onRefresh: () => void;
  onOpenCreate: () => void;
  isRefreshing: boolean;
}

export const IndividualCategoryHeader: React.FC<IndividualCategoryHeaderProps> = ({
  totalCount,
  onRefresh,
  onOpenCreate,
  isRefreshing
}) => {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <div className="individual-crud-header" style={{
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
      color: '#ffffff',
      padding: '28px 32px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.3)',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              backdropFilter: 'blur(8px)'
            }}>
              <Award size={14} color="#a5b4fc" />
              Task 1 — Individual Assignment
            </span>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isAdmin ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: isAdmin ? '#86efac' : '#fde68a',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: `1px solid ${isAdmin ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
            }}>
              {isAdmin ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
              {isAdmin ? 'Admin Authorized' : isAuthenticated ? `Role: ${user?.role} (Read-only)` : 'Guest (Read-only)'}
            </span>
          </div>

          <h1 style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em',
            color: '#ffffff'
          }}>
            Category Management CRUD
          </h1>

          <p style={{
            color: '#c7d2fe',
            fontSize: '0.95rem',
            margin: 0,
            maxWidth: '680px',
            lineHeight: 1.5
          }}>
            Dedicated CRUD module for <strong>Team Member 1</strong>. Provides complete management of course categories with real-time validation, modal dialogues, and role-based administrative control.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px'
            }}
            title="Làm mới danh sách"
          >
            <RefreshCw size={16} className={isRefreshing ? 'spinner' : ''} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenCreate}
            style={{
              backgroundColor: '#38bdf8',
              color: '#0f172a',
              borderColor: '#38bdf8',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)'
            }}
            title="Thêm mới danh mục"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Thêm danh mục</span>
          </button>
        </div>
      </div>

      {/* Quick stats mini-row */}
      <div style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap',
        fontSize: '0.88rem',
        color: '#e0e7ff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="#93c5fd" />
          <span>Tổng số danh mục: <strong style={{ color: '#ffffff' }}>{totalCount}</strong></span>
        </div>
        <div>
          <span>Route endpoint: <code style={{ backgroundColor: 'rgba(0,0,0,0.25)', padding: '2px 6px', borderRadius: '4px', color: '#93c5fd' }}>/api/categories</code></span>
        </div>
        <div>
          <span>Page path: <code style={{ backgroundColor: 'rgba(0,0,0,0.25)', padding: '2px 6px', borderRadius: '4px', color: '#93c5fd' }}>/individual/category-crud</code></span>
        </div>
      </div>
    </div>
  );
};
