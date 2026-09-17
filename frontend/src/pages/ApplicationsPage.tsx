import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { t, translateCategory } from '../i18n';
import { applicationService } from '../services/applicationService';
import { ApplicationRecord } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { getPrimaryApplicationUrl } from '../utils/urlUtils';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  ShieldCheck,
  Printer,
  RefreshCw
} from 'lucide-react';

export const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAccessibility();
  const { showToast } = useToast();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingAppId, setDownloadingAppId] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const records = await applicationService.getUserApplications();
      setApplications(records);
    } catch (err) {
      console.warn('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDelete = async (appId: string) => {
    await applicationService.deleteApplication(appId);
    setApplications(prev => prev.filter(a => a.id !== appId));
    showToast('Application tracking record removed', 'info');
  };

  const handleDownloadPdf = async (appId: string, refNo: string) => {
    setDownloadingAppId(appId);
    try {
      await applicationService.downloadAcknowledgmentPdf(appId, refNo);
      showToast(`Acknowledgment slip for #${refNo} downloaded successfully.`, 'success');
    } catch (err: any) {
      console.error('PDF download error:', err);
      showToast(err.message || 'Failed to generate acknowledgment PDF slip.', 'error');
    } finally {
      setDownloadingAppId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <Badge variant="green" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}>
            {t('Approved', language)} &bull; {t('Official Sanction Recorded', language, 'Official Sanction Recorded')}
          </Badge>
        );
      case 'Under Review':
        return (
          <Badge variant="central" icon={<Clock className="w-3 h-3 text-govblue-600" />}>
            {t('Under Review', language)} &bull; {t('Department Verification in Progress', language, 'Department Verification')}
          </Badge>
        );
      case 'Submitted':
        return (
          <Badge variant="saffron" icon={<Clock className="w-3 h-3 text-amber-600" />}>
            {t('Submitted', language)} &bull; {t('Filing Acknowledged', language, 'Filing Acknowledged')}
          </Badge>
        );
      case 'Rejected':
        return (
          <Badge variant="rose" icon={<AlertCircle className="w-3 h-3 text-rose-600" />}>
            {t('Rejected', language)} &bull; {t('Department Decision Recorded', language, 'Department Decision Recorded')}
          </Badge>
        );
      default:
        return <Badge variant="slate">{t(status, language)}</Badge>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-govblue-50 border border-govblue-200 text-govblue-800 text-xs font-bold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>{t('Filing & Acknowledgment Log', language)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {t('Application History & Trackers', language)}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('Track acknowledgment numbers and verified status updates for submitted welfare schemes.', language)}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/schemes')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {t('New Application', language)}
        </Button>
      </div>

      {/* Official Status Transparency Notice */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 leading-relaxed flex flex-col gap-1.5">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-govblue-700" />
          <span>{t('Official Tracking Notice & Legal Disclaimer', language, 'Official Tracking Notice & Legal Disclaimer')}</span>
        </div>
        <p>
          {t('legal_disclaimer', language)}
        </p>
        <p className="text-slate-500 text-[11px]">
          Application statuses reflect official verification records from Government departmental authorities. This platform assists citizens with filing acknowledgment tracking and document readiness; official eligibility and sanction decisions are rendered exclusively by designated Government departmental authorities.
        </p>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse flex flex-col gap-3">
              <div className="h-5 bg-slate-200 rounded w-1/4"></div>
              <div className="h-6 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center gap-3 shadow-subtle">
          <FileText className="w-12 h-12 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-800">{t('No Tracked Applications', language)}</h3>
          <p className="text-xs text-slate-500 max-w-md">
            {t('You have not tracked any scheme applications yet. Browse public schemes, click Apply, and track your submission acknowledgment receipt here.', language)}
          </p>
          <Button variant="primary" size="sm" className="mt-2" onClick={() => navigate('/schemes')}>
            {t('Explore Welfare Schemes', language)}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(app.status)}
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200">
                    {t('app_col_ref', language)}: {app.reference_no}
                  </span>
                  <span className="text-xs text-slate-400">{t('app_col_date', language)}: {app.submission_date}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {app.scheme_name}
                </h3>
                <div className="text-xs text-slate-500">{t('Category', language)}: {translateCategory(app.category, language)}</div>
                {app.notes && (
                  <div className="text-xs text-slate-500 italic mt-1">
                    {app.notes}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPdf(app.id, app.reference_no)}
                  disabled={downloadingAppId === app.id}
                  leftIcon={downloadingAppId === app.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5 text-govblue-700" />}
                  className="text-govblue-800 border-govblue-300 hover:bg-govblue-50 font-bold"
                >
                  {downloadingAppId === app.id ? 'Generating PDF...' : 'Download Receipt (PDF)'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/documents?scheme=${app.scheme_id}`)}
                >
                  {t('View Documents', language)}
                </Button>
                <a
                  href={getPrimaryApplicationUrl(app.portal_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-govblue-800 text-white font-bold text-xs hover:bg-govblue-900 transition"
                >
                  <span>{t('Department Portal', language)}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(app.id)}
                  title="Remove tracker"
                  aria-label="Remove tracker"
                  className="p-2 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
