import React from 'react';
import { Cpu } from 'lucide-react';

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
          width: '30px',
          height: '30px',
          borderRadius: '9px',
          backgroundColor: '#0f172a',
          color: '#5eead4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid #0f766e'
        }}
      >
        <Cpu size={15} />
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderLeft: '4px solid #0d9488',
          borderRadius: '6px 14px 14px 6px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
        }}
      >
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span className="ai-typing-dot" style={{ animationDelay: '0ms' }} />
          <span className="ai-typing-dot" style={{ animationDelay: '160ms' }} />
          <span className="ai-typing-dot" style={{ animationDelay: '320ms' }} />
        </div>
        <span style={{ fontSize: '0.78rem', color: '#0f766e', fontWeight: 600 }}>
          AI Assistant đang phân tích dữ liệu...
        </span>
      </div>
    </div>
  );
};
