import React, { useEffect, useRef } from 'react';
import { Flower2, Compass, Gift, Cpu, Cloud, BookOpen, Lightbulb, Code2, ShieldAlert } from 'lucide-react';
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

  const quickCards = isAdvisorMode
    ? [
        {
          icon: <Gift size={16} color="#db2777" />,
          badge: 'Khóa học 0đ',
          label: 'Khám phá khóa miễn phí',
          prompt: 'Hệ thống hiện có những khóa học nào miễn phí?'
        },
        {
          icon: <Compass size={16} color="#db2777" />,
          badge: 'Người mới',
          label: previewCourseTitle ? 'Đánh giá khóa đang xem' : 'Lộ trình học Web từ đầu',
          prompt: previewCourseTitle
            ? `Khóa học "${previewCourseTitle}" dạy những gì và phù hợp với ai?`
            : 'Mình là người mới bắt đầu học lập trình Web thì nên chọn khóa học nào?'
        },
        {
          icon: <Cpu size={16} color="#db2777" />,
          badge: 'Xu hướng',
          label: 'Lộ trình Data & AI',
          prompt: 'Tư vấn giúp mình lộ trình các khóa học về Data Science & AI'
        },
        {
          icon: <Cloud size={16} color="#db2777" />,
          badge: 'Thực chiến',
          label: 'Mobile & Cloud DevOps',
          prompt: 'Gợi ý các khóa học về Mobile Development hoặc DevOps & Cloud'
        }
      ]
    : [
        {
          icon: <BookOpen size={16} color="#db2777" />,
          badge: 'Tóm tắt 10s',
          label: 'Ý chính bài học này',
          prompt: currentLessonTitle
            ? `Tóm tắt các ý chính của bài học "${currentLessonTitle}"`
            : 'Tóm tắt nội dung bài học hiện tại'
        },
        {
          icon: <Lightbulb size={16} color="#db2777" />,
          badge: 'Dễ hiểu',
          label: 'Giải thích khái niệm cốt lõi',
          prompt: 'Giải thích khái niệm quan trọng nhất trong bài học này một cách dễ hiểu'
        },
        {
          icon: <Code2 size={16} color="#db2777" />,
          badge: 'Thực hành',
          label: 'Ví dụ áp dụng thực tế',
          prompt: 'Cho tôi một ví dụ thực tế áp dụng kiến thức của khóa học này'
        },
        {
          icon: <ShieldAlert size={16} color="#db2777" />,
          badge: 'Bí kíp',
          label: 'Lỗi thường gặp cần tránh',
          prompt: 'Những lưu ý hoặc lỗi thường gặp trong chủ đề này là gì?'
        }
      ];

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        background: 'linear-gradient(180deg, #fffafb 0%, #fff1f5 100%)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {messages.length === 0 && !isLoading ? (
        <div
          style={{
            margin: 'auto 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {/* Sakura Greeting Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '18px 16px',
              border: '1px solid #fbcfe8',
              boxShadow: '0 8px 24px -6px rgba(236, 72, 153, 0.12)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                color: '#db2777',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                border: '1px solid #f9a8d4'
              }}
            >
              <Flower2 size={25} />
            </div>
            <h4
              style={{
                margin: '0 0 6px',
                fontSize: '0.98rem',
                fontWeight: 800,
                color: '#831843'
              }}
            >
              {isAdvisorMode
                ? 'Chào bạn! Mình là Sakura AI 🌸'
                : 'Sakura AI sẵn sàng hỗ trợ bài học 🌸'}
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: '0.79rem',
                color: '#64748b',
                lineHeight: 1.5
              }}
            >
              {isAdvisorMode
                ? 'Hãy chọn một chủ đề bên dưới hoặc nhắn mục tiêu của bạn, Sakura sẽ thiết kế lộ trình học phù hợp nhất!'
                : 'Bạn đang thắc mắc phần nào trong bài giảng? Chọn nhanh một thẻ bên dưới để Sakura giải đáp ngay nhé!'}
            </p>
          </div>

          {/* 2x2 Grid of Quick Topic Cards */}
          <div>
            <div
              style={{
                fontSize: '0.73rem',
                fontWeight: 700,
                color: '#9d174d',
                marginBottom: '8px',
                paddingLeft: '4px'
              }}
            >
              ✨ Khám phá nhanh cùng Sakura:
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '8px'
              }}
            >
              {quickCards.map((card, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onQuickPrompt(card.prompt)}
                  style={{
                    textAlign: 'left',
                    padding: '11px 12px',
                    borderRadius: '16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #fbcfe8',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(236, 72, 153, 0.06)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%'
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '9px',
                        backgroundColor: '#fdf2f8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {card.icon}
                    </div>
                    <span
                      style={{
                        fontSize: '0.64rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '999px',
                        backgroundColor: '#fce7f3',
                        color: '#be185d'
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#831843',
                      lineHeight: 1.35
                    }}
                  >
                    {card.label}
                  </div>
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
