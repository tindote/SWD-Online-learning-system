import apiClient from './apiClient';
import {
  AiChatResponse,
  AiConversation,
  AiConversationDetailResponse,
  AiCourseIndexReport
} from '../types/aiChat';

export const aiChatApi = {
  /**
   * Send a question to the Gemini RAG Learning Assistant or Course Advisor.
   */
  sendMessage: async (payload: {
    courseId?: number | null;
    previewCourseId?: number | null;
    conversationId?: number | null;
    message: string;
  }): Promise<AiChatResponse> => {
    const response = await apiClient.post('/ai/chat', payload);
    return response.data.data;
  },

  /**
   * Explicitly create a new conversation for a course or Course Advisor.
   */
  createConversation: async (payload: {
    courseId?: number | null;
    title?: string;
  }): Promise<AiConversation> => {
    const response = await apiClient.post('/ai/conversations', payload);
    return response.data.data;
  },

  /**
   * Get the authenticated user's conversations (optionally filtered by courseId or 'advisor').
   */
  getConversations: async (courseId?: number | 'advisor'): Promise<AiConversation[]> => {
    const params = courseId !== undefined ? { courseId } : undefined;
    const response = await apiClient.get('/ai/conversations', { params });
    return response.data.data || [];
  },

  /**
   * Get messages and metadata for a specific conversation.
   */
  getConversationById: async (conversationId: number): Promise<AiConversationDetailResponse> => {
    const response = await apiClient.get(`/ai/conversations/${conversationId}`);
    return response.data.data;
  },

  /**
   * Delete an authenticated user's conversation.
   */
  deleteConversation: async (conversationId: number): Promise<void> => {
    await apiClient.delete(`/ai/conversations/${conversationId}`);
  },

  /**
   * Trigger RAG course indexing (for course instructor or admin).
   */
  indexCourse: async (courseId: number, force = false): Promise<AiCourseIndexReport> => {
    const response = await apiClient.post(`/ai/courses/${courseId}/index`, { force });
    return response.data.data;
  }
};

