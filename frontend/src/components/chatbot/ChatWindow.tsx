import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, RefreshCw, LogIn, Sparkles } from 'lucide-react';
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

  // Sync activeConversationId when storageKey changes (e.g. switching between courses or advisor mode)
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    const parsed = saved ? Number(saved) : NaN;
    setActiveConversationId(Number.isInteger(parsed) && parsed > 0 ? parsed : null);
  }, [storageKey]);

  // Persist activeConversationId to localStorage
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
          'Không thể nhận phản hồi từ Trợ lý AI. Vui lòng thử lại.'
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
        `Đã lập chỉ mục ${report.indexedLessons}/${report.totalLessons} bài học (${report.totalChunks} đoạn kiến thức).`
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
      ? `Tư vấn khóa học: ${courseTitle}`
      : 'Tư vấn chọn khóa học & Lộ trình học tập'
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
            width: isExpanded ? '680px' : '410px',
            maxWidth: 'calc(100vw - 32px)',
            height: isExpanded ? '680px' : '560px',
            maxHeight: 'calc(100vh - 110px)',
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.28)',
            border: '1px solid #cbd5e1',
            zIndex: 1050,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.2s ease, height 0.2s ease'
          }}
        >
          <ChatHeader
            courseTitle={displayHeaderSubtitle}
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
                backgroundColor: '#f8fafc'
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <Sparkles size={28} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                Đăng nhập để sử dụng Trợ lý AI
              </h4>
              <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.55, margin: '0 0 20px' }}>
                Vui lòng đăng nhập tài khoản để được <strong>Trợ lý AI (Gemini RAG)</strong> tư vấn lộ trình khóa học phù hợp hoặc giải đáp nội dung bài giảng.
              </p>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="btn btn-primary"
                style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '0.88rem' }}
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
                    backgroundColor: '#ecfdf5',
                    borderBottom: '1px solid #a7f3d0',
                    color: '#065f46',
                    padding: '8px 14px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>{statusNotice}</span>
                </div>
              )}

              {/* Error & Retry Banner */}
              {error && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    borderBottom: '1px solid #fecaca',
                    color: '#991b1b',
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
                        border: '1px solid #fca5a5',
                        color: '#b91c1c',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.73rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        flexShrink: 0
                      }}
                    >
                      <RefreshCw size={12} /> Thử lại
                    </button>
                  )}
                </div>
              )}

              {/* Body Wrapper (History Drawer + Message List) */}
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
              />
            </>
          )}
        </div>
      )}
    </>
  );
};
