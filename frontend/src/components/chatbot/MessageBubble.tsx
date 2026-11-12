import React from 'react';
import { Cpu, User } from 'lucide-react';
import { AiMessage } from '../../types/aiChat';
import { SourceReference } from './SourceReference';

interface MessageBubbleProps {
  message: AiMessage;
  onSelectLesson?: (lessonId: number) => void;
  onSelectCourse?: (courseId: number) => void;
}

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
            backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : '#f0fdfa',
            color: isUser ? '#ffffff' : '#0f766e',
            padding: '1px 6px',
            borderRadius: '5px',
            fontSize: '0.79rem',
            fontFamily: 'Consolas, Monaco, monospace',
            border: isUser ? 'none' : '1px solid #99f6e4'
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
};

const renderFormattedContent = (rawContent: string, isUser: boolean): React.ReactNode => {
  if (isUser) {
    return <div style={{ whiteSpace: 'pre-wrap' }}>{rawContent}</div>;
  }

  const blocks = rawContent.split(/(```[\s\S]*?```)/g);

  return blocks.map((block, blockIdx) => {
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
            color: '#ccfbf1',
            padding: '10px 12px',
            borderRadius: '10px',
            overflowX: 'auto',
            fontSize: '0.78rem',
            fontFamily: 'Consolas, Monaco, monospace',
            margin: '8px 0',
            lineHeight: 1.5,
            border: '1px solid #115e59'
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

      if (/^[-*_]{3,}$/.test(line)) {
        elements.push(
          <hr
            key={`hr-${lineIdx}`}
            style={{
              border: 'none',
              borderTop: '1px solid #ccfbf1',
              margin: '10px 0'
            }}
          />
        );
        return;
      }

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
              backgroundColor: '#f0fdfa',
              borderLeft: '3.5px solid #0d9488',
              borderRadius: '0 8px 8px 0',
              fontSize: '0.86rem',
              fontWeight: 800,
              color: '#134e4a'
            }}
          >
            {renderInlineMarkdown(headingText, false)}
          </div>
        );
        return;
      }

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
                borderRadius: '2px',
                backgroundColor: '#0d9488',
                marginTop: '7px',
                flexShrink: 0
              }}
            />
            <div style={{ flex: 1 }}>{renderInlineMarkdown(bulletMatch[2], false)}</div>
          </div>
        );
        return;
      }

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
                backgroundColor: '#ccfbf1',
                color: '#0f766e',
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px'
              }}
            >
              {numMatch[1]}
            </span>
            <div style={{ flex: 1, fontWeight: 700, color: '#0f172a' }}>
              {renderInlineMarkdown(numMatch[2], false)}
            </div>
          </div>
        );
        return;
      }

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
        gap: '9px',
        marginBottom: '14px'
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '9px',
          backgroundColor: isUser ? '#0d9488' : '#0f172a',
          color: isUser ? '#ffffff' : '#5eead4',
          border: isUser ? 'none' : '1px solid #0f766e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '2px'
        }}
      >
        {isUser ? <User size={15} /> : <Cpu size={15} />}
      </div>

      {/* Bubble Content */}
      <div
        style={{
          maxWidth: '86%',
          background: isUser
            ? 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)'
            : '#ffffff',
          color: isUser ? '#ffffff' : '#1e293b',
          border: isUser ? 'none' : '1px solid #cbd5e1',
          borderLeft: isUser ? 'none' : '4px solid #0d9488',
          borderRadius: isUser ? '14px 14px 3px 14px' : '6px 14px 14px 6px',
          padding: '11px 14px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
          fontSize: '0.84rem',
          lineHeight: 1.6,
          wordBreak: 'break-word'
        }}
      >
        {!isUser && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
              paddingBottom: '4px',
              borderBottom: '1px solid #f1f5f9'
            }}
          >
            <span
              style={{
                fontSize: '0.69rem',
                fontWeight: 800,
                color: '#0f766e',
                textTransform: 'uppercase',
                letterSpacing: '0.03em'
              }}
            >
              AI Assistant
            </span>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
              {formatTime(message.created_at)}
            </span>
          </div>
        )}

        <div>{renderFormattedContent(message.content, isUser)}</div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceReference
            sources={message.sources}
            onSelectLesson={onSelectLesson}
            onSelectCourse={onSelectCourse}
          />
        )}

        {isUser && (
          <div
            style={{
              marginTop: '4px',
              fontSize: '0.65rem',
              color: '#ccfbf1',
              textAlign: 'right'
            }}
          >
            {formatTime(message.created_at)}
          </div>
        )}
      </div>
    </div>
  );
};
