import apiClient from './apiClient';
import { DashboardStats, InstructorDashboardStats, StudentDashboardStats } from '../types/dashboard';
import { ApiResponse } from '../types/course';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể tải thống kê');
    }
    return response.data.data;
  },

  getInstructorStats: async (): Promise<InstructorDashboardStats> => {
    const response = await apiClient.get<ApiResponse<InstructorDashboardStats>>('/dashboard/instructor');
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể tải thống kê giảng viên');
    }
    return response.data.data;
  },

  getStudentStats: async (): Promise<StudentDashboardStats> => {
    const response = await apiClient.get<ApiResponse<StudentDashboardStats>>('/dashboard/student');
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể tải thống kê học viên');
    }
    return response.data.data;
  }
};
