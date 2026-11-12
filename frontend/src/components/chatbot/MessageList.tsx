import React, { useEffect, useRef } from 'react';
import { Cpu, ArrowRight, Layers, Sparkles, Compass, Terminal } from 'lucide-react';
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

  const actionItems = isAdvisorMode
    ? [
        {
          icon: <Sparkles size={15} color="#0d9488" />,
          title: 'Danh sách khóa học Miễn phí ($0)',
          desc: 'Lọc nhanh các khóa học 0đ đang mở đăng ký',
          prompt: 'Hệ thống hiện có những khóa học nào miễn phí?'
        },
        {
          icon: <Compass size={15} color="#0d9488" />,
          title: previewCourseTitle ? `Phân tích khóa "${previewCourseTitle}"` : 'Tư vấn lộ trình cho người mới',
          desc: previewCourseTitle
            ? 'Đánh giá đề cương, giảng viên & đối tượng phù hợp'
            : 'Đề xuất thứ tự học tập từ cơ bản đến nâng cao',
          prompt: previewCourseTitle
            ? `Khóa học "${previewCourseTitle}" dạy những gì và phù hợp với ai?`
            : 'Mình là người mới bắt đầu học lập trình Web thì nên chọn khóa học nào?'
        },
        {
          icon: <Layers size={15} color="#0d9488" />,
          title: 'Khóa học Data Science, AI & Cloud',
          desc: 'Khám phá các khóa công nghệ xu hướng trên hệ thống',
          prompt: 'Tư vấn giúp mình lộ trình các khóa học về Data Science, AI và Cloud'
        }
      ]
    : [
        {
          icon: <Terminal size={15} color="#0d9488" />,
          title: 'Tóm tắt trọng tâm bài giảng',
          desc: currentLessonTitle || 'Tổng hợp các khái niệm cốt lõi nhất',
          prompt: currentLessonTitle
            ? `Tóm tắt các ý chính của bài học "${currentLessonTitle}"`
            : 'Tóm tắt nội dung bài học hiện tại'
        },
        {
          icon: <Layers size={15} color="#0d9488" />,
          title: 'Phân tích chuyên sâu & Ví dụ thực tế',
          desc: 'Giải thích kèm ví dụ minh họa hoặc code mẫu',
          prompt: 'Giải thích khái niệm quan trọng nhất trong bài học này kèm ví dụ thực tế'
        },
        {
          icon: <Sparkles size={15} color="#0d9488" />,
          title: 'Các lỗi thường gặp cần tránh',
          desc: 'Lưu ý thực hành quan trọng từ tài liệu khóa học',
          prompt: 'Những lưu ý hoặc lỗi thường gặp trong chủ đề này là gì?'
        }
      ];

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px',
        backgroundColor: '#f4f9f8',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {messages.length === 0 && !isLoading ? (
        <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* System Context Status Card */}
          <div
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              borderRadius: '14px',
              padding: '14px',
              border: '1px solid #115e59',
              boxShadow: '0 8px 20px -6px rgba(15, 23, 42, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(20, 184, 166, 0.2)',
                  border: '1px solid rgba(94, 234, 212, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Cpu size={19} color="#5eead4" />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                  AI Assistant • {isAdvisorMode ? 'Cố vấn Khóa học' : 'Trợ giảng RAG'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#5eead4', fontWeight: 600 }}>
                  {isAdvisorMode
                    ? 'Đã kết nối dữ liệu Danh mục Khóa học trực tuyến'
                    : 'Đã kết nối Cơ sở tri thức Bài giảng (Vector RAG)'}
                </div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              {isAdvisorMode
                ? 'Chọn một tác vụ bên dưới hoặc nhập mục tiêu học tập của bạn để AI Assistant phân tích và đề xuất lộ trình.'
                : 'Chọn một tác vụ bên dưới hoặc đặt câu hỏi để AI Assistant trích xuất câu trả lời từ tài liệu bài giảng.'}
            </p>
          </div>

          {/* Action List Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {actionItems.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onQuickPrompt(item.prompt)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '11px 12px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #ccfbf1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  boxShadow: '0 2px 5px rgba(15, 23, 42, 0.04)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '9px',
                      backgroundColor: '#f0fdfa',
                      border: '1px solid #99f6e4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: '2px'
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.71rem',
                        color: '#64748b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>
                <ArrowRight size={15} color="#0d9488" style={{ flexShrink: 0 }} />
              </button>
            ))}
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
