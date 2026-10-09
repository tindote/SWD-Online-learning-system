import apiClient from './apiClient';
import { CourseReviewsData, CreateReviewData } from '../types/review';
import { ApiResponse } from '../types/course';

export const reviewApi = {
  getCourseReviews: async (courseId: number): Promise<CourseReviewsData> => {
    const response = await apiClient.get<ApiResponse<CourseReviewsData>>(`/reviews/course/${courseId}`);
    return response.data.data || { reviews: [], averageRating: 0, count: 0 };
  },

  createReview: async (data: CreateReviewData): Promise<void> => {
    await apiClient.post('/reviews', data);
  },

  deleteReview: async (id: number): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  }
};
