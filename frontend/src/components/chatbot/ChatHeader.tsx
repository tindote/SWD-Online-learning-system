import React from 'react';
import {
  Cpu,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  X,
  FolderKanban
} from 'lucide-react';

interface ChatHeaderProps {
  courseTitle?: string;
  activeConversationTitle?: string;
  showHistory: boolean;
  isExpanded: boolean;
  onToggleHistory: () => void;
  onToggleExpand: () => void;
  onClose: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  courseTitle,
  activeConversationTitle,
  showHistory,
  isExpanded,
  onToggleHistory,
  onToggleExpand,
  onClose
}) => {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 65%, #0f766e 100%)',
        color: '#ffffff',
        padding: '12px 14px 10px',
        borderBottom: '1px solid rgba(94, 234, 212, 0.25)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '9px'
      }}
    >
      {/* Top Row: Brand Identity + Window Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(20, 184, 166, 0.2)',
              border: '1px solid rgba(94, 234, 212, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Cpu size={19} color="#5eead4" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.01em'
                }}
              >
                AI Assistant
              </h3>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.65rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#6ee7b7',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  border: '1px solid rgba(110, 231, 183, 0.35)'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981'
                  }}
                />
                RAG Engine
              </span>
            </div>
            {courseTitle && (
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: '0.72rem',
                  color: '#99f6e4',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: isExpanded ? '460px' : '250px'
                }}
                title={courseTitle}
              >
                {courseTitle}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onToggleExpand}
            title={isExpanded ? 'Thu nhỏ khung chat' : 'Mở rộng khung chat'}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ccfbf1',
              borderRadius: '8px',
              padding: '6px',
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
            title="Đóng AI Assistant"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ccfbf1',
              borderRadius: '8px',
              padding: '6px',
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

      {/* Interactive Session Selector Dropdown Button */}
      <button
        type="button"
        onClick={onToggleHistory}
        title="Bấm để chuyển đổi hoặc xem danh sách phiên hỏi đáp"
        style={{
          width: '100%',
          backgroundColor: showHistory ? 'rgba(20, 184, 166, 0.28)' : 'rgba(15, 23, 42, 0.45)',
          border: '1px solid rgba(94, 234, 212, 0.3)',
          borderRadius: '9px',
          padding: '6px 10px',
          color: '#f0fdfa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: 600,
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0, flex: 1 }}>
          <FolderKanban size={14} color="#5eead4" style={{ flexShrink: 0 }} />
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {activeConversationTitle || 'Phiên tư vấn mới (Chưa lưu)'}
          </span>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.68rem',
            color: '#5eead4',
            flexShrink: 0
          }}
        >
          <span>{showHistory ? 'Đóng danh sách' : 'Đổi phiên'}</span>
          {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
    </div>
  );
};
