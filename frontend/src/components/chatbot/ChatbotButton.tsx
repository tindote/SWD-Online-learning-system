import React from 'react';
import { Bot, Sparkles, X } from 'lucide-react';

interface ChatbotButtonProps {
  isOpen: boolean;
  onClick: () => void;
  courseTitle?: string;
}

export const ChatbotButton: React.FC<ChatbotButtonProps> = ({
  isOpen,
  onClick,
  courseTitle
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Đóng Trợ lý Học tập AI' : 'Mở Trợ lý Học tập AI'}
      title={courseTitle ? `Hỏi Trợ lý AI về: ${courseTitle}` : 'Trợ lý Học tập AI (Gemini RAG)'}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: isOpen ? '14px' : '14px 20px',
        borderRadius: '999px',
        border: 'none',
        cursor: 'pointer',
        background: isOpen
          ? '#1e1b4b'
          : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        color: '#ffffff',
        boxShadow: '0 12px 28px -4px rgba(79, 70, 229, 0.5)',
        fontWeight: 700,
        fontSize: '0.92rem',
        transition: 'all 0.2s ease'
      }}
    >
      {isOpen ? (
        <X size={22} />
      ) : (
        <>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Bot size={22} />
            <Sparkles
              size={12}
              color="#fbbf24"
              style={{ position: 'absolute', top: '-5px', right: '-6px' }}
            />
          </div>
          <span>Trợ lý AI</span>
        </>
      )}
    </button>
  );
};

