import apiClient from './apiClient';
import { Assignment, AssignmentFormData } from '../types/assignment';
import { ApiResponse } from '../types/course';

export const assignmentApi = {
  getAssignments: async (params?: { course_id?: number | string; as_student?: string }): Promise<Assignment[]> => {
    const response = await apiClient.get<ApiResponse<Assignment[]>>('/assignments', { params });
    return response.data.data || [];
  },

  getAssignmentById: async (id: number): Promise<Assignment> => {
    const response = await apiClient.get<ApiResponse<Assignment>>(`/assignments/${id}`);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không tìm thấy bài tập');
    }
    return response.data.data;
  },

  createAssignment: async (data: AssignmentFormData): Promise<Assignment> => {
    const response = await apiClient.post<ApiResponse<Assignment>>('/assignments', {
      ...data,
      course_id: Number(data.course_id),
      due_date: data.due_date || null
    });
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể tạo bài tập');
    }
    return response.data.data;
  },

  updateAssignment: async (id: number, data: AssignmentFormData): Promise<Assignment> => {
    const response = await apiClient.put<ApiResponse<Assignment>>(`/assignments/${id}`, {
      ...data,
      course_id: Number(data.course_id),
      due_date: data.due_date || null
    });
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể cập nhật bài tập');
    }
    return response.data.data;
  },

  deleteAssignment: async (id: number): Promise<void> => {
    await apiClient.delete(`/assignments/${id}`);
  }
};
