import React from 'react';
import { Flower2, Sparkles, X } from 'lucide-react';

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
      aria-label={isOpen ? 'Đóng Sakura AI' : 'Mở Sakura AI'}
      title={courseTitle ? `Hỏi Sakura AI về: ${courseTitle}` : 'Sakura AI 🌸 — Cố vấn Học tập'}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: isOpen ? '14px' : '10px 18px 10px 12px',
        borderRadius: '999px',
        border: '2px solid rgba(255, 255, 255, 0.85)',
        cursor: 'pointer',
        background: isOpen
          ? 'linear-gradient(135deg, #be185d 0%, #9d174d 100%)'
          : 'linear-gradient(135deg, #ec4899 0%, #f43f5e 55%, #fb7185 100%)',
        color: '#ffffff',
        boxShadow: '0 12px 28px -4px rgba(236, 72, 153, 0.55), 0 0 0 4px rgba(251, 207, 232, 0.45)',
        fontWeight: 700,
        fontSize: '0.88rem',
        transition: 'all 0.22s ease'
      }}
    >
      {isOpen ? (
        <X size={22} />
      ) : (
        <>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              flexShrink: 0
            }}
          >
            <Flower2 size={20} color="#ffffff" />
            <Sparkles
              size={11}
              color="#fef08a"
              style={{ position: 'absolute', top: '-2px', right: '-2px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, letterSpacing: '0.01em' }}>
              Sakura AI 🌸
            </span>
            <span style={{ fontSize: '0.67rem', fontWeight: 500, color: '#ffe4e6' }}>
              Cố vấn học tập
            </span>
          </div>
        </>
      )}
    </button>
  );
};
