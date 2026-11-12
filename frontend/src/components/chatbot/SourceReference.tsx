import React from 'react';
import { BookOpen, ExternalLink, Sparkles, User, ArrowRight } from 'lucide-react';
import { AiSourceReference } from '../../types/aiChat';

interface SourceReferenceProps {
  sources?: AiSourceReference[];
  onSelectLesson?: (lessonId: number) => void;
  onSelectCourse?: (courseId: number) => void;
}

export const SourceReference: React.FC<SourceReferenceProps> = ({
  sources,
  onSelectLesson,
  onSelectCourse
}) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  const isCourseRecommendation = sources.some(
    (s) => s.course_id && (!s.lesson_id || s.lesson_id === 0)
  );

  if (isCourseRecommendation) {
    return (
      <div
        style={{
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px dashed #fbcfe8'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.74rem',
            fontWeight: 800,
            color: '#be185d',
            marginBottom: '8px'
          }}
        >
          <Sparkles size={14} color="#ec4899" />
          <span>Khóa học Sakura gợi ý cho bạn (Chạm để mở):</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sources.map((src, idx) => {
            const isFree =
              src.category?.toLowerCase().includes('miễn phí') ||
              src.title.toLowerCase().includes('miễn phí');
            return (
              <button
                key={`${src.course_id || idx}`}
                type="button"
                onClick={() => src.course_id && onSelectCourse && onSelectCourse(src.course_id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #fff5f8 0%, #fdf2f8 100%)',
                  border: '1px solid #f9a8d4',
                  cursor: onSelectCourse ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 6px rgba(236, 72, 153, 0.08)'
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      color: '#831843',
                      marginBottom: '4px',
                      lineHeight: 1.35
                    }}
                  >
                    🌸 {src.title}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.7rem',
                      color: '#64748b'
                    }}
                  >
                    {src.instructor && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#9d174d' }}>
                        <User size={11} /> {src.instructor}
                      </span>
                    )}
                    {src.category && (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontWeight: 700,
                          backgroundColor: isFree ? '#dcfce7' : '#fce7f3',
                          color: isFree ? '#15803d' : '#be185d',
                          border: isFree ? '1px solid #86efac' : '1px solid #f9a8d4'
                        }}
                      >
                        {src.category}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    padding: '5px 10px',
                    borderRadius: '999px',
                    backgroundColor: '#ec4899',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0
                  }}
                >
                  <span>Xem</span>
                  <ArrowRight size={12} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: '10px',
        paddingTop: '8px',
        borderTop: '1px dashed #fbcfe8'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#9d174d',
          marginBottom: '6px'
        }}
      >
        <BookOpen size={13} color="#ec4899" />
        <span>Bài giảng trích dẫn:</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {sources.map((src, idx) => {
          const label = src.lesson_order
            ? `Bài ${src.lesson_order}: ${src.title}`
            : src.title;

          return (
            <button
              key={`${src.lesson_id}-${idx}`}
              type="button"
              onClick={() => onSelectLesson && onSelectLesson(src.lesson_id)}
              title={
                src.similarity !== undefined
                  ? `${label} (Độ tương đồng: ${(src.similarity * 100).toFixed(1)}%)`
                  : label
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '999px',
                backgroundColor: '#fdf2f8',
                color: '#be185d',
                border: '1px solid #f9a8d4',
                cursor: onSelectLesson ? 'pointer' : 'default',
                textAlign: 'left',
                maxWidth: '100%'
              }}
            >
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '230px'
                }}
              >
                🌸 {label}
              </span>
              {onSelectLesson && <ExternalLink size={11} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
