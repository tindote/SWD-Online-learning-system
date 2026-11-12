import React from 'react';
import { MessageSquare, Plus, Trash2, X } from 'lucide-react';
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
        top: 0,
        left: 0,
        bottom: 0,
        width: '265px',
        maxWidth: '85%',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '6px 0 20px rgba(15, 23, 42, 0.08)'
      }}
    >
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
          Lịch sử trò chuyện ({conversations.length})
        </span>
        <button
          type="button"
          onClick={onClosePanel}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex'
          }}
          title="Đóng danh sách"
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
        <button
          type="button"
          onClick={() => {
            onNewConversation();
            onClosePanel();
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px dashed #6366f1',
            backgroundColor: '#eef2ff',
            color: '#4338ca',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Plus size={15} /> Cuộc trò chuyện mới
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
            Đang tải lịch sử...
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: '24px 12px', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
            Chưa có cuộc trò chuyện nào trong khóa học này.
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
                  gap: '6px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  backgroundColor: isActive ? '#eef2ff' : 'transparent',
                  border: isActive ? '1px solid #c7d2fe' : '1px solid transparent',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  onSelectConversation(conv.id);
                  onClosePanel();
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0, flex: 1 }}>
                  <MessageSquare
                    size={15}
                    color={isActive ? '#4f46e5' : '#64748b'}
                    style={{ marginTop: '2px', flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#312e81' : '#334155',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={conv.title}
                    >
                      {conv.title}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                      {formatDate(conv.updated_at || conv.created_at)}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  title="Xóa cuộc trò chuyện này"
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
                    borderRadius: '4px',
                    display: 'flex',
                    flexShrink: 0
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

