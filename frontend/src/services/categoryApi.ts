import apiClient from './apiClient';
import { Category, CategoryFormData } from '../types/category';
import { ApiResponse } from '../types/course';

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data.data || [];
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không tìm thấy danh mục');
    }
    return response.data.data;
  },

  createCategory: async (data: CategoryFormData): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể tạo danh mục');
    }
    return response.data.data;
  },

  updateCategory: async (id: number, data: CategoryFormData): Promise<Category> => {
    const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể cập nhật danh mục');
    }
    return response.data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  }
};
