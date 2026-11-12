import React, { useState } from 'react';
import {
  SendHorizontal,
  Plus,
  History,
  Zap,
  Database,
  RefreshCw
} from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  isAdvisorMode?: boolean;
  conversationCount?: number;
  showHistory?: boolean;
  canIndexCourse?: boolean;
  isIndexing?: boolean;
  onNewConversation?: () => void;
  onToggleHistory?: () => void;
  onIndexCourse?: () => void;
  maxLength?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled,
  isAdvisorMode = false,
  conversationCount = 0,
  showHistory = false,
  canIndexCourse = false,
  isIndexing = false,
  onNewConversation,
  onToggleHistory,
  onIndexCourse,
  maxLength = 2000
}) => {
  const [text, setText] = useState('');
  const [showQuickTray, setShowQuickTray] = useState(false);

  const quickTemplates = isAdvisorMode
    ? [
        'Hệ thống hiện có những khóa học nào miễn phí?',
        'Gợi ý lộ trình học cho người mới bắt đầu',
        'Tư vấn các khóa học về Data Science & AI',
        'Các khóa học Web Development & DevOps hiện có'
      ]
    : [
        'Tóm tắt trọng tâm bài học này',
        'Cho ví dụ thực tế áp dụng nội dung bài học',
        'Giải thích khái niệm khó nhất trong bài',
        'Những lỗi thường gặp cần tránh trong bài này'
      ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    setShowQuickTray(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed || disabled) return;
      onSend(trimmed);
      setText('');
      setShowQuickTray(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #cbd5e1',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}
    >
      {/* Collapsible Quick Prompt Tray */}
      {showQuickTray && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#f0fdfa',
            borderBottom: '1px solid #ccfbf1',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px'
          }}
        >
          {quickTemplates.map((tpl, idx) => (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => {
                onSend(tpl);
                setShowQuickTray(false);
              }}
              style={{
                padding: '5px 9px',
                borderRadius: '7px',
                border: '1px solid #99f6e4',
                backgroundColor: '#ffffff',
                color: '#0f766e',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                textAlign: 'left'
              }}
            >
              ⚡ {tpl}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Functional Action Dock */}
      <div
        style={{
          padding: '7px 12px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onNewConversation && (
            <button
              type="button"
              onClick={onNewConversation}
              style={{
                padding: '4px 9px',
                borderRadius: '6px',
                border: '1px solid #0d9488',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                fontSize: '0.71rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Plus size={13} /> Phiên mới
            </button>
          )}

          {onToggleHistory && (
            <button
              type="button"
              onClick={onToggleHistory}
              style={{
                padding: '4px 9px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: showHistory ? '#ccfbf1' : '#ffffff',
                color: showHistory ? '#0f766e' : '#334155',
                fontSize: '0.71rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <History size={13} /> Lịch sử ({conversationCount})
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowQuickTray((prev) => !prev)}
            style={{
              padding: '4px 9px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: showQuickTray ? '#ccfbf1' : '#ffffff',
              color: showQuickTray ? '#0f766e' : '#334155',
              fontSize: '0.71rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Zap size={13} color="#0d9488" /> Mẫu câu hỏi
          </button>
        </div>

        {canIndexCourse && onIndexCourse && (
          <button
            type="button"
            onClick={onIndexCourse}
            disabled={isIndexing}
            title="Cập nhật chỉ mục RAG cho khóa học"
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #99f6e4',
              backgroundColor: '#f0fdfa',
              color: '#0f766e',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: isIndexing ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isIndexing ? <RefreshCw size={12} className="spin-icon" /> : <Database size={12} />}
            <span>{isIndexing ? 'Đang nạp...' : 'Index RAG'}</span>
          </button>
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isAdvisorMode
                ? 'Nhập câu hỏi tư vấn khóa học cho AI Assistant...'
                : 'Nhập câu hỏi về nội dung bài học...'
            }
            disabled={disabled}
            maxLength={maxLength}
            style={{
              flex: 1,
              resize: 'none',
              padding: '8px 11px',
              borderRadius: '10px',
              border: '1px solid #99f6e4',
              fontSize: '0.83rem',
              fontFamily: 'inherit',
              color: '#0f172a',
              backgroundColor: disabled ? '#f8fafc' : '#f4f9f8',
              outline: 'none',
              lineHeight: 1.45
            }}
          />
          <button
            type="submit"
            disabled={disabled || !text.trim()}
            aria-label="Gửi"
            style={{
              height: '42px',
              padding: '0 14px',
              borderRadius: '10px',
              border: 'none',
              background:
                disabled || !text.trim()
                  ? '#cbd5e1'
                  : 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
              color: '#ffffff',
              cursor: disabled || !text.trim() ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '0.78rem',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
          >
            <span>Gửi</span>
            <SendHorizontal size={15} />
          </button>
        </div>
      </div>
    </form>
  );
};
