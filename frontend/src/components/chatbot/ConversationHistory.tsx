import React from 'react';
import { Terminal, Plus, Trash2, Check } from 'lucide-react';
import { AiConversation } from '../../types/aiChat';

interface ConversationHistoryProps {
  conversations: AiConversation[];
  activeConversationId: number | null;
  loading: boolean;
  onSelectConversation: (conversationId: number) => void;
  onNewConversation: () => void;
  onDeleteConversation: (conversationId: number) => void;
  onClosePanel: () => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  conversations,
  activeConversationId,
  loading,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClosePanel
}) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.35)',
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={onClosePanel}
    >
      {/* Top Slide-Down Panel */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #0d9488',
          borderRadius: '0 0 16px 16px',
          maxHeight: '78%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 16px 32px rgba(15, 23, 42, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: '#f0fdfa',
            borderBottom: '1px solid #ccfbf1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#115e59' }}>
            DANH SÁCH PHIÊN HỎI ĐÁP ({conversations.length})
          </span>
          <button
            type="button"
            onClick={() => {
              onNewConversation();
              onClosePanel();
            }}
            style={{
              padding: '5px 10px',
              borderRadius: '7px',
              border: '1px solid #0d9488',
              backgroundColor: '#0d9488',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.73rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={13} /> Tạo phiên mới
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#0f766e' }}>
              Đang đồng bộ danh sách phiên...
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '22px 12px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
              Chưa có lịch sử phiên hỏi đáp nào trong chế độ này.
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: '9px 11px',
                    borderRadius: '10px',
                    marginBottom: '6px',
                    backgroundColor: isActive ? '#f0fdfa' : '#f8fafc',
                    border: isActive ? '1px solid #2dd4bf' : '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onClosePanel();
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, flex: 1 }}>
                    <Terminal
                      size={15}
                      color={isActive ? '#0d9488' : '#64748b'}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: isActive ? 700 : 600,
                          color: isActive ? '#134e4a' : '#334155',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={conv.title}
                      >
                        {conv.title}
                      </div>
                      <div style={{ fontSize: '0.67rem', color: '#94a3b8', marginTop: '1px' }}>
                        Cập nhật: {formatDate(conv.updated_at || conv.created_at)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    {isActive && <Check size={14} color="#0d9488" />}
                    <button
                      type="button"
                      title="Xóa phiên này"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '6px',
                        display: 'flex'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
