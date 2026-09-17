import { apiRequest } from './apiClient';
import {
  Notification,
  NotificationUnreadCountResponse,
  NotificationMarkReadResponse
} from '../types';

export const notificationService = {
  async getNotifications(unreadOnly: boolean = false, limit: number = 50): Promise<Notification[]> {
    const params = new URLSearchParams();
    if (unreadOnly) params.append('unread_only', 'true');
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest<Notification[]>(`/api/notifications${queryString}`);
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiRequest<NotificationUnreadCountResponse>('/api/notifications/unread-count');
    return res.unread_count ?? 0;
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    const res = await apiRequest<NotificationMarkReadResponse>(
      `/api/notifications/${notificationId}/read`,
      { method: 'PATCH' }
    );
    return res.success;
  },

  async markAllAsRead(): Promise<number> {
    const res = await apiRequest<NotificationMarkReadResponse>(
      '/api/notifications/mark-all-read',
      { method: 'POST' }
    );
    return res.updated_count ?? 0;
  },

  async deleteNotification(notificationId: string): Promise<boolean> {
    const res = await apiRequest<NotificationMarkReadResponse>(
      `/api/notifications/${notificationId}`,
      { method: 'DELETE' }
    );
    return res.success;
  }
};
