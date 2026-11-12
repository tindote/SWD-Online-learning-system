import React from 'react';
import { Cpu, ChevronDown } from 'lucide-react';

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
      aria-label={isOpen ? 'Thu gọn AI Assistant' : 'Mở AI Assistant'}
      title={courseTitle ? `AI Assistant • ${courseTitle}` : 'AI Assistant (Gemini RAG)'}
      style={{
        position: 'fixed',
        bottom: '22px',
        right: '24px',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: isOpen ? '12px 16px' : '11px 18px 11px 13px',
        borderRadius: '16px',
        border: '1px solid rgba(94, 234, 212, 0.45)',
        cursor: 'pointer',
        background: isOpen
          ? '#0f172a'
          : 'linear-gradient(135deg, #0f172a 0%, #115e59 50%, #0d9488 100%)',
        color: '#ffffff',
        boxShadow: '0 14px 30px -6px rgba(13, 148, 136, 0.5)',
        fontWeight: 700,
        fontSize: '0.88rem',
        transition: 'all 0.2s ease'
      }}
    >
      {isOpen ? (
        <>
          <ChevronDown size={19} color="#5eead4" />
          <span style={{ fontSize: '0.82rem', color: '#ccfbf1' }}>Thu gọn</span>
        </>
      ) : (
        <>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              backgroundColor: 'rgba(20, 184, 166, 0.22)',
              border: '1px solid rgba(94, 234, 212, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              flexShrink: 0
            }}
          >
            <Cpu size={19} color="#5eead4" />
            <span
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                border: '2px solid #0f172a'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
              AI Assistant
            </span>
            <span style={{ fontSize: '0.67rem', fontWeight: 600, color: '#5eead4' }}>
              Smart Mentor • Online
            </span>
          </div>
        </>
      )}
    </button>
  );
};
