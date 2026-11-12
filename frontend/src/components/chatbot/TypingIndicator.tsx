import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        marginBottom: '14px'
      }}
    >
      <div
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: '#eef2ff',
          color: '#4f46e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid #c7d2fe'
        }}
      >
        <Bot size={16} />
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px 14px 14px 4px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
        }}
      >
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span className="ai-typing-dot" style={{ animationDelay: '0ms' }} />
          <span className="ai-typing-dot" style={{ animationDelay: '160ms' }} />
          <span className="ai-typing-dot" style={{ animationDelay: '320ms' }} />
        </div>
        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
          Đang tra cứu tài liệu bài học & tổng hợp câu trả lời...
        </span>
      </div>
    </div>
  );
};

