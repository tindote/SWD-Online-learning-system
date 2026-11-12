import React from 'react';
import { Flower2 } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '9px',
        marginBottom: '14px'
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
          color: '#db2777',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid #f9a8d4'
        }}
      >
        <Flower2 size={17} />
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #fbcfe8',
          borderRadius: '20px 20px 20px 4px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(236, 72, 153, 0.08)'
        }}
      >
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span className="ai-typing-dot" style={{ animationDelay: '0ms' }} />
          <span className="ai-typing-dot" style={{ animationDelay: '160ms' }} />
          <span className="ai-typing-dot" style={{ animationDelay: '320ms' }} />
        </div>
        <span style={{ fontSize: '0.78rem', color: '#be185d', fontWeight: 600 }}>
          Sakura đang soạn câu trả lời cho bạn... 🌸
        </span>
      </div>
    </div>
  );
};
