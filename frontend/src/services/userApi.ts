import apiClient from './apiClient';
import { User, UserFormData } from '../types/user';
import { ApiResponse } from '../types/course';

export const userApi = {
  getUsers: async (params?: { role?: string; search?: string }): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>('/users', { params });
    return response.data.data || [];
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không tìm thấy người dùng');
    }
    return response.data.data;
  },

  createUser: async (data: UserFormData): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể tạo người dùng');
    }
    return response.data.data;
  },

  updateUser: async (id: number, data: UserFormData): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể cập nhật người dùng');
    }
    return response.data.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  }
};
