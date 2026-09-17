import { apiRequest } from './apiClient';
import { ApplicationRecord } from '../types';

export interface AdminDashboardData {
  kpi: {
    total_users: number;
    active_users: number;
    total_schemes: number;
    active_schemes: number;
    total_eligibility_checks: number;
    total_ai_queries: number;
    total_applications: number;
    system_health: string;
  };
  charts: {
    eligibility_distribution: { label: string; count: number }[];
    language_distribution: { language: string; count: number }[];
    category_distribution: { category: string; count: number }[];
    top_schemes: { scheme_name: string; category: string; views: number }[];
    query_activity_trend: { date: string; queries: number }[];
  };
  recent_activity: {
    id: string;
    action: string;
    actor: string;
    resource: string;
    timestamp: string;
    status: string;
  }[];
}

export interface AdminSystemHealth {
  overall_status: string;
  timestamp: string;
  services: {
    name: string;
    status: string;
    latency_ms: number;
    type: string;
  }[];
}

export interface AdminUser {
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  phone_number?: string;
  is_active: boolean;
  user_profile?: any;
  created_at?: string;
  last_login?: string;
}

export const adminService = {
  // Dashboard & Health
  async getDashboard(): Promise<AdminDashboardData> {
    return await apiRequest<AdminDashboardData>('/api/admin/dashboard');
  },

  async getSystemHealth(): Promise<AdminSystemHealth> {
    return await apiRequest<AdminSystemHealth>('/api/admin/system-health');
  },

  // Users
  async getUsers(params?: { search?: string; role?: string; status?: string; limit?: number }): Promise<{ total: number; users: AdminUser[] }> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.role) q.append('role', params.role);
    if (params?.status) q.append('status', params.status);
    if (params?.limit) q.append('limit', params.limit.toString());
    return await apiRequest<{ total: number; users: AdminUser[] }>(`/api/admin/users?${q.toString()}`);
  },

  async getUserDetail(userId: string): Promise<AdminUser> {
    return await apiRequest<AdminUser>(`/api/admin/users/${userId}`);
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<{ success: boolean; message: string; user: AdminUser }> {
    return await apiRequest<{ success: boolean; message: string; user: AdminUser }>(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive })
    });
  },

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    return await apiRequest<{ success: boolean; message: string }>(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    });
  },

  // Schemes
  async getSchemes(params?: { category?: string; status?: string; search?: string }): Promise<{ total: number; schemes: any[] }> {
    const q = new URLSearchParams();
    if (params?.category) q.append('category', params.category);
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    return await apiRequest<{ total: number; schemes: any[] }>(`/api/admin/schemes?${q.toString()}`);
  },

  async createScheme(schemeData: any): Promise<{ success: boolean; message: string; scheme: any }> {
    return await apiRequest<{ success: boolean; message: string; scheme: any }>('/api/admin/schemes', {
      method: 'POST',
      body: JSON.stringify(schemeData)
    });
  },

  async updateScheme(schemeId: string, schemeData: any): Promise<{ success: boolean; message: string; scheme: any }> {
    return await apiRequest<{ success: boolean; message: string; scheme: any }>(`/api/admin/schemes/${schemeId}`, {
      method: 'PUT',
      body: JSON.stringify(schemeData)
    });
  },

  async updateSchemeStatus(schemeId: string, status: string): Promise<{ success: boolean; message: string; scheme: any }> {
    return await apiRequest<{ success: boolean; message: string; scheme: any }>(`/api/admin/schemes/${schemeId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async archiveScheme(schemeId: string): Promise<{ success: boolean; message: string }> {
    return await apiRequest<{ success: boolean; message: string }>(`/api/admin/schemes/${schemeId}`, {
      method: 'DELETE'
    });
  },

  // Eligibility Rules
  async getEligibilityRules(): Promise<{ total: number; rules: any[] }> {
    return await apiRequest<{ total: number; rules: any[] }>('/api/admin/eligibility-rules');
  },

  async testEligibilityRule(testData: {
    scheme_id?: string;
    age: number;
    gender: string;
    state: string;
    occupation: string;
    annual_income: number;
    owns_land: boolean;
    landholding_acres: number;
    caste_category: string;
  }): Promise<{
    scheme_id: string;
    scheme_name: string;
    status: string;
    confidence_score: number;
    matched_criteria: string[];
    unmatched_criteria: string[];
    reason: string;
  }> {
    return await apiRequest<any>('/api/admin/eligibility-rules/test', {
      method: 'POST',
      body: JSON.stringify(testData)
    });
  },

  // Document Requirements
  async getDocuments(): Promise<{ total: number; documents: any[] }> {
    return await apiRequest<{ total: number; documents: any[] }>('/api/admin/documents');
  },

  // AI & NLP
  async getAiStatus(): Promise<any> {
    return await apiRequest<any>('/api/admin/ai/status');
  },

  async getQueries(params?: { intent?: string; language?: string; search?: string; limit?: number }): Promise<{ total: number; queries: any[] }> {
    const q = new URLSearchParams();
    if (params?.intent) q.append('intent', params.intent);
    if (params?.language) q.append('language', params.language);
    if (params?.search) q.append('search', params.search);
    if (params?.limit) q.append('limit', params.limit.toString());
    return await apiRequest<{ total: number; queries: any[] }>(`/api/admin/queries?${q.toString()}`);
  },

  async getFailedQueries(): Promise<{ total_flagged: number; flagged_queries: any[] }> {
    return await apiRequest<any>('/api/admin/queries/errors');
  },

  // Recommendations & Languages
  async getRecommendations(): Promise<any> {
    return await apiRequest<any>('/api/admin/recommendations');
  },

  async getLanguages(): Promise<any> {
    return await apiRequest<any>('/api/admin/languages');
  },

  // Audit Logs
  async getAuditLogs(params?: { action?: string; resource?: string; search?: string; limit?: number }): Promise<{ total: number; logs: any[] }> {
    const q = new URLSearchParams();
    if (params?.action) q.append('action', params.action);
    if (params?.resource) q.append('resource', params.resource);
    if (params?.search) q.append('search', params.search);
    if (params?.limit) q.append('limit', params.limit.toString());
    return await apiRequest<{ total: number; logs: any[] }>(`/api/admin/audit-logs?${q.toString()}`);
  },

  // System Settings
  async getSettings(): Promise<any> {
    return await apiRequest<any>('/api/admin/settings');
  },

  async updateSettings(settings: any): Promise<{ success: boolean; message: string }> {
    return await apiRequest<{ success: boolean; message: string }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  // Citizen Applications Review & Nodal Management
  async getApplications(params?: { user_id?: string }): Promise<ApplicationRecord[]> {
    const q = new URLSearchParams();
    if (params?.user_id) q.append('user_id', params.user_id);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return await apiRequest<ApplicationRecord[]>(`/api/applications${queryStr}`);
  },

  async updateApplicationStatus(
    appId: string,
    data: {
      status?: string;
      current_stage?: string;
      stage_order?: number;
      notes?: string;
      action_type?: string;
      missing_documents?: string[];
      sanction_amount?: number;
    }
  ): Promise<ApplicationRecord> {
    return await apiRequest<ApplicationRecord>(`/api/applications/${encodeURIComponent(appId)}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteApplication(appId: string): Promise<{ success: boolean; message: string }> {
    return await apiRequest<{ success: boolean; message: string }>(`/api/applications/${encodeURIComponent(appId)}`, {
      method: 'DELETE'
    });
  }
};
