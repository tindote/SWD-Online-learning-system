import apiClient from './apiClient';
import { Lesson, LessonFormData } from '../types/lesson';
import { ApiResponse } from '../types/course';

export const lessonApi = {
  getLessons: async (params?: { course_id?: number | string }): Promise<Lesson[]> => {
    const response = await apiClient.get<ApiResponse<Lesson[]>>('/lessons', { params });
    return response.data.data || [];
  },

  getLessonById: async (id: number): Promise<Lesson> => {
    const response = await apiClient.get<ApiResponse<Lesson>>(`/lessons/${id}`);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không tìm thấy bài học');
    }
    return response.data.data;
  },

  createLesson: async (data: LessonFormData): Promise<Lesson> => {
    const response = await apiClient.post<ApiResponse<Lesson>>('/lessons', {
      ...data,
      course_id: Number(data.course_id),
      lesson_order: Number(data.lesson_order)
    });
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể tạo bài học');
    }
    return response.data.data;
  },

  updateLesson: async (id: number, data: LessonFormData): Promise<Lesson> => {
    const response = await apiClient.put<ApiResponse<Lesson>>(`/lessons/${id}`, {
      ...data,
      course_id: Number(data.course_id),
      lesson_order: Number(data.lesson_order)
    });
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể cập nhật bài học');
    }
    return response.data.data;
  },

  deleteLesson: async (id: number): Promise<void> => {
    await apiClient.delete(`/lessons/${id}`);
  }
};
