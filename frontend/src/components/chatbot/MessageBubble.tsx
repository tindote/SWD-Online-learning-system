import React from 'react';
import { Flower2, User } from 'lucide-react';
import { AiMessage } from '../../types/aiChat';
import { SourceReference } from './SourceReference';

interface MessageBubbleProps {
  message: AiMessage;
  onSelectLesson?: (lessonId: number) => void;
  onSelectCourse?: (courseId: number) => void;
}

/**
 * Parses inline markdown (**bold** and `code`) into React nodes with Sakura styling.
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
            color: isUser ? '#ffffff' : '#831843'
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
            backgroundColor: isUser ? 'rgba(255,255,255,0.22)' : '#fdf2f8',
            color: isUser ? '#ffffff' : '#be185d',
            padding: '1px 6px',
            borderRadius: '6px',
            fontSize: '0.79rem',
            fontFamily: 'Consolas, Monaco, monospace',
            border: isUser ? 'none' : '1px solid #fbcfe8'
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
 * Renders structured Markdown into Sakura-themed UI blocks inside the chat bubble.
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
            backgroundColor: '#2e1022',
            color: '#fce7f3',
            padding: '10px 12px',
            borderRadius: '12px',
            overflowX: 'auto',
            fontSize: '0.78rem',
            fontFamily: 'Consolas, Monaco, monospace',
            margin: '8px 0',
            lineHeight: 1.5,
            border: '1px solid #831843'
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
              borderTop: '1px dashed #fbcfe8',
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
              padding: '7px 11px',
              background: 'linear-gradient(90deg, #fdf2f8 0%, #fff5f8 100%)',
              borderLeft: '3.5px solid #ec4899',
              borderRadius: '0 10px 10px 0',
              fontSize: '0.86rem',
              fontWeight: 800,
              color: '#9d174d'
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
              marginBottom: '5px',
              paddingLeft: '4px'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#ec4899',
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
                borderRadius: '999px',
                backgroundColor: '#fce7f3',
                color: '#db2777',
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
            <div style={{ flex: 1, fontWeight: 600, color: '#831843' }}>
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
        gap: '9px',
        marginBottom: '14px'
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '12px',
          background: isUser
            ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'
            : 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
          color: isUser ? '#ffffff' : '#db2777',
          border: isUser ? 'none' : '1px solid #f9a8d4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '2px',
          boxShadow: '0 2px 6px rgba(236, 72, 153, 0.15)'
        }}
      >
        {isUser ? <User size={15} /> : <Flower2 size={17} />}
      </div>

      {/* Bubble Content */}
      <div
        style={{
          maxWidth: '86%',
          background: isUser
            ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'
            : '#ffffff',
          color: isUser ? '#ffffff' : '#334155',
          border: isUser ? 'none' : '1px solid #fbcfe8',
          borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
          padding: '12px 15px',
          boxShadow: isUser
            ? '0 4px 12px rgba(236, 72, 153, 0.25)'
            : '0 4px 14px rgba(236, 72, 153, 0.07)',
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
              borderBottom: '1px solid #fdf2f8'
            }}
          >
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#db2777',
                letterSpacing: '0.01em'
              }}
            >
              🌸 Sakura AI
            </span>
            <span style={{ fontSize: '0.65rem', color: '#f472b6' }}>
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
              fontSize: '0.66rem',
              color: '#ffe4e6',
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
