import React, { useEffect, useRef } from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';
import { AiMessage } from '../../types/aiChat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: AiMessage[];
  isLoading: boolean;
  isAdvisorMode?: boolean;
  currentLessonTitle?: string;
  previewCourseTitle?: string;
  onQuickPrompt: (promptText: string) => void;
  onSelectLesson?: (lessonId: number) => void;
  onSelectCourse?: (courseId: number) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  isAdvisorMode = false,
  currentLessonTitle,
  previewCourseTitle,
  onQuickPrompt,
  onSelectLesson,
  onSelectCourse
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const suggestedPrompts = isAdvisorMode
    ? [
        previewCourseTitle
          ? `Khóa học "${previewCourseTitle}" dạy những gì và phù hợp với ai?`
          : 'Mình là người mới bắt đầu học lập trình Web thì nên chọn khóa học nào?',
        'Hệ thống hiện có những khóa học nào miễn phí?',
        'Tư vấn giúp mình lộ trình các khóa học về Data Science & AI',
        'Gợi ý các khóa học về Mobile Development hoặc DevOps & Cloud'
      ]
    : [
        currentLessonTitle
          ? `Tóm tắt các ý chính của bài học "${currentLessonTitle}"`
          : 'Tóm tắt nội dung bài học hiện tại',
        'Giải thích khái niệm quan trọng nhất trong bài học này một cách dễ hiểu',
        'Cho tôi một ví dụ thực tế áp dụng kiến thức của khóa học này',
        'Những lưu ý hoặc lỗi thường gặp trong chủ đề này là gì?'
      ];

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {messages.length === 0 && !isLoading ? (
        <div
          style={{
            margin: 'auto 0',
            textAlign: 'center',
            padding: '12px 8px'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: '#eef2ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}
          >
            <Sparkles size={24} />
          </div>
          <h4 style={{ margin: '0 0 6px', fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>
            {isAdvisorMode
              ? 'Xin chào! Mình là Trợ lý Tư vấn Khóa học AI'
              : 'Xin chào! Mình là Trợ lý Học tập AI'}
          </h4>
          <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
            {isAdvisorMode ? (
              <>
                Mình sử dụng <strong>Google Gemini & RAG</strong> để tư vấn chọn khóa học, lộ trình học tập, học phí và đề cương dựa trên dữ liệu thực tế của hệ thống.
              </>
            ) : (
              <>
                Mình sử dụng công nghệ <strong>Google Gemini & RAG</strong> để trả lời câu hỏi dựa trực tiếp trên nội dung bài giảng của khóa học này.
              </>
            )}
          </p>

          <div style={{ textAlign: 'left' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#475569',
                marginBottom: '8px'
              }}
            >
              <HelpCircle size={13} color="#4f46e5" />
              <span>Gợi ý câu hỏi nhanh:</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onQuickPrompt(prompt)}
                  style={{
                    textAlign: 'left',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                    fontSize: '0.79rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onSelectLesson={onSelectLesson}
              onSelectCourse={onSelectCourse}
            />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
};

