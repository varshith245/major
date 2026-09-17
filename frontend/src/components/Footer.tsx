import React from 'react';
import { Building2, ShieldCheck, Heart, ExternalLink } from 'lucide-react';
import { t } from '../i18n';

interface FooterProps {
  language: string;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-crimson-600 flex items-center justify-center text-white shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white font-heading">
                eGov<span className="text-crimson-500">Seva</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              AI-powered citizen assistance platform providing multilingual scheme discovery, instant eligibility checks, and document verification for Central & Karnataka State welfare initiatives.
            </p>
          </div>

          {/* Col 2: Major Schemes */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Major Schemes
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>PM Kisan Samman Nidhi</li>
              <li>Karnataka Yuva Nidhi</li>
              <li>Ayushman Bharat PM-JAY</li>
              <li>Karnataka Gruha Lakshmi</li>
              <li>PM Awas Yojana (Gramin)</li>
            </ul>
          </div>

          {/* Col 3: Official Portals */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Official Portals
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <a href="https://www.india.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                  <span>National Portal of India</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://karnataka.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                  <span>Government of Karnataka</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://sevasindhu.karnataka.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                  <span>Seva Sindhu Karnataka</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Citizen Helplines */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Helplines
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>Citizen Toll-Free: <strong className="text-white">1800-11-0001</strong></li>
              <li>Karnataka Helpline: <strong className="text-white">1902</strong></li>
              <li>PM-KISAN Helpdesk: <strong className="text-white">155261</strong></li>
              <li>Emergency Services: <strong className="text-white">112</strong></li>
            </ul>
          </div>

        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>{t('footer_disclaimer', language)}</p>
          <p>© {new Date().getFullYear()} eGovSeva AI. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};
