export interface AiSourceReference {
  course_id?: number;
  lesson_id: number;
  lesson_order?: number | null;
  title: string;
  category?: string;
  instructor?: string;
  similarity?: number;
}

export interface AiMessage {
  id: number;
  conversation_id: number;
  sender: 'USER' | 'AI';
  content: string;
  sources?: AiSourceReference[];
  created_at: string;
}

export interface AiConversation {
  id: number;
  user_id: number;
  course_id: number | null;
  title: string;
  course_title?: string;
  message_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AiChatResponse {
  conversation: AiConversation;
  userMessage: AiMessage;
  aiMessage: AiMessage;
  answer: string;
  sources: AiSourceReference[];
}

export interface AiConversationDetailResponse {
  conversation: AiConversation;
  messages: AiMessage[];
}

export interface AiCourseIndexReport {
  courseId: number;
  courseTitle: string;
  totalLessons: number;
  indexedLessons: number;
  skippedEmptyLessons: number;
  totalChunks: number;
  newlyEmbeddedChunks: number;
  reusedUnchangedChunks: number;
  failures: Array<{
    lessonId: number;
    lessonTitle: string;
    chunkIndex: number;
    error: string;
  }>;
}

