import apiClient from './apiClient';
import { Submission, SubmissionFormData, GradingFormData } from '../types/submission';
import { ApiResponse } from '../types/course';

export const submissionApi = {
  getSubmissions: async (params?: { assignment_id?: number | string; my_submissions?: string }): Promise<Submission[]> => {
    const response = await apiClient.get<ApiResponse<Submission[]>>('/submissions', { params });
    return response.data.data || [];
  },

  getSubmissionById: async (id: number): Promise<Submission> => {
    const response = await apiClient.get<ApiResponse<Submission>>(`/submissions/${id}`);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không tìm thấy bài nộp');
    }
    return response.data.data;
  },

  createSubmission: async (data: SubmissionFormData): Promise<Submission> => {
    const response = await apiClient.post<ApiResponse<Submission>>('/submissions', {
      ...data,
      assignment_id: Number(data.assignment_id)
    });
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể gửi bài nộp');
    }
    return response.data.data;
  },

  updateSubmission: async (id: number, data: Partial<SubmissionFormData>): Promise<Submission> => {
    const response = await apiClient.put<ApiResponse<Submission>>(`/submissions/${id}`, data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể cập nhật bài nộp');
    }
    return response.data.data;
  },

  gradeSubmission: async (id: number, grading: GradingFormData): Promise<Submission> => {
    const response = await apiClient.put<ApiResponse<Submission>>(`/submissions/${id}`, {
      grade: Number(grading.grade),
      feedback: grading.feedback || null
    });
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể cập nhật chấm điểm');
    }
    return response.data.data;
  },

  deleteSubmission: async (id: number): Promise<void> => {
    await apiClient.delete(`/submissions/${id}`);
  }
};
