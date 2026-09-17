import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useToast } from '../../context/ToastContext';
import { t, translateDocument, translateCategory } from '../../i18n';
import { parseApplicationUrls } from '../../utils/urlUtils';
import { ApplicationRecord } from '../../types';
import { applicationService } from '../../services/applicationService';
import { INITIAL_APPLICATION_HISTORY } from '../../data/mockData';
import {
  ExternalLink,
  ShieldCheck,
  Building,
  Phone,
  FileCheck,
  MapPin,
  CheckCircle2,
  Clock,
  BookmarkCheck,
  IndianRupee,
  ArrowRight
} from 'lucide-react';

export interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: {
    scheme_id: string;
    scheme_name: string;
    short_name: string;
    category: string;
    application_link?: string;
    offline_process?: string;
    grievance_contact?: string;
    required_documents?: string[];
    benefit_amount?: number;
    processing_time_days?: number;
  } | null;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  scheme
}) => {
  const navigate = useNavigate();
  const { language } = useAccessibility();
  const { showToast } = useToast();
  const [isTracked, setIsTracked] = useState(false);
  const [customRef, setCustomRef] = useState('');
  const [showRefInput, setShowRefInput] = useState(false);

  useEffect(() => {
    if (!scheme) return;
    try {
      const stored = localStorage.getItem('sevaai_applications');
      const apps: ApplicationRecord[] = stored ? JSON.parse(stored) : INITIAL_APPLICATION_HISTORY;
      const exists = apps.some(a => a.scheme_id === scheme.scheme_id);
      setIsTracked(exists);
    } catch {
      setIsTracked(false);
    }
  }, [scheme, isOpen]);

  if (!scheme) return null;

  const channels = parseApplicationUrls(scheme.application_link);
  const primaryUrl = channels[0]?.url || 'https://www.india.gov.in';

  const handleTrackApplication = async (refNo?: string) => {
    const newRef = refNo || customRef || `SEV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await applicationService.submitApplication({
        scheme_id: scheme.scheme_id,
        scheme_name: `${scheme.short_name} (${scheme.scheme_name})`,
        category: scheme.category,
        reference_no: newRef,
        portal_url: primaryUrl,
        status: 'Submitted',
        current_stage: 'Application Submitted',
        stage_order: 1,
        notes: `Application filed via official portal ${primaryUrl}`
      });
      setIsTracked(true);
      setShowRefInput(false);
      showToast(`Application saved to Tracker with Reference #${newRef}`, 'success');
    } catch {
      showToast('Failed to save application tracker.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title=""
    >
      <div className="flex flex-col gap-6">
        {/* Header Summary */}
        <div className="pb-4 border-b border-slate-100 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('Verified Government Application Gateway', language)}</span>
            </div>
            <span className="text-xs font-mono text-slate-400">ID: {scheme.scheme_id}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            {t('Apply for', language)} {scheme.short_name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {scheme.scheme_name} • <span className="text-slate-700 font-medium">{translateCategory(scheme.category, language)}</span>
          </p>

          {scheme.benefit_amount && scheme.benefit_amount > 0 && (
            <div className="inline-flex items-center gap-2 text-xs font-bold text-govgreen-800 bg-govgreen-50 px-3 py-1.5 rounded-xl border border-govgreen-200 self-start mt-1">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>{t('Direct Benefit:', language)} ₹{scheme.benefit_amount.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>

        {/* Section 1: Official Online Application Portals */}
        <div className="bg-govblue-50/50 rounded-2xl p-5 border border-govblue-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-govblue-800" />
              <span className="text-xs font-bold text-govblue-950 uppercase tracking-wider">
                {t('Option 1: Official Online Portal (Direct Application)', language)}
              </span>
            </div>
            <span className="text-[11px] text-govblue-700 font-semibold bg-white px-2 py-0.5 rounded border border-govblue-200">
              {t('Zero Service Fee', language)}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {t('apply_modal_opt1_desc', language)}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-1">
            {channels.map((chan, idx) => (
              <a
                key={idx}
                href={chan.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition ${
                  chan.isPrimary
                    ? 'bg-govblue-800 hover:bg-govblue-900 text-white'
                    : 'bg-white hover:bg-slate-100 text-govblue-900 border border-slate-300'
                }`}
              >
                <span>{t('Apply on', language, 'Apply on')} {chan.name}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('Official Government of India / State portal redirection', language)}</span>
          </div>
        </div>

        {/* Section 2: Offline / Physical Walk-in Process */}
        {scheme.offline_process && (
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-slate-700" />
              <span>{t('Option 2: Offline / In-Person Application', language)}</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {scheme.offline_process}
            </p>
            {scheme.grievance_contact && (
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('Nodal Helpline:', language)} <strong>{scheme.grievance_contact}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* Section 3: Required Documents Preparation */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <FileCheck className="w-4 h-4 text-amber-600" />
              <span>{t('Documents to Keep Ready', language)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                navigate(`/documents?scheme=${scheme.scheme_id}`);
              }}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              {t('Interactive Checklist', language)}
            </Button>
          </div>

          {scheme.required_documents && scheme.required_documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {scheme.required_documents.slice(0, 4).map((doc, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{translateDocument(doc, language)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              {t('Standard identity and address documents (Aadhaar Card, Ration Card, Bank Passbook).', language)}
            </p>
          )}
        </div>

        {/* Section 4: Application Tracker Integration */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-bold text-amber-950">{t('Citizen Application Tracker', language)}</span>
            </div>
            {isTracked && (
              <Badge variant="green" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}>
                {t('Tracked in Dashboard', language)}
              </Badge>
            )}
          </div>

          <p className="text-xs text-amber-900 leading-relaxed">
            {t('Applied on the portal or visiting a CSC kiosk? Add this scheme to your Application Tracker to store acknowledgment reference numbers and track status updates.', language)}
          </p>

          {showRefInput ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t('Enter Dept Reference / Ack Number (e.g. SEV-2026-9182)', language)}
                value={customRef}
                onChange={e => setCustomRef(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-govblue-500"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleTrackApplication()}
              >
                {t('Save', language)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRefInput(false)}
              >
                {t('Cancel', language)}
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={isTracked ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => isTracked ? navigate('/applications') : handleTrackApplication()}
                leftIcon={<BookmarkCheck className="w-3.5 h-3.5" />}
              >
                {isTracked ? t('View in Application Tracker', language) : t('Record as Applied', language)}
              </Button>

              {!isTracked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRefInput(true)}
                >
                  {t('Enter Reference Number', language)}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            {t('Close', language)}
          </Button>
          <a
            href={primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-govgreen-700 hover:bg-govgreen-800 text-white font-bold text-xs shadow-sm transition"
          >
            <span>{t('Launch Official Portal', language)}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </Modal>
  );
};
