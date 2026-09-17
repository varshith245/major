import React from 'react';
import { Scheme } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Bookmark, CheckCircle2, ArrowRight, Scale, IndianRupee } from 'lucide-react';
import { useSavedSchemes } from '../../context/SavedSchemesContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { translateCategory } from '../../i18n';

export interface SchemeCardProps {
  scheme: Scheme;
  onViewDetails: (scheme: Scheme) => void;
  onCheckEligibility: (scheme: Scheme) => void;
  onCompare?: (scheme: Scheme) => void;
  isComparing?: boolean;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  onViewDetails,
  onCheckEligibility,
  onCompare,
  isComparing = false
}) => {
  const { isSaved, toggleSave } = useSavedSchemes();
  const { t, language } = useAccessibility();
  const saved = isSaved(scheme.scheme_id);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-6 flex flex-col justify-between shadow-subtle hover:shadow-card transition-all duration-200 group">
      <div>
        {/* Top Badges & Save Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={scheme?.level === 'Central' ? 'central' : 'state'}>
              {scheme?.level === 'Central' ? t('card_central_badge') : `${scheme?.state || 'State'} ${t('card_state_badge')}`}
            </Badge>
            <Badge variant="slate">{translateCategory(scheme?.category || '', language)}</Badge>
            {scheme?.match_score && (
              <Badge variant="green" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}>
                {scheme.match_score}% {t('Match', 'Match')}
              </Badge>
            )}
          </div>

          <button
            onClick={() => toggleSave(scheme)}
            aria-label={saved ? 'Remove from saved' : 'Save scheme'}
            className={`p-2 rounded-lg border transition-colors ${
              saved
                ? 'bg-govblue-50 text-govblue-800 border-govblue-200'
                : 'bg-slate-50 text-slate-400 hover:text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-govblue-800' : ''}`} />
          </button>
        </div>

        {/* Scheme Names */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-govblue-800 transition-colors line-clamp-1 mb-1">
          {scheme?.short_name || scheme?.scheme_name || 'Government Scheme'}
        </h3>
        <p className="text-xs font-medium text-slate-500 line-clamp-1 mb-3">
          {scheme?.ministry || 'Government of India'}
        </p>

        {/* Short Benefit Callout */}
        <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-govblue-900 mb-1">
            <IndianRupee className="w-3.5 h-3.5 text-govgreen-600" />
            <span>{t('card_key_benefit')}</span>
          </div>
          <p className="text-xs text-slate-700 line-clamp-2">
            {scheme?.key_benefits || scheme?.description || 'Financial and welfare assistance for eligible beneficiaries.'}
          </p>
        </div>

        {/* Eligibility Preview snippet */}
        <div className="text-xs text-slate-600 mb-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">{t('card_age')}</span>
            <span>{scheme?.eligibility_criteria?.min_age ?? 18}–{scheme?.eligibility_criteria?.max_age ?? 65} {t('card_years')}</span>
          </div>
          {scheme?.eligibility_criteria?.max_annual_income != null && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">{t('card_income_ceiling')}</span>
              <span>₹{Number(scheme.eligibility_criteria.max_annual_income).toLocaleString('en-IN')} {t('card_per_year')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(scheme)}
          >
            {t('btn_view_details')}
          </Button>
          {onCompare && (
            <Button
              variant={isComparing ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onCompare(scheme)}
              leftIcon={<Scale className="w-3.5 h-3.5" />}
              className={isComparing ? 'border-govblue-400 bg-govblue-50 text-govblue-800' : ''}
            >
              {isComparing ? t('btn_compared') : t('btn_compare')}
            </Button>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onCheckEligibility(scheme)}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          {t('btn_check_eligibility')}
        </Button>
      </div>
    </div>
  );
};

