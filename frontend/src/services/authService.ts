import { User, AuthResponse, UserProfile, AdminUserListResponse, AdminStatsResponse, AdminUserActionResponse } from '../types';
import { apiRequest } from './apiClient';

export const authService = {
  async register(data: {
    email: string;
    password: string;
    full_name: string;
    phone_number?: string;
    preferred_language?: string;
    state?: string;
  }): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone_number: data.phone_number,
        role: 'user'
      })
    });
    localStorage.setItem('sevaai_access_token', res.access_token);
    localStorage.setItem('sevaai_user', JSON.stringify(res.user));
    return res;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('sevaai_access_token', res.access_token);
    localStorage.setItem('sevaai_user', JSON.stringify(res.user));
    return res;
  },

  async sendOtp(identifier: string, purpose: 'login' | 'register' = 'login'): Promise<{ message: string; status: string; success: boolean }> {
    return await apiRequest<{ message: string; status: string; success: boolean }>('/api/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ identifier, purpose })
    });
  },

  async verifyOtp(identifier: string, otp_code: string, purpose: 'login' | 'register' = 'register'): Promise<{ success: boolean; verified: boolean; message: string; verification_token?: string }> {
    return await apiRequest<{ success: boolean; verified: boolean; message: string; verification_token?: string }>('/api/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp_code, purpose })
    });
  },

  async loginWithOtp(identifier: string, otp_code: string): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>('/api/auth/otp/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp_code })
    });
    localStorage.setItem('sevaai_access_token', res.access_token);
    localStorage.setItem('sevaai_user', JSON.stringify(res.user));
    return res;
  },

  async registerWithOtp(data: {
    email: string;
    password: string;
    full_name: string;
    otp_code?: string;
    verification_token?: string;
    phone_number?: string;
    role?: 'user' | 'admin';
    state?: string;
    preferred_language?: string;
  }): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>('/api/auth/otp/register', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        otp_code: data.otp_code,
        verification_token: data.verification_token,
        phone_number: data.phone_number,
        role: data.role || 'user',
        state: data.state,
        preferred_language: data.preferred_language
      })
    });
    return res;
  },

  async updateProfile(profile: UserProfile): Promise<User> {
    const res = await apiRequest<User>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ user_profile: profile })
    });
    localStorage.setItem('sevaai_user', JSON.stringify(res));
    return res;
  },

  getCurrentUser(): User | null {
    const stored = localStorage.getItem('sevaai_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('sevaai_access_token');
    localStorage.removeItem('sevaai_user');
  },

  async getAdminUsers(limit: number = 100): Promise<AdminUserListResponse> {
    return await apiRequest<AdminUserListResponse>(`/api/auth/admin/users?limit=${limit}`);
  },

  async getAdminStats(): Promise<AdminStatsResponse> {
    return await apiRequest<AdminStatsResponse>('/api/auth/admin/stats');
  },

  async updateUserRole(userId: string, role: 'admin' | 'user'): Promise<AdminUserActionResponse> {
    return await apiRequest<AdminUserActionResponse>(`/api/auth/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<AdminUserActionResponse> {
    return await apiRequest<AdminUserActionResponse>(`/api/auth/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive })
    });
  },

  async deleteUser(userId: string): Promise<AdminUserActionResponse> {
    return await apiRequest<AdminUserActionResponse>(`/api/auth/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }
};
