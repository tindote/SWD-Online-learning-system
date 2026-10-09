import apiClient from './apiClient';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ProfileFormData,
  ChangePasswordData
} from '../types/auth';
import { User } from '../types/user';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
    return response.data.user;
  },

  updateProfile: async (data: ProfileFormData): Promise<User> => {
    const response = await apiClient.put<{ success: boolean; user: User }>('/auth/profile', data);
    return response.data.user;
  },

  changePassword: async (data: ChangePasswordData): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put<{ success: boolean; message: string }>('/auth/change-password', data);
    return response.data;
  }
};
