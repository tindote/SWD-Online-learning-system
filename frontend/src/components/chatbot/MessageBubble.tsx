import React from 'react';
import { Bot, User } from 'lucide-react';
import { AiMessage } from '../../types/aiChat';
import { SourceReference } from './SourceReference';

interface MessageBubbleProps {
  message: AiMessage;
  onSelectLesson?: (lessonId: number) => void;
  onSelectCourse?: (courseId: number) => void;
}

/**
 * Parses inline markdown (**bold** and `code`) into React nodes.
 */
const renderInlineMarkdown = (text: string, isUser: boolean): React.ReactNode[] => {
  const cleaned = text.replace(/\[Mã KH\s*#\d+\]\s*/gi, '');
  const tokens = cleaned.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong
          key={idx}
          style={{
            fontWeight: 700,
            color: isUser ? '#ffffff' : '#0f172a'
          }}
        >
          {token.slice(2, -2)}
        </strong>
      );
    }

    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          style={{
            backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
            color: isUser ? '#ffffff' : '#4338ca',
            padding: '1px 6px',
            borderRadius: '5px',
            fontSize: '0.8rem',
            fontFamily: 'Consolas, Monaco, monospace',
            border: isUser ? 'none' : '1px solid #e2e8f0'
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
};

/**
 * Renders structured Markdown (headings, bullet lists, numbered lists, code blocks, dividers)
 * into clean, readable UI blocks inside the chat bubble.
 */
const renderFormattedContent = (rawContent: string, isUser: boolean): React.ReactNode => {
  if (isUser) {
    return <div style={{ whiteSpace: 'pre-wrap' }}>{rawContent}</div>;
  }

  const blocks = rawContent.split(/(```[\s\S]*?```)/g);

  return blocks.map((block, blockIdx) => {
    // Code block
    if (block.startsWith('```') && block.endsWith('```')) {
      const lines = block.slice(3, -3).trim().split('\n');
      const firstLine = lines[0]?.trim() || '';
      const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
      const codeContent = hasLang ? lines.slice(1).join('\n') : lines.join('\n');

      return (
        <pre
          key={blockIdx}
          style={{
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            padding: '10px 12px',
            borderRadius: '10px',
            overflowX: 'auto',
            fontSize: '0.78rem',
            fontFamily: 'Consolas, Monaco, monospace',
            margin: '8px 0',
            lineHeight: 1.5
          }}
        >
          <code>{codeContent}</code>
        </pre>
      );
    }

    const lines = block.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((rawLine, lineIdx) => {
      const line = rawLine.trim();

      if (!line) {
        elements.push(<div key={`sp-${lineIdx}`} style={{ height: '6px' }} />);
        return;
      }

      // Horizontal rule
      if (/^[-*_]{3,}$/.test(line)) {
        elements.push(
          <hr
            key={`hr-${lineIdx}`}
            style={{
              border: 'none',
              borderTop: '1px solid #e2e8f0',
              margin: '10px 0'
            }}
          />
        );
        return;
      }

      // Headings (#, ##, ###)
      const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
      if (headingMatch) {
        const headingText = headingMatch[2].replace(/^\*\*|\*\*$/g, '');
        elements.push(
          <div
            key={`h-${lineIdx}`}
            style={{
              marginTop: lineIdx > 0 ? '10px' : '2px',
              marginBottom: '6px',
              padding: '6px 10px',
              backgroundColor: '#f8fafc',
              borderLeft: '3px solid #4f46e5',
              borderRadius: '0 8px 8px 0',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#1e1b4b'
            }}
          >
            {renderInlineMarkdown(headingText, false)}
          </div>
        );
        return;
      }

      // Bullet list (* or - or •)
      const bulletMatch = line.match(/^([*\-•])\s+(.*)$/);
      if (bulletMatch) {
        elements.push(
          <div
            key={`ul-${lineIdx}`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              marginBottom: '4px',
              paddingLeft: '4px'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#6366f1',
                marginTop: '7px',
                flexShrink: 0
              }}
            />
            <div style={{ flex: 1 }}>{renderInlineMarkdown(bulletMatch[2], false)}</div>
          </div>
        );
        return;
      }

      // Numbered list (1. 2. ...)
      const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        elements.push(
          <div
            key={`ol-${lineIdx}`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              marginTop: '6px',
              marginBottom: '4px'
            }}
          >
            <span
              style={{
                minWidth: '20px',
                height: '20px',
                borderRadius: '6px',
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                fontSize: '0.73rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px'
              }}
            >
              {numMatch[1]}
            </span>
            <div style={{ flex: 1, fontWeight: 600, color: '#0f172a' }}>
              {renderInlineMarkdown(numMatch[2], false)}
            </div>
          </div>
        );
        return;
      }

      // Normal paragraph line
      elements.push(
        <p key={`p-${lineIdx}`} style={{ margin: '0 0 4px' }}>
          {renderInlineMarkdown(line, false)}
        </p>
      );
    });

    return <React.Fragment key={blockIdx}>{elements}</React.Fragment>;
  });
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onSelectLesson,
  onSelectCourse
}) => {
  const isUser = message.sender === 'USER';

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: '10px',
        marginBottom: '14px'
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: isUser ? '#4f46e5' : '#eef2ff',
          color: isUser ? '#ffffff' : '#4f46e5',
          border: isUser ? 'none' : '1px solid #c7d2fe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '2px'
        }}
      >
        {isUser ? <User size={15} /> : <Bot size={16} />}
      </div>

      {/* Bubble Content */}
      <div
        style={{
          maxWidth: '85%',
          backgroundColor: isUser ? '#4f46e5' : '#ffffff',
          color: isUser ? '#ffffff' : '#1e293b',
          border: isUser ? 'none' : '1px solid #e2e8f0',
          borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          padding: '12px 14px',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.05)',
          fontSize: '0.85rem',
          lineHeight: 1.6,
          wordBreak: 'break-word'
        }}
      >
        <div>{renderFormattedContent(message.content, isUser)}</div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceReference
            sources={message.sources}
            onSelectLesson={onSelectLesson}
            onSelectCourse={onSelectCourse}
          />
        )}

        <div
          style={{
            marginTop: '6px',
            fontSize: '0.67rem',
            color: isUser ? '#c7d2fe' : '#94a3b8',
            textAlign: isUser ? 'right' : 'left'
          }}
        >
          {formatTime(message.created_at)}
        </div>
      </div>
    </div>
  );
};
