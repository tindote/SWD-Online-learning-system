import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, RefreshCw, LogIn, Flower2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { aiChatApi } from '../../services/aiChatApi';
import { AiConversation, AiMessage } from '../../types/aiChat';
import { ChatbotButton } from './ChatbotButton';
import { ChatHeader } from './ChatHeader';
import { ConversationHistory } from './ConversationHistory';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

interface ChatWindowProps {
  courseId?: number | null;
  previewCourseId?: number | null;
  courseTitle?: string;
  currentLessonTitle?: string;
  canIndexCourse?: boolean;
  onSelectLesson?: (lessonId: number) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  courseId = null,
  previewCourseId = null,
  courseTitle,
  currentLessonTitle,
  canIndexCourse = false,
  onSelectLesson
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isAdvisorMode = !courseId || courseId <= 0;
  const scopeKey = isAdvisorMode ? 'advisor' : `course_${courseId}`;

  const storageKey = user
    ? `ai_active_conv_${user.id}_${scopeKey}`
    : `ai_active_conv_guest_${scopeKey}`;

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(() => {
    const saved = localStorage.getItem(storageKey);
    const parsed = saved ? Number(saved) : NaN;
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  });

  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [indexing, setIndexing] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [lastFailedQuestion, setLastFailedQuestion] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    const parsed = saved ? Number(saved) : NaN;
    setActiveConversationId(Number.isInteger(parsed) && parsed > 0 ? parsed : null);
  }, [storageKey]);

  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem(storageKey, String(activeConversationId));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [activeConversationId, storageKey]);

  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingHistory(true);
    try {
      const list = await aiChatApi.getConversations(isAdvisorMode ? 'advisor' : courseId!);
      setConversations(list);

      if (list.length > 0) {
        setActiveConversationId((prev) => {
          if (prev && list.some((c) => c.id === prev)) {
            return prev;
          }
          return list[0].id;
        });
      } else {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (err: any) {
      console.error('Failed to load AI conversations:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [isAuthenticated, isAdvisorMode, courseId]);

  const loadConversationMessages = useCallback(async (conversationId: number) => {
    setLoadingMessages(true);
    setError(null);
    try {
      const detail = await aiChatApi.getConversationById(conversationId);
      setMessages(detail.messages || []);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setActiveConversationId(null);
        setMessages([]);
      } else {
        setError(err.response?.data?.message || err.message || 'Không thể tải nội dung cuộc trò chuyện');
      }
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadConversations();
    }
  }, [isOpen, isAuthenticated, loadConversations]);

  useEffect(() => {
    if (isOpen && isAuthenticated && activeConversationId) {
      loadConversationMessages(activeConversationId);
    } else if (!activeConversationId) {
      setMessages([]);
    }
  }, [isOpen, isAuthenticated, activeConversationId, loadConversationMessages]);

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setError(null);
    setLastFailedQuestion(null);
  };

  const handleSelectConversation = (conversationId: number) => {
    setActiveConversationId(conversationId);
    setError(null);
    setLastFailedQuestion(null);
  };

  const handleDeleteConversation = async (conversationId: number) => {
    try {
      await aiChatApi.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể xóa cuộc trò chuyện');
    }
  };

  const handleSendMessage = async (questionText: string) => {
    if (!questionText.trim() || sending) return;

    const trimmed = questionText.trim();
    setSending(true);
    setError(null);
    setLastFailedQuestion(null);
    if (showHistory) setShowHistory(false);

    const tempUserMsg: AiMessage = {
      id: Date.now(),
      conversation_id: activeConversationId || 0,
      sender: 'USER',
      content: trimmed,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const result = await aiChatApi.sendMessage({
        courseId: isAdvisorMode ? null : courseId,
        previewCourseId: isAdvisorMode ? previewCourseId : undefined,
        conversationId: activeConversationId,
        message: trimmed
      });

      setActiveConversationId(result.conversation.id);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        result.userMessage,
        result.aiMessage
      ]);

      setConversations((prev) => {
        const exists = prev.some((c) => c.id === result.conversation.id);
        if (exists) {
          return [
            result.conversation,
            ...prev.filter((c) => c.id !== result.conversation.id)
          ];
        }
        return [result.conversation, ...prev];
      });
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      setLastFailedQuestion(trimmed);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Sakura chưa thể phản hồi ngay lúc này. Bạn thử lại giúp mình nhé!'
      );
    } finally {
      setSending(false);
    }
  };

  const handleIndexCourse = async () => {
    if (indexing || !courseId) return;
    setIndexing(true);
    setError(null);
    setStatusNotice(null);
    try {
      const report = await aiChatApi.indexCourse(courseId, false);
      setStatusNotice(
        `Đã nạp ${report.indexedLessons}/${report.totalLessons} bài học (${report.totalChunks} đoạn kiến thức) cho Sakura AI.`
      );
      setTimeout(() => setStatusNotice(null), 6000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Không thể lập chỉ mục RAG cho khóa học này.'
      );
    } finally {
      setIndexing(false);
    }
  };

  const displayHeaderSubtitle = isAdvisorMode
    ? courseTitle
      ? `Đang tư vấn: ${courseTitle}`
      : 'Tư vấn lộ trình & Chọn khóa học phù hợp'
    : courseTitle;

  return (
    <>
      <ChatbotButton
        isOpen={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        courseTitle={displayHeaderSubtitle}
      />

      {isOpen && (
        <div
          className="ai-chat-window"
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '24px',
            width: isExpanded ? '690px' : '420px',
            maxWidth: 'calc(100vw - 32px)',
            height: isExpanded ? '690px' : '580px',
            maxHeight: 'calc(100vh - 108px)',
            backgroundColor: '#fffafb',
            borderRadius: '24px',
            boxShadow: '0 24px 54px -12px rgba(190, 24, 93, 0.28), 0 0 0 1px rgba(244, 114, 182, 0.35)',
            border: '1.5px solid #f9a8d4',
            zIndex: 1050,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.2s ease, height 0.2s ease'
          }}
        >
          <ChatHeader
            courseTitle={displayHeaderSubtitle}
            conversationCount={conversations.length}
            showHistory={showHistory}
            isExpanded={isExpanded}
            canIndexCourse={!isAdvisorMode && canIndexCourse}
            isIndexing={indexing}
            onToggleHistory={() => setShowHistory((prev) => !prev)}
            onNewConversation={handleNewConversation}
            onToggleExpand={() => setIsExpanded((prev) => !prev)}
            onIndexCourse={!isAdvisorMode && canIndexCourse ? handleIndexCourse : undefined}
            onClose={() => setIsOpen(false)}
          />

          {!isAuthenticated ? (
            <div
              style={{
                flex: 1,
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: 'linear-gradient(180deg, #fffafb 0%, #fdf2f8 100%)'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '18px',
                  backgroundColor: '#fce7f3',
                  color: '#db2777',
                  border: '1px solid #f9a8d4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <Flower2 size={28} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#831843', margin: '0 0 8px' }}>
                Đăng nhập để trò chuyện cùng Sakura AI 🌸
              </h4>
              <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.55, margin: '0 0 20px' }}>
                Hãy đăng nhập tài khoản để <strong>Sakura AI</strong> lưu lại nhật ký tư vấn lộ trình khóa học và hỗ trợ giải đáp bài giảng cho riêng bạn nhé!
              </p>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                style={{
                  textDecoration: 'none',
                  padding: '10px 22px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 6px 16px rgba(236, 72, 153, 0.35)'
                }}
              >
                <LogIn size={16} /> Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <>
              {/* Status Notice Banner */}
              {statusNotice && (
                <div
                  style={{
                    backgroundColor: '#fdf2f8',
                    borderBottom: '1px solid #f9a8d4',
                    color: '#9d174d',
                    padding: '8px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle2 size={15} color="#db2777" />
                  <span>{statusNotice}</span>
                </div>
              )}

              {/* Error & Retry Banner */}
              {error && (
                <div
                  style={{
                    backgroundColor: '#fff1f2',
                    borderBottom: '1px solid #fecdd3',
                    color: '#9f1239',
                    padding: '9px 14px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                  {lastFailedQuestion && (
                    <button
                      type="button"
                      onClick={() => handleSendMessage(lastFailedQuestion)}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #fda4af',
                        color: '#be185d',
                        borderRadius: '999px',
                        padding: '4px 10px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        flexShrink: 0
                      }}
                    >
                      <RefreshCw size={12} /> Gửi lại
                    </button>
                  )}
                </div>
              )}

              {/* Body Wrapper (History Tab View vs Active Chat View) */}
              <div style={{ position: 'relative', flex: 1, display: 'flex', overflow: 'hidden' }}>
                {showHistory && (
                  <ConversationHistory
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    loading={loadingHistory}
                    onSelectConversation={handleSelectConversation}
                    onNewConversation={handleNewConversation}
                    onDeleteConversation={handleDeleteConversation}
                    onClosePanel={() => setShowHistory(false)}
                  />
                )}

                <MessageList
                  messages={messages}
                  isLoading={sending || loadingMessages}
                  isAdvisorMode={isAdvisorMode}
                  currentLessonTitle={currentLessonTitle}
                  previewCourseTitle={isAdvisorMode ? courseTitle : undefined}
                  onQuickPrompt={handleSendMessage}
                  onSelectLesson={onSelectLesson}
                  onSelectCourse={(targetCourseId) => {
                    navigate(`/courses/${targetCourseId}`);
                  }}
                />
              </div>

              <ChatInput
                onSend={handleSendMessage}
                disabled={sending || loadingMessages}
                isAdvisorMode={isAdvisorMode}
              />
            </>
          )}
        </div>
      )}
    </>
  );
};
