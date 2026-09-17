import { ComparisonResponse, Scheme } from '../types';
import { apiRequest } from './apiClient';
import { MOCK_SCHEMES } from '../data/mockSchemes';

export const comparisonService = {
  async compareSchemes(schemeIds: string[]): Promise<ComparisonResponse> {
    try {
      return await apiRequest<ComparisonResponse>('/api/comparison/compare', {
        method: 'POST',
        body: JSON.stringify({ scheme_ids: schemeIds })
      });
    } catch {
      const schemes: Scheme[] = schemeIds
        .map(id => MOCK_SCHEMES.find(s => s.scheme_id === id || s.short_name.toLowerCase() === id.toLowerCase()))
        .filter((s): s is Scheme => !!s);

      const resolved = schemes.length >= 2 ? schemes : MOCK_SCHEMES.slice(0, 2);

      return {
        schemes: resolved,
        comparison_fields: {
          names: resolved.map(s => s.scheme_name),
          short_names: resolved.map(s => s.short_name),
          ministries: resolved.map(s => s.ministry),
          levels: resolved.map(s => `${s.level} (${s.state})`),
          categories: resolved.map(s => s.category),
          benefit_amounts: resolved.map(s => s.benefit_amount > 0 ? `₹${s.benefit_amount.toLocaleString('en-IN')}` : 'Subsidy / In-Kind Aid'),
          key_benefits: resolved.map(s => s.key_benefits),
          age_criteria: resolved.map(s => `${s.eligibility_criteria.min_age} to ${s.eligibility_criteria.max_age} years`),
          income_limits: resolved.map(s => s.eligibility_criteria.max_annual_income ? `Up to ₹${s.eligibility_criteria.max_annual_income.toLocaleString('en-IN')}` : 'No strict ceiling'),
          landholding_rules: resolved.map(s => s.eligibility_criteria.landholding_required ? 'Mandatory (Landowners only)' : 'Not mandatory'),
          required_documents: resolved.map(s => s.required_documents.slice(0, 3).join(', ') + (s.required_documents.length > 3 ? ` (+${s.required_documents.length - 3} more)` : '')),
          processing_times: resolved.map(s => `~${s.processing_time_days} days`),
          application_portals: resolved.map(s => s.application_link)
        }
      };
    }
  },

  async downloadComparisonPdf(schemeIds: string[]): Promise<void> {
    const token = localStorage.getItem('sevaai_access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/comparison/export-pdf', {
      method: 'POST',
      headers,
      body: JSON.stringify({ scheme_ids: schemeIds })
    });

    if (!response.ok) {
      let msg = 'Failed to generate comparison PDF.';
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
    a.download = 'SEVA-Scheme-Comparison-Matrix.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};
