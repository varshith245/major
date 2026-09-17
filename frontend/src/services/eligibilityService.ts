import { UserProfile, EligibilityEvaluationResponse, EligibilityResult, SimulationResponse, Scheme } from '../types';
import { apiRequest } from './apiClient';
import { MOCK_SCHEMES } from '../data/mockSchemes';

export const eligibilityService = {
  async evaluateProfile(profile: UserProfile): Promise<EligibilityEvaluationResponse> {
    try {
      return await apiRequest<EligibilityEvaluationResponse>('/api/eligibility/evaluate', {
        method: 'POST',
        body: JSON.stringify(profile)
      });
    } catch {
      // Local evaluation fallback
      const results: EligibilityResult[] = MOCK_SCHEMES.map(scheme => {
        const crit = scheme.eligibility_criteria;
        let is_pass = true;
        let score = 1.0;
        const reasons: string[] = [];
        const missing: string[] = [];

        // State check
        if (scheme.state !== 'All-India' && scheme.state.toLowerCase() !== profile.state.toLowerCase()) {
          is_pass = false;
          missing.push(`Designated exclusively for residents of ${scheme.state}`);
          score -= 0.6;
        } else {
          reasons.push(`Satisfies state residency criteria (${scheme.state})`);
        }

        // Age check
        if (profile.age < crit.min_age || profile.age > crit.max_age) {
          is_pass = false;
          missing.push(`Applicant age (${profile.age}) is outside required window of ${crit.min_age}–${crit.max_age} years`);
          score -= 0.4;
        } else {
          reasons.push(`Age (${profile.age} yrs) satisfies eligibility window (${crit.min_age}–${crit.max_age} yrs)`);
        }

        // Gender check
        if (crit.gender !== 'Any' && crit.gender.toLowerCase() !== profile.gender.toLowerCase()) {
          is_pass = false;
          missing.push(`Designated specifically for ${crit.gender} applicants`);
          score -= 0.5;
        }

        // Income check
        if (crit.max_annual_income && profile.annual_income > crit.max_annual_income) {
          is_pass = false;
          missing.push(`Annual household income ₹${profile.annual_income.toLocaleString('en-IN')} exceeds ceiling of ₹${crit.max_annual_income.toLocaleString('en-IN')}`);
          score -= 0.4;
        } else if (crit.max_annual_income) {
          reasons.push(`Annual income ₹${profile.annual_income.toLocaleString('en-IN')} is within eligible ceiling of ₹${crit.max_annual_income.toLocaleString('en-IN')}`);
        }

        // Land check
        if (crit.landholding_required && !profile.owns_land) {
          is_pass = false;
          missing.push('Ownership of agricultural cultivable land is mandatory');
          score -= 0.4;
        } else if (crit.landholding_required && profile.owns_land) {
          reasons.push(`Applicant holds cultivable agricultural land (${profile.landholding_acres || 2} acres)`);
        }

        // Exclusions
        if (profile.is_income_tax_payer && (crit.exclusions || []).some(e => e.toLowerCase().includes('tax'))) {
          is_pass = false;
          missing.push('Income tax payers are excluded under statutory guidelines');
          score -= 0.5;
        }
        if (profile.is_govt_employee && (crit.exclusions || []).some(e => e.toLowerCase().includes('government'))) {
          is_pass = false;
          missing.push('Regular government employees are excluded under scheme guidelines');
          score -= 0.5;
        }
        if (profile.owns_pucca_house && (scheme.short_name.includes('PMAY') || scheme.scheme_name.includes('Awas'))) {
          is_pass = false;
          missing.push('Beneficiaries owning an existing pucca house are not eligible');
          score -= 0.6;
        }

        const confidence = Math.max(0.1, Math.min(0.98, is_pass ? score : score * 0.45));
        let status: 'Likely Eligible' | 'Conditionally Eligible' | 'Not Eligible' = 'Not Eligible';
        if (is_pass && confidence >= 0.70) status = 'Likely Eligible';
        else if (is_pass && confidence >= 0.50) status = 'Conditionally Eligible';

        return {
          scheme_id: scheme.scheme_id,
          scheme_name: scheme.scheme_name,
          short_name: scheme.short_name,
          category: scheme.category,
          benefit_amount: scheme.benefit_amount,
          eligibility_status: status,
          confidence_score: Number(confidence.toFixed(2)),
          is_eligible: is_pass,
          reasons,
          missing_criteria: missing,
          required_documents: scheme.required_documents,
          application_link: scheme.application_link,
          offline_process: scheme.offline_process
        };
      });

      results.sort((a, b) => (b.is_eligible ? 1 : 0) - (a.is_eligible ? 1 : 0) || b.confidence_score - a.confidence_score);

      return {
        total_evaluated: results.length,
        eligible_count: results.filter(r => r.is_eligible).length,
        results
      };
    }
  },

  async checkSpecificScheme(schemeId: string, profile: UserProfile): Promise<EligibilityResult> {
    try {
      return await apiRequest<EligibilityResult>(`/api/eligibility/check-scheme/${schemeId}`, {
        method: 'POST',
        body: JSON.stringify(profile)
      });
    } catch {
      const evaluation = await this.evaluateProfile(profile);
      const matched = evaluation.results.find(r => r.scheme_id === schemeId || r.short_name.toLowerCase() === schemeId.toLowerCase());
      return matched || evaluation.results[0];
    }
  },

  async simulateWhatIf(baseProfile: UserProfile, modifiedFields: Partial<UserProfile>): Promise<SimulationResponse> {
    try {
      return await apiRequest<SimulationResponse>('/api/eligibility/simulate', {
        method: 'POST',
        body: JSON.stringify({
          base_profile: baseProfile,
          modified_fields: modifiedFields
        })
      });
    } catch {
      const baseEval = await this.evaluateProfile(baseProfile);
      const simulatedProfile = { ...baseProfile, ...modifiedFields } as UserProfile;
      const simEval = await this.evaluateProfile(simulatedProfile);

      const baseEligible = new Set(baseEval.results.filter(r => r.is_eligible).map(r => r.short_name));
      const simEligible = new Set(simEval.results.filter(r => r.is_eligible).map(r => r.short_name));

      const newly_eligible: string[] = (Array.from(simEligible) as string[]).filter(name => !baseEligible.has(name));
      const newly_ineligible: string[] = (Array.from(baseEligible) as string[]).filter(name => !simEligible.has(name));

      return {
        original_eligible_count: baseEligible.size,
        simulated_eligible_count: simEligible.size,
        difference: simEligible.size - baseEligible.size,
        newly_eligible_schemes: newly_eligible,
        newly_ineligible_schemes: newly_ineligible,
        results: simEval.results
      };
    }
  }
};
