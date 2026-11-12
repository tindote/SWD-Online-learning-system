import React from 'react';
import { BookOpen, ExternalLink, GraduationCap, User, ArrowRight } from 'lucide-react';
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
          borderTop: '1px solid #e2e8f0'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#4338ca',
            marginBottom: '8px'
          }}
        >
          <GraduationCap size={14} color="#4f46e5" />
          <span>Khóa học đề xuất (Bấm để xem chi tiết):</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {sources.map((src, idx) => {
            const isFree = src.category?.toLowerCase().includes('miễn phí') || src.title.toLowerCase().includes('miễn phí');
            return (
              <button
                key={`${src.course_id || idx}`}
                type="button"
                onClick={() => src.course_id && onSelectCourse && onSelectCourse(src.course_id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '9px 11px',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  cursor: onSelectCourse ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#1e1b4b',
                      marginBottom: '3px',
                      lineHeight: 1.35
                    }}
                  >
                    {src.title}
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
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <User size={11} /> {src.instructor}
                      </span>
                    )}
                    {src.category && (
                      <span
                        style={{
                          padding: '1px 7px',
                          borderRadius: '999px',
                          fontWeight: 600,
                          backgroundColor: isFree ? '#dcfce7' : '#eef2ff',
                          color: isFree ? '#15803d' : '#4338ca'
                        }}
                      >
                        {src.category}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <ArrowRight size={14} />
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
        borderTop: '1px dashed #cbd5e1'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.73rem',
          fontWeight: 700,
          color: '#475569',
          marginBottom: '6px'
        }}
      >
        <BookOpen size={13} color="#4f46e5" />
        <span>Nguồn bài học tham chiếu (RAG):</span>
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
                fontSize: '0.73rem',
                fontWeight: 600,
                padding: '4px 9px',
                borderRadius: '6px',
                backgroundColor: '#eef2ff',
                color: '#4338ca',
                border: '1px solid #c7d2fe',
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
                  maxWidth: '240px'
                }}
              >
                {label}
              </span>
              {onSelectLesson && <ExternalLink size={11} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
