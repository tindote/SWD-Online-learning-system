import React from 'react';
import { BookOpen, ExternalLink, Compass, User, ArrowUpRight } from 'lucide-react';
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
          borderTop: '1px solid #ccfbf1'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.73rem',
            fontWeight: 800,
            color: '#0f766e',
            marginBottom: '8px'
          }}
        >
          <Compass size={14} color="#0d9488" />
          <span>KHÓA HỌC ĐỀ XUẤT (BẤM ĐỂ MỞ TRANG KHÓA HỌC):</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
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
                  padding: '9px 11px',
                  borderRadius: '10px',
                  backgroundColor: '#f0fdfa',
                  border: '1px solid #99f6e4',
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
                      color: '#0f172a',
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
                      color: '#475569'
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
                          borderRadius: '6px',
                          fontWeight: 700,
                          backgroundColor: isFree ? '#dcfce7' : '#ccfbf1',
                          color: isFree ? '#15803d' : '#115e59'
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
                    borderRadius: '7px',
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <ArrowUpRight size={15} />
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
        borderTop: '1px dashed #99f6e4'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#0f766e',
          marginBottom: '6px'
        }}
      >
        <BookOpen size={13} color="#0d9488" />
        <span>Tài liệu bài giảng tham chiếu:</span>
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
                padding: '4px 9px',
                borderRadius: '6px',
                backgroundColor: '#f0fdfa',
                color: '#0f766e',
                border: '1px solid #99f6e4',
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
