import React from 'react';
import {
  Bot,
  History,
  Plus,
  X,
  Maximize2,
  Minimize2,
  Database,
  RefreshCw
} from 'lucide-react';

interface ChatHeaderProps {
  courseTitle?: string;
  showHistory: boolean;
  isExpanded: boolean;
  canIndexCourse: boolean;
  isIndexing: boolean;
  onToggleHistory: () => void;
  onNewConversation: () => void;
  onToggleExpand: () => void;
  onIndexCourse?: () => void;
  onClose: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  courseTitle,
  showHistory,
  isExpanded,
  canIndexCourse,
  isIndexing,
  onToggleHistory,
  onNewConversation,
  onToggleExpand,
  onIndexCourse,
  onClose
}) => {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
        color: '#ffffff',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        flexShrink: 0
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255,255,255,0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Bot size={20} color="#a5b4fc" />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3
              style={{
                margin: 0,
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#ffffff',
                whiteSpace: 'nowrap'
              }}
            >
              Trợ lý Học tập AI
            </h3>
            <span
              style={{
                fontSize: '0.68rem',
                backgroundColor: 'rgba(16, 185, 129, 0.25)',
                color: '#6ee7b7',
                padding: '2px 7px',
                borderRadius: '999px',
                fontWeight: 600,
                border: '1px solid rgba(110, 231, 183, 0.35)'
              }}
            >
              Gemini RAG
            </span>
          </div>
          {courseTitle && (
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '0.75rem',
                color: '#c7d2fe',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: isExpanded ? '420px' : '210px'
              }}
              title={courseTitle}
            >
              {courseTitle}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {canIndexCourse && onIndexCourse && (
          <button
            type="button"
            onClick={onIndexCourse}
            disabled={isIndexing}
            title="Cập nhật chỉ mục RAG cho bài giảng khóa học này (Giảng viên / Admin)"
            style={{
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#e0e7ff',
              borderRadius: '8px',
              padding: '6px 8px',
              cursor: isIndexing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              fontWeight: 600
            }}
          >
            {isIndexing ? <RefreshCw size={14} className="spin-icon" /> : <Database size={14} />}
            <span>{isIndexing ? 'Đang nạp...' : 'Index RAG'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onToggleHistory}
          title="Lịch sử trò chuyện"
          style={{
            background: showHistory ? '#4f46e5' : 'rgba(255,255,255,0.12)',
            border: 'none',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '7px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <History size={16} />
        </button>

        <button
          type="button"
          onClick={onNewConversation}
          title="Tạo cuộc trò chuyện mới"
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: 'none',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '7px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Plus size={16} />
        </button>

        <button
          type="button"
          onClick={onToggleExpand}
          title={isExpanded ? 'Thu nhỏ cửa sổ' : 'Mở rộng cửa sổ'}
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: 'none',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '7px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>

        <button
          type="button"
          onClick={onClose}
          title="Đóng cửa sổ chat"
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: 'none',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '7px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

