import apiClient from './apiClient';
import { CourseLearningData, ToggleProgressResponse } from '../types/progress';
import { ApiResponse } from '../types/course';

export const learningApi = {
  getCourseLearning: async (courseId: number): Promise<CourseLearningData> => {
    const response = await apiClient.get<ApiResponse<CourseLearningData>>(`/progress/${courseId}`);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể tải dữ liệu bài học');
    }
    return response.data.data;
  },

  toggleLessonProgress: async (courseId: number, lessonId: number): Promise<ToggleProgressResponse['data']> => {
    const response = await apiClient.post<ToggleProgressResponse>('/progress/toggle', {
      courseId,
      lessonId
    });
    return response.data.data;
  }
};
