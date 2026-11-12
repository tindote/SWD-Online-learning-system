import React, { useState } from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  isAdvisorMode?: boolean;
  maxLength?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled,
  isAdvisorMode = false,
  maxLength = 2000
}) => {
  const [text, setText] = useState('');

  const quickChips = isAdvisorMode
    ? [
        { label: '🌸 Khóa học 0đ', prompt: 'Hệ thống hiện có những khóa học nào miễn phí?' },
        { label: '🧭 Người mới bắt đầu', prompt: 'Gợi ý lộ trình học cho người mới bắt đầu' },
        { label: '🤖 Khóa học AI & Data', prompt: 'Tư vấn các khóa học về Data Science & AI' }
      ]
    : [
        { label: '🌸 Tóm tắt nhanh', prompt: 'Tóm tắt ngắn gọn nội dung bài học này' },
        { label: '💡 Ví dụ thực tế', prompt: 'Cho mình một ví dụ thực tế áp dụng bài học này' },
        { label: '🎯 Điểm cần nhớ', prompt: 'Những lưu ý quan trọng nhất cần nhớ trong bài này là gì?' }
      ];

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
        padding: '10px 14px 12px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #fbcfe8',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flexShrink: 0
      }}
    >
      {/* Quick Action Pills Row right above Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onSend(chip.prompt)}
            style={{
              whiteSpace: 'nowrap',
              padding: '4px 10px',
              borderRadius: '999px',
              border: '1px solid #f9a8d4',
              backgroundColor: '#fdf2f8',
              color: '#be185d',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Capsule Input Container with Embedded Send Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: disabled ? '#fff1f5' : '#fdf2f8',
          border: '1.5px solid #f472b6',
          borderRadius: '22px',
          padding: '6px 8px 6px 14px',
          boxShadow: 'inset 0 1px 3px rgba(236, 72, 153, 0.06)'
        }}
      >
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isAdvisorMode
              ? 'Nhắn cho Sakura nhu cầu học của bạn...'
              : 'Đặt câu hỏi cho Sakura về bài giảng...'
          }
          disabled={disabled}
          maxLength={maxLength}
          style={{
            flex: 1,
            resize: 'none',
            border: 'none',
            backgroundColor: 'transparent',
            fontSize: '0.84rem',
            fontFamily: 'inherit',
            color: '#831843',
            outline: 'none',
            lineHeight: 1.45,
            maxHeight: '68px'
          }}
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          aria-label="Gửi tin nhắn"
          style={{
            height: '34px',
            width: '34px',
            borderRadius: '50%',
            border: 'none',
            background:
              disabled || !text.trim()
                ? '#fbcfe8'
                : 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
            color: '#ffffff',
            cursor: disabled || !text.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow:
              disabled || !text.trim()
                ? 'none'
                : '0 3px 8px rgba(236, 72, 153, 0.35)',
            transition: 'all 0.15s ease'
          }}
        >
          <ArrowUp size={17} />
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.66rem',
          color: '#db2777',
          padding: '0 4px'
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={11} color="#ec4899" />
          <span>Sakura AI • Tư vấn & Giải đáp trực tiếp từ hệ thống</span>
        </span>
        <span>
          {text.length}/{maxLength}
        </span>
      </div>
    </form>
  );
};
