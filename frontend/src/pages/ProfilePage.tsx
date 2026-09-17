import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { t } from '../i18n';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { UserProfile } from '../types';
import {
  User as UserIcon,
  Shield,
  CheckCircle2,
  Edit,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  IndianRupee,
  Layers,
  Lock
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { language } = useAccessibility();
  const { showToast } = useToast();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || 'Renukagouda IN');
  const [age, setAge] = useState(user?.user_profile?.age || 34);
  const [occupation, setOccupation] = useState(user?.user_profile?.occupation || 'Farmer');
  const [state, setState] = useState(user?.user_profile?.state || 'Karnataka');
  const [income, setIncome] = useState(user?.user_profile?.annual_income || 120000);
  const [saving, setSaving] = useState(false);

  const profile = user?.user_profile;

  // Profile completeness score
  const completeness = profile ? 85 : 40;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated: UserProfile = {
        age,
        gender: profile?.gender || 'Female',
        state,
        occupation,
        annual_income: income,
        owns_land: profile?.owns_land ?? true,
        landholding_acres: profile?.landholding_acres || 2.5,
        caste_category: profile?.caste_category || 'General',
        is_govt_employee: profile?.is_govt_employee ?? false,
        is_income_tax_payer: profile?.is_income_tax_payer ?? false,
        owns_pucca_house: profile?.owns_pucca_house ?? false,
        is_bpl_cardholder: profile?.is_bpl_cardholder ?? true
      };

      await updateProfile(updated);
      setEditModalOpen(false);
      showToast(
        language === 'hi'
          ? 'नागरिक प्रोफ़ाइल सफलतापूर्वक अपडेट की गई।'
          : language === 'kn'
          ? 'ನಾಗರಿಕ ಪ್ರೊಫೈಲ್ ಅನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.'
          : 'Citizen profile updated successfully.',
        'success'
      );
    } catch {
      showToast(
        language === 'hi'
          ? 'प्रोफ़ाइल अपडेट करने में विफल।'
          : language === 'kn'
          ? 'ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಲು ವಿಫಲವಾಗಿದೆ.'
          : 'Failed to update profile.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-govblue-800 text-white flex items-center justify-center font-black text-2xl shadow-md">
            {user?.full_name ? user.full_name[0].toUpperCase() : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                {user?.full_name || 'Citizen Beneficiary'}
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-govgreen-50 text-govgreen-800 border border-govgreen-200">
                {t('Active Citizen Profile', language)}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email || 'citizen@seva.in'}</span>
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditModalOpen(true)}
          leftIcon={<Edit className="w-3.5 h-3.5" />}
        >
          {t('Edit Profile', language)}
        </Button>
      </div>

      {/* Completeness Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-800">{t('Profile Completeness', language)}</span>
          <span className="text-govblue-800">{completeness}% {t('Complete', language)}</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-govgreen-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${completeness}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500">
          {t('A more complete profile enables the AI engine to calculate higher confidence match scores.', language)}
        </p>
      </div>

      {/* Profile Parameters Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Livelihood Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-govblue-800" />
            <span>{t('Livelihood & Sector', language)}</span>
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">{t('Primary Occupation:', language)}</span>
              <span className="font-bold text-slate-800">{t(profile?.occupation || 'Farmer', language)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">{t('Declared Annual Income:', language)}</span>
              <span className="font-bold text-slate-800">₹{(profile?.annual_income || 120000).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">{t('Owns Agricultural Land:', language)}</span>
              <span className="font-bold text-slate-800">
                {profile?.owns_land ? `${t('Yes', language)} (${profile.landholding_acres || 2.5} ${t('acres', language, 'acres')})` : t('No', language)}
              </span>
            </div>
          </div>
        </div>

        {/* Location & Demographics */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-govgreen-600" />
            <span>{t('Location & Demographics', language)}</span>
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">{t('State of Residence:', language)}</span>
              <span className="font-bold text-slate-800">{t(profile?.state || 'Karnataka', language)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">{t('Age:', language)}</span>
              <span className="font-bold text-slate-800">{profile?.age || 34} {t('years', language, 'years')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">{t('Gender Identity:', language)}</span>
              <span className="font-bold text-slate-800">{t(profile?.gender || 'Female', language)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">{t('Category', language)}:</span>
              <span className="font-bold text-slate-800">{t(profile?.caste_category || 'General', language)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={t('Update Citizen Profile', language)}
        description={t('Update your basic criteria for re-evaluating scheme recommendations.', language)}
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Occupation</label>
            <select
              value={occupation}
              onChange={e => setOccupation(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="Farmer">Farmer / Cultivator</option>
              <option value="Student">Student / Graduate</option>
              <option value="Senior Citizen">Senior Citizen (60+)</option>
              <option value="Homemaker">Homemaker</option>
              <option value="Self-Employed">Self-Employed / Vendor</option>
              <option value="Worker">Worker / Daily Wage</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">State of Residence</label>
            <select
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="Karnataka">Karnataka</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="All-India">All-India / Other</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Age (Years)</label>
            <input
              type="number"
              min="16"
              max="95"
              value={age}
              onChange={e => setAge(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Annual Income (₹)</label>
            <input
              type="number"
              step="10000"
              value={income}
              onChange={e => setIncome(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={saving}>
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
