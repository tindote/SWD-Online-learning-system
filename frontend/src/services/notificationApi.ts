import apiClient from './apiClient';
import { NotificationsResponse } from '../types/notification';

export const notificationApi = {
  getNotifications: async (): Promise<NotificationsResponse> => {
    const response = await apiClient.get<NotificationsResponse>('/notifications');
    return response.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  }
};
