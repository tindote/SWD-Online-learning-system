import apiClient from './apiClient';
import { Course, CourseFormData, CourseFilterParams, ApiResponse } from '../types/course';

export const courseApi = {
  // Get all courses with optional filters (search, category, isFree, sortBy, etc.)
  getCourses: async (params?: CourseFilterParams): Promise<Course[]> => {
    const response = await apiClient.get<ApiResponse<Course[]>>('/courses', { params });
    return response.data.data || [];
  },

  // Get courses created by the current instructor
  getMyInstructorCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get<ApiResponse<Course[]>>('/courses/instructor/my-courses');
    return response.data.data || [];
  },

  // Get course by ID (includes curriculum lessons, reviews, enrollment status)
  getCourseById: async (id: number): Promise<Course> => {
    const response = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không tìm thấy khóa học');
    }
    return response.data.data;
  },

  // Create course
  createCourse: async (data: CourseFormData): Promise<Course> => {
    const response = await apiClient.post<ApiResponse<Course>>('/courses', {
      ...data,
      price: Number(data.price)
    });
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể tạo khóa học');
    }
    return response.data.data;
  },

  // Update course
  updateCourse: async (id: number, data: CourseFormData): Promise<Course> => {
    const response = await apiClient.put<ApiResponse<Course>>(`/courses/${id}`, {
      ...data,
      price: Number(data.price)
    });
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể cập nhật khóa học');
    }
    return response.data.data;
  },

  // Delete course
  deleteCourse: async (id: number): Promise<void> => {
    await apiClient.delete(`/courses/${id}`);
  }
};
