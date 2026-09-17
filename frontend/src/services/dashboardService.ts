// Frontend service to interact with Citizen Dashboard backend APIs

import { apiRequest } from './apiClient';
import { Scheme, EligibilityResult, ChecklistResponse, ApplicationJourney, Notification, ChatResponse } from '../types';

export const dashboardService = {
  async getSavedSchemes(): Promise<Scheme[]> {
    return await apiRequest<Scheme[]>('/api/dashboard/saved-schemes');
  },

  async getRecentViews(): Promise<Scheme[]> {
    return await apiRequest<Scheme[]>('/api/dashboard/recent-views');
  },

  async getEligibilityHistory(): Promise<EligibilityResult[]> {
    return await apiRequest<EligibilityResult[]>('/api/dashboard/eligibility-history');
  },

  async getChecklistProgress(): Promise<ChecklistResponse[]> {
    return await apiRequest<ChecklistResponse[]>('/api/dashboard/checklist-progress');
  },

  async getApplicationJourney(): Promise<ApplicationJourney[]> {
    return await apiRequest<ApplicationJourney[]>('/api/dashboard/journey');
  },

  async getUpcomingDeadlines(): Promise<Scheme[]> {
    return await apiRequest<Scheme[]>('/api/dashboard/upcoming-deadlines');
  },

  async getNotifications(): Promise<Notification[]> {
    return await apiRequest<Notification[]>('/api/dashboard/notifications');
  },

  async getUserNotifications(): Promise<Notification[]> {
    return await this.getNotifications();
  },

  async getRecentChat(): Promise<ChatResponse[]> {
    return await apiRequest<ChatResponse[]>('/api/dashboard/recent-chat');
  },

  async setLanguagePreference(language: string): Promise<{ success: boolean; message: string }> {
    return await apiRequest<{ success: boolean; message: string }>('/api/dashboard/language-preference', {
      method: 'PATCH',
      body: JSON.stringify({ language })
    });
  }
};
