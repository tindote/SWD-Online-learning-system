import React from 'react';
import { MessageCircleHeart, Sparkles, Trash2, ArrowLeft } from 'lucide-react';
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
        backgroundColor: '#fffafb',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #fce7f3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}
      >
        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#831843' }}>
          🌸 Nhật ký trò chuyện với Sakura ({conversations.length})
        </span>
        <button
          type="button"
          onClick={onClosePanel}
          style={{
            background: '#fdf2f8',
            border: '1px solid #f9a8d4',
            borderRadius: '999px',
            color: '#be185d',
            cursor: 'pointer',
            padding: '4px 10px',
            fontSize: '0.73rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <ArrowLeft size={13} /> Quay lại chat
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', fontSize: '0.82rem', color: '#be185d' }}>
            Đang tải nhật ký trò chuyện...
          </div>
        ) : conversations.length === 0 ? (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              fontSize: '0.82rem',
              color: '#9d174d',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed #f9a8d4'
            }}
          >
            Bạn chưa có cuộc trò chuyện nào được lưu. Hãy đặt câu hỏi đầu tiên cho Sakura nhé! 🌸
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
                  padding: '10px 12px',
                  borderRadius: '14px',
                  marginBottom: '8px',
                  backgroundColor: isActive ? '#fdf2f8' : '#ffffff',
                  border: isActive ? '1.5px solid #f472b6' : '1px solid #fce7f3',
                  boxShadow: isActive
                    ? '0 4px 12px rgba(236, 72, 153, 0.12)'
                    : '0 1px 3px rgba(15, 23, 42, 0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => {
                  onSelectConversation(conv.id);
                  onClosePanel();
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      backgroundColor: isActive ? '#ec4899' : '#fce7f3',
                      color: isActive ? '#ffffff' : '#db2777',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <MessageCircleHeart size={16} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: isActive ? 700 : 600,
                        color: isActive ? '#831843' : '#334155',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={conv.title}
                    >
                      {conv.title}
                    </div>
                    <div style={{ fontSize: '0.69rem', color: '#94a3b8', marginTop: '2px' }}>
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
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    color: '#e11d48',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexShrink: 0
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid #fce7f3', backgroundColor: '#ffffff' }}>
        <button
          type="button"
          onClick={() => {
            onNewConversation();
            onClosePanel();
          }}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '999px',
            border: 'none',
            background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
          }}
        >
          <Sparkles size={15} /> Bắt đầu cuộc hội thoại mới
        </button>
      </div>
    </div>
  );
};
