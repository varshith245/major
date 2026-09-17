import { Scheme, UserProfile } from '../types';
import { MOCK_SCHEMES } from '../data/mockSchemes';
import { apiRequest } from './apiClient';

export const schemeService = {
  async getAllSchemes(params?: {
    category?: string;
    state?: string;
    search?: string;
  }): Promise<Scheme[]> {
    try {
      const query = new URLSearchParams();
      if (params?.category && params.category !== 'All') query.append('category', params.category);
      if (params?.state && params.state !== 'All') query.append('state', params.state);
      if (params?.search && params.search.trim()) query.append('search', params.search.trim());

      const url = `/api/schemes${query.toString() ? `?${query.toString()}` : ''}`;
      return await apiRequest<Scheme[]>(url);
    } catch {
      // Resilient local fallback
      let filtered = [...MOCK_SCHEMES];
      if (params?.category && params.category !== 'All') {
        filtered = filtered.filter(s => s.category.toLowerCase().includes(params.category!.toLowerCase()));
      }
      if (params?.state && params.state !== 'All') {
        filtered = filtered.filter(s => s.state === 'All-India' || s.state.toLowerCase() === params.state!.toLowerCase());
      }
      if (params?.search && params.search.trim()) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(s =>
          s.short_name.toLowerCase().includes(q) ||
          s.scheme_name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      return filtered;
    }
  },

  async getSchemeById(schemeId: string): Promise<Scheme> {
    try {
      return await apiRequest<Scheme>(`/api/schemes/${schemeId}`);
    } catch {
      const found = MOCK_SCHEMES.find(s => s.scheme_id === schemeId || s.short_name.toLowerCase() === schemeId.toLowerCase());
      if (found) return found;
      return MOCK_SCHEMES[0];
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      return await apiRequest<string[]>('/api/schemes/categories');
    } catch {
      return Array.from(new Set(MOCK_SCHEMES.map(s => s.category))).sort();
    }
  },

  calculateRecommendations(profile?: Partial<UserProfile> | null, sourceSchemes?: Scheme[]): Scheme[] {
    const userState = (profile?.state || 'Karnataka').trim().toLowerCase();
    const userOccupation = (profile?.occupation || 'Farmer').trim().toLowerCase();
    const userAge = typeof profile?.age === 'number' && !isNaN(profile.age) ? profile.age : 34;
    const userIncome = typeof profile?.annual_income === 'number' && !isNaN(profile.annual_income) ? profile.annual_income : 120000;
    const userLand = !!profile?.owns_land;
    const displayState = profile?.state || 'Karnataka';
    const displayOcc = profile?.occupation || 'Farmer';

    const schemesToScore = (sourceSchemes && sourceSchemes.length > 0) ? sourceSchemes : MOCK_SCHEMES;

    return schemesToScore.map(scheme => {
      let score = 50;
      const reasons: string[] = [];

      // State matching
      const sState = (scheme.state || '').trim().toLowerCase();
      if (sState === 'all-india' || sState === userState) {
        score += 15;
        reasons.push(`Available in your state (${displayState})`);
      }

      // Occupation matching
      const crit = scheme.eligibility_criteria;
      if (crit?.occupation && Array.isArray(crit.occupation) && crit.occupation.some(o => {
        const oNorm = (o || '').toLowerCase();
        return oNorm.includes(userOccupation) || userOccupation.includes(oNorm);
      })) {
        score += 20;
        reasons.push(`Designed specifically for ${displayOcc}s`);
      }

      // Age matching
      if (crit && typeof crit.min_age === 'number' && typeof crit.max_age === 'number') {
        if (userAge >= crit.min_age && userAge <= crit.max_age) {
          score += 10;
          reasons.push(`Satisfies age requirement (${crit.min_age}–${crit.max_age} yrs)`);
        }
      }

      // Income limit
      if (crit?.max_annual_income && userIncome <= crit.max_annual_income) {
        score += 10;
        reasons.push(`Income ₹${userIncome.toLocaleString('en-IN')} satisfies threshold`);
      }

      // Landholding
      if (crit?.landholding_required && userLand) {
        score += 10;
        reasons.push('Matches landholding criteria');
      }

      const match_score = Math.min(96, Math.max(40, score));

      return {
        ...scheme,
        match_score,
        match_reasons: reasons.slice(0, 3)
      };
    }).sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
  },

  async getRecommendations(profile?: Partial<UserProfile> | null): Promise<Scheme[]> {
    try {
      const liveSchemes = await this.getAllSchemes();
      if (liveSchemes && liveSchemes.length > 0) {
        return this.calculateRecommendations(profile, liveSchemes);
      }
    } catch (e) {
      console.warn('[schemeService] Using local fallback for recommendations:', e);
    }
    return this.calculateRecommendations(profile, MOCK_SCHEMES);
  }
};
