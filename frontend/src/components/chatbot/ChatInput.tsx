import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  maxLength?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled,
  maxLength = 2000
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed || disabled) return;
      onSend(trimmed);
      setText('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '12px 14px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        flexShrink: 0
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
        <textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Đặt câu hỏi về bài học (Nhấn Enter để gửi, Shift+Enter xuống dòng)..."
          disabled={disabled}
          maxLength={maxLength}
          style={{
            flex: 1,
            resize: 'none',
            padding: '9px 12px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            fontSize: '0.84rem',
            fontFamily: 'inherit',
            color: '#0f172a',
            backgroundColor: disabled ? '#f8fafc' : '#ffffff',
            outline: 'none',
            lineHeight: 1.45
          }}
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          aria-label="Gửi câu hỏi"
          style={{
            height: '40px',
            width: '42px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: disabled || !text.trim() ? '#cbd5e1' : '#4f46e5',
            color: '#ffffff',
            cursor: disabled || !text.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background-color 0.15s ease'
          }}
        >
          <Send size={17} />
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.68rem',
          color: '#94a3b8'
        }}
      >
        <span>Ưu tiên trả lời từ giáo trình khóa học</span>
        <span>
          {text.length}/{maxLength}
        </span>
      </div>
    </form>
  );
};

