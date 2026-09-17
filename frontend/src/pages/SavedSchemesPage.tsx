import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSavedSchemes } from '../context/SavedSchemesContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { t } from '../i18n';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Bookmark, ArrowLeft } from 'lucide-react';

export const SavedSchemesPage: React.FC = () => {
  const { savedSchemes } = useSavedSchemes();
  const { language } = useAccessibility();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-govblue-50 border border-govblue-200 text-govblue-800 text-xs font-bold mb-2">
          <Bookmark className="w-3.5 h-3.5" />
          <span>{t('Saved Collections', language)}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
          {t('Saved Schemes', language)}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('Quickly access welfare programs and subsidies you bookmarked for later application.', language)}
        </p>
      </div>

      {savedSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedSchemes.map(scheme => (
            <SchemeCard
              key={scheme.scheme_id}
              scheme={scheme}
              onViewDetails={s => navigate(`/schemes/${s.scheme_id}`)}
              onCheckEligibility={s => navigate(`/eligibility?scheme=${s.scheme_id}`)}
              onCompare={s => navigate(`/compare?add=${s.scheme_id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="bookmark"
          title={t("You haven't saved any schemes yet.", language)}
          description={t("Bookmark schemes from the explorer or recommendations to track eligibility and documents in one place.", language)}
          actionText={t("Explore Schemes", language)}
          onAction={() => navigate('/schemes')}
        />
      )}
    </div>
  );
};
