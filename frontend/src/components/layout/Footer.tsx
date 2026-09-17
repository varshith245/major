import React from 'react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../../context/AccessibilityContext';
import { t } from '../../i18n';
import { Shield, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language } = useAccessibility();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-20 sm:pb-12 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Identity */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-govblue-700 text-white flex items-center justify-center">
                <Shield className="w-5 h-5 text-sky-300" />
              </div>
              <span className="text-xl font-black text-white font-heading tracking-tight">
                SEVA
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {t('brand_subtitle', language)}
            </p>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-govgreen-400 bg-govgreen-950/60 border border-govgreen-800/60 px-2.5 py-1 rounded-full">
              <span>●</span>
              <span>UX4G Accessibility Standard Compliant</span>
            </div>
          </div>

          {/* Col 2: Public Services */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t('Citizen Services', language, 'Citizen Services')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/schemes" className="hover:text-white transition-colors">
                  {t('nav_explore', language)}
                </Link>
              </li>
              <li>
                <Link to="/eligibility" className="hover:text-white transition-colors">
                  {t('nav_eligibility', language)}
                </Link>
              </li>
              <li>
                <Link to="/documents" className="hover:text-white transition-colors">
                  {t('nav_documents', language)}
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition-colors">
                  {t('nav_compare', language)}
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-white transition-colors">
                  {t('nav_assistant', language)}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Verified Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Verified Portals
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://pmkisan.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  PM-KISAN Portal <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmjay.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  Ayushman Bharat (NHA) <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://sevasindhu.karnataka.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  Seva Sindhu Karnataka <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://data.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  Open Government Data (OGD) <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Accessibility & Trust */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Accessibility & Privacy
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/settings" className="hover:text-white transition-colors">
                  Text Scaling & High Contrast
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-white transition-colors">
                  Language Preferences
                </Link>
              </li>
              <li>
                <span className="text-slate-400">
                  Direct Citizen Helpline: <strong className="text-white">1800-11-0001</strong>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 SEVA — Public Service Assistant. Designed for Indian Citizens.</p>
          <p className="text-[11px] text-slate-400">
            Powered by FastAPI AI Engine, Hybrid Rules & MongoDB Atlas
          </p>
        </div>
      </div>
    </footer>
  );
};
