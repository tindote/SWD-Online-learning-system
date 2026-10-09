import apiClient from './apiClient';
import { Enrollment, EnrollmentFormData, MyEnrollmentCourse } from '../types/enrollment';
import { ApiResponse } from '../types/course';

export const enrollmentApi = {
  getEnrollments: async (params?: { course_id?: number | string; status?: string }): Promise<Enrollment[]> => {
    const response = await apiClient.get<ApiResponse<Enrollment[]>>('/enrollments', { params });
    return response.data.data || [];
  },

  // Student specific: My enrolled courses with progress
  getMyEnrollments: async (): Promise<MyEnrollmentCourse[]> => {
    const response = await apiClient.get<ApiResponse<MyEnrollmentCourse[]>>('/enrollments/my-enrollments');
    return response.data.data || [];
  },

  // Student self-enrollment
  enrollInCourse: async (courseId: number): Promise<Enrollment> => {
    const response = await apiClient.post<ApiResponse<Enrollment>>('/enrollments/enroll', {
      course_id: courseId
    });
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể đăng ký khóa học');
    }
    return response.data.data;
  },

  getEnrollmentById: async (id: number): Promise<Enrollment> => {
    const response = await apiClient.get<ApiResponse<Enrollment>>(`/enrollments/${id}`);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không tìm thấy bản ghi đăng ký');
    }
    return response.data.data;
  },

  createEnrollment: async (data: EnrollmentFormData): Promise<Enrollment> => {
    const response = await apiClient.post<ApiResponse<Enrollment>>('/enrollments', {
      ...data,
      user_id: Number(data.user_id),
      course_id: Number(data.course_id)
    });
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể tạo bản ghi đăng ký');
    }
    return response.data.data;
  },

  updateEnrollment: async (id: number, data: EnrollmentFormData): Promise<Enrollment> => {
    const response = await apiClient.put<ApiResponse<Enrollment>>(`/enrollments/${id}`, {
      ...data,
      user_id: Number(data.user_id),
      course_id: Number(data.course_id)
    });
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể cập nhật bản ghi đăng ký');
    }
    return response.data.data;
  },

  deleteEnrollment: async (id: number): Promise<void> => {
    await apiClient.delete(`/enrollments/${id}`);
  }
};
