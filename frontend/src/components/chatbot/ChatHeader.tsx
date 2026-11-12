import React from 'react';
import {
  Flower2,
  MessageCircleHeart,
  Clock,
  Sparkles,
  X,
  Maximize2,
  Minimize2,
  Database,
  RefreshCw
} from 'lucide-react';

interface ChatHeaderProps {
  courseTitle?: string;
  conversationCount?: number;
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
  conversationCount = 0,
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
    <div style={{ flexShrink: 0 }}>
      {/* Top Banner: Sakura Identity + Window Controls */}
      <div
        style={{
          background: 'linear-gradient(135deg, #db2777 0%, #ec4899 50%, #fb7185 100%)',
          color: '#ffffff',
          padding: '13px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(157, 23, 77, 0.2)'
            }}
          >
            <Flower2 size={22} color="#ffffff" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.01em'
                }}
              >
                Sakura AI 🌸
              </h3>
              <span
                style={{
                  fontSize: '0.66rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.22)',
                  color: '#fff1f2',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 700,
                  border: '1px solid rgba(255, 255, 255, 0.35)'
                }}
              >
                Cố vấn Khóa học
              </span>
            </div>
            {courseTitle && (
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: '0.74rem',
                  color: '#ffe4e6',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: isExpanded ? '460px' : '240px'
                }}
                title={courseTitle}
              >
                {courseTitle}
              </p>
            )}
          </div>
        </div>

        {/* Window Controls Only (Expand & Close) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onToggleExpand}
            title={isExpanded ? 'Thu nhỏ cửa sổ' : 'Phóng to cửa sổ'}
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              color: '#ffffff',
              borderRadius: '999px',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Đóng cửa sổ"
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              color: '#ffffff',
              borderRadius: '999px',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Bottom Action Bar: Segmented Navigation Tabs + New Chat Pill */}
      <div
        style={{
          backgroundColor: '#fdf2f8',
          borderBottom: '1px solid #fbcfe8',
          padding: '7px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}
      >
        {/* Segmented Mode Switcher (Chat vs History) */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: '#fce7f3',
            padding: '3px',
            borderRadius: '999px',
            border: '1px solid #f9a8d4'
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (showHistory) onToggleHistory();
            }}
            style={{
              border: 'none',
              borderRadius: '999px',
              padding: '4px 11px',
              fontSize: '0.73rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: ' inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: !showHistory ? '#ec4899' : 'transparent',
              color: !showHistory ? '#ffffff' : '#9d174d',
              boxShadow: !showHistory ? '0 2px 6px rgba(236, 72, 153, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <MessageCircleHeart size={13} />
            <span>Trò chuyện</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!showHistory) onToggleHistory();
            }}
            style={{
              border: 'none',
              borderRadius: '999px',
              padding: '4px 11px',
              fontSize: '0.73rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: showHistory ? '#ec4899' : 'transparent',
              color: showHistory ? '#ffffff' : '#9d174d',
              boxShadow: showHistory ? '0 2px 6px rgba(236, 72, 153, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Clock size={13} />
            <span>Lịch sử ({conversationCount})</span>
          </button>
        </div>

        {/* Right Action Pills: New Chat & Optional RAG Index */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {canIndexCourse && onIndexCourse && (
            <button
              type="button"
              onClick={onIndexCourse}
              disabled={isIndexing}
              title="Cập nhật chỉ mục RAG cho bài giảng khóa học này"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #f9a8d4',
                color: '#be185d',
                borderRadius: '999px',
                padding: '4px 9px',
                cursor: isIndexing ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.71rem',
                fontWeight: 700
              }}
            >
              {isIndexing ? <RefreshCw size={12} className="spin-icon" /> : <Database size={12} />}
              <span>{isIndexing ? 'Đang nạp...' : 'Nạp RAG'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onNewConversation();
              if (showHistory) onToggleHistory();
            }}
            title="Bắt đầu cuộc hội thoại mới với Sakura AI"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #f472b6',
              color: '#db2777',
              borderRadius: '999px',
              padding: '4px 11px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.73rem',
              fontWeight: 700,
              boxShadow: '0 1px 3px rgba(236, 72, 153, 0.12)'
            }}
          >
            <Sparkles size={13} color="#ec4899" />
            <span>Hội thoại mới</span>
          </button>
        </div>
      </div>
    </div>
  );
};
