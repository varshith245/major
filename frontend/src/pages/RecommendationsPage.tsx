import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scheme, UserProfile } from '../types';
import { schemeService } from '../services/schemeService';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { Button } from '../components/ui/Button';
import { Sparkles, TrendingUp, UserCheck, RefreshCw } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const defaultProfile: UserProfile = {
    age: 34,
    gender: 'Female',
    state: 'Karnataka',
    occupation: 'Farmer',
    annual_income: 120000,
    owns_land: true,
    landholding_acres: 2.5,
    caste_category: 'General',
    is_govt_employee: false,
    is_income_tax_payer: false,
    owns_pucca_house: false
  };

  const profile: UserProfile = {
    ...defaultProfile,
    ...(user?.user_profile || {})
  };

  const [recommendations, setRecommendations] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadRecs = async () => {
      setLoading(true);
      try {
        const recs = await schemeService.getRecommendations(profile);
        if (isMounted) setRecommendations(recs);
      } catch {
        if (isMounted) {
          const recs = schemeService.calculateRecommendations(profile);
          setRecommendations(recs);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRecs();
    return () => { isMounted = false; };
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-govblue-900 via-slate-900 to-govblue-950 rounded-3xl p-8 sm:p-10 text-white shadow-card flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800/80 text-sky-300 text-xs font-bold self-start">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Matching Engine</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-heading">
          Personalized Scheme Recommendations
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Matches calculated based on your declared background ({profile.occupation}, {profile.state}, {profile.age} yrs). Schemes with higher confidence scores offer higher likelihood of acceptance.
        </p>

        <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/eligibility')}
            className="text-white border-slate-700 bg-slate-800/60"
          >
            Update Profile Criteria
          </Button>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map(scheme => (
          <div key={scheme.scheme_id} className="flex flex-col">
            {/* Transparent Match Reason Callout */}
            <div className="bg-emerald-50 border border-emerald-200 border-b-0 rounded-t-2xl px-4 py-2.5 text-xs text-emerald-950 flex flex-col gap-1">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  {scheme.match_score}% Match
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Why Recommended
                </span>
              </div>
              <ul className="text-[11px] text-emerald-800 space-y-0.5 mt-0.5">
                {scheme.match_reasons?.map((reason, idx) => (
                  <li key={idx}>• {reason}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-t-none">
              <SchemeCard
                scheme={scheme}
                onViewDetails={s => navigate(`/schemes/${s.scheme_id}`)}
                onCheckEligibility={s => navigate(`/eligibility?scheme=${s.scheme_id}`)}
                onCompare={s => navigate(`/compare?add=${s.scheme_id}`)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
