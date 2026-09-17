import { ApplicationRecord } from '../types';
import { apiRequest } from './apiClient';
import { INITIAL_APPLICATION_HISTORY } from '../data/mockData';

const LOCAL_STORAGE_KEY = 'sevaai_applications';

export const applicationService = {
  async submitApplication(data: {
    scheme_id: string;
    scheme_name: string;
    category: string;
    reference_no?: string;
    portal_url?: string;
    status?: string;
    current_stage?: string;
    stage_order?: number;
    notes?: string;
  }): Promise<ApplicationRecord> {
    const now = new Date().toISOString().split('T')[0];
    const generatedRef = data.reference_no || `SEV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const fallbackRecord: ApplicationRecord = {
      id: `APP-${Date.now()}`,
      scheme_id: data.scheme_id,
      scheme_name: data.scheme_name,
      category: data.category,
      status: (data.status as any) || 'Submitted',
      submission_date: now,
      last_updated: now,
      reference_no: generatedRef,
      portal_url: data.portal_url || 'https://www.india.gov.in'
    };

    try {
      const serverRecord = await apiRequest<ApplicationRecord>('/api/applications', {
        method: 'POST',
        body: JSON.stringify({
          scheme_id: data.scheme_id,
          scheme_name: data.scheme_name,
          category: data.category,
          reference_no: generatedRef,
          portal_url: data.portal_url,
          status: data.status || 'Submitted',
          current_stage: data.current_stage || 'Application Submitted',
          stage_order: data.stage_order || 1,
          notes: data.notes
        })
      });

      // Update local storage mirror
      this._saveToLocalStorage(serverRecord);
      return serverRecord;
    } catch (e) {
      console.warn('[applicationService] Server save failed, saving to local cache:', e);
      this._saveToLocalStorage(fallbackRecord);
      return fallbackRecord;
    }
  },

  async getUserApplications(): Promise<ApplicationRecord[]> {
    try {
      const serverRecords = await apiRequest<ApplicationRecord[]>('/api/applications');
      if (Array.isArray(serverRecords)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverRecords));
        return serverRecords;
      }
    } catch (e) {
      console.warn('[applicationService] Server fetch failed, reading local cache:', e);
    }

    // Fallback to local storage if offline
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore JSON parse error
    }

    return [];
  },

  async updateApplicationStatus(
    appId: string,
    updates: {
      status?: string;
      current_stage?: string;
      stage_order?: number;
      notes?: string;
    }
  ): Promise<ApplicationRecord | null> {
    try {
      const updated = await apiRequest<ApplicationRecord>(`/api/applications/${encodeURIComponent(appId)}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      this._updateInLocalStorage(updated);
      return updated;
    } catch (e) {
      console.warn('[applicationService] Status update failed or unauthorized:', e);
      throw e;
    }
  },

  async deleteApplication(appId: string): Promise<boolean> {
    try {
      await apiRequest(`/api/applications/${encodeURIComponent(appId)}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('[applicationService] Server delete failed:', e);
    }

    // Always clean local storage
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const apps: ApplicationRecord[] = JSON.parse(stored);
        const filtered = apps.filter(a => a.id !== appId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch {}

    return true;
  },

  async downloadAcknowledgmentPdf(appId: string, referenceNo?: string): Promise<void> {
    const token = localStorage.getItem('sevaai_access_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api/applications/${encodeURIComponent(appId)}/acknowledgment-pdf`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      let msg = 'Failed to download acknowledgment slip.';
      try {
        const err = await response.json();
        if (err.detail) msg = err.detail;
      } catch {}
      throw new Error(msg);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeRef = (referenceNo || appId).replace(/[/\\?%*:|"<>]/g, '-');
    a.download = `SEVA-Acknowledgment-${safeRef}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  _saveToLocalStorage(record: ApplicationRecord) {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      const apps: ApplicationRecord[] = stored ? JSON.parse(stored) : [...INITIAL_APPLICATION_HISTORY];
      const filtered = apps.filter(a => a.scheme_id !== record.scheme_id && a.id !== record.id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([record, ...filtered]));
    } catch {}
  },

  _updateInLocalStorage(record: ApplicationRecord) {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const apps: ApplicationRecord[] = JSON.parse(stored);
        const updated = apps.map(a => (a.id === record.id ? record : a));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {}
  },

  _updateLocalStatus(appId: string, updates: any): ApplicationRecord | null {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const apps: ApplicationRecord[] = JSON.parse(stored);
        const target = apps.find(a => a.id === appId);
        if (target) {
          const updated: ApplicationRecord = {
            ...target,
            status: updates.status || target.status,
            last_updated: new Date().toISOString().split('T')[0]
          };
          this._updateInLocalStorage(updated);
          return updated;
        }
      }
    } catch {}
    return null;
  }
};
