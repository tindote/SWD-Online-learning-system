export interface AppNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean | number;
  created_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: AppNotification[];
  unreadCount: number;
}
