import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Archive,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  X,
  Clock,
  Tag
} from 'lucide-react';

export const AdminSchemesPage: React.FC = () => {
  const { showToast } = useToast();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    scheme_name: '',
    short_name: '',
    ministry: '',
    level: 'Central',
    state: 'All-India',
    category: 'Farmer & Agriculture',
    description: '',
    key_benefits: '',
    benefit_amount: 0,
    application_link: '',
    processing_time_days: 15,
    status: 'Active',
    verification_status: 'Verified',
    source_url: '',
    required_docs_text: 'Aadhaar Card, Bank Account Details',
    optional_docs_text: 'Land Records',
    tags_text: 'agriculture, farmers, financial aid',
    min_age: 18,
    max_age: 70,
    gender: 'Any',
    max_annual_income: 200000,
    occupations_text: 'Farmer, Agriculture Worker',
    caste_text: 'General, OBC, SC, ST, EWS'
  });

  const loadSchemes = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSchemes({
        search,
        category: categoryFilter,
        status: statusFilter
      });
      setSchemes(res.schemes || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load schemes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSchemes();
  };

  const handleOpenAddModal = () => {
    setEditingScheme(null);
    setFormData({
      scheme_name: '',
      short_name: '',
      ministry: 'Ministry of Agriculture and Farmers Welfare',
      level: 'Central',
      state: 'All-India',
      category: 'Farmer & Agriculture',
      description: '',
      key_benefits: '',
      benefit_amount: 6000,
      application_link: 'https://pmkisan.gov.in',
      processing_time_days: 15,
      status: 'Active',
      verification_status: 'Verified',
      source_url: 'https://data.gov.in',
      required_docs_text: 'Aadhaar Card, Bank Account Details',
      optional_docs_text: 'Land Records',
      tags_text: 'agriculture, farmers, financial aid',
      min_age: 18,
      max_age: 70,
      gender: 'Any',
      max_annual_income: 200000,
      occupations_text: 'Farmer, Agriculture Worker',
      caste_text: 'General, OBC, SC, ST, EWS'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: any) => {
    setEditingScheme(s);
    setFormData({
      scheme_name: s.scheme_name,
      short_name: s.short_name,
      ministry: s.ministry,
      level: s.level || 'Central',
      state: s.state || 'All-India',
      category: s.category,
      description: s.description,
      key_benefits: s.key_benefits,
      benefit_amount: s.benefit_amount || 0,
      application_link: s.application_link,
      processing_time_days: s.processing_time_days || 15,
      status: s.status || 'Active',
      verification_status: s.verification_status || 'Verified',
      source_url: s.source_url || '',
      required_docs_text: (s.required_documents || []).join(', '),
      optional_docs_text: (s.optional_documents || []).join(', '),
      tags_text: (s.tags || []).join(', '),
      min_age: s.eligibility_criteria?.min_age || 0,
      max_age: s.eligibility_criteria?.max_age || 120,
      gender: s.eligibility_criteria?.gender || 'Any',
      max_annual_income: s.eligibility_criteria?.max_annual_income || 0,
      occupations_text: (s.eligibility_criteria?.occupation || []).join(', '),
      caste_text: (s.eligibility_criteria?.caste_category || []).join(', ')
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.scheme_name.trim() || !formData.short_name.trim() || !formData.application_link.trim()) {
      showToast('Please fill in all mandatory fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        scheme_name: formData.scheme_name.trim(),
        short_name: formData.short_name.trim(),
        ministry: formData.ministry.trim(),
        level: formData.level,
        state: formData.state,
        category: formData.category,
        description: formData.description.trim(),
        key_benefits: formData.key_benefits.trim(),
        benefit_amount: Number(formData.benefit_amount) || 0,
        application_link: formData.application_link.trim(),
        processing_time_days: Number(formData.processing_time_days) || 15,
        status: formData.status,
        verification_status: formData.verification_status,
        source_url: formData.source_url.trim() || undefined,
        required_documents: formData.required_docs_text.split(',').map(d => d.trim()).filter(Boolean),
        optional_documents: formData.optional_docs_text.split(',').map(d => d.trim()).filter(Boolean),
        tags: formData.tags_text.split(',').map(t => t.trim()).filter(Boolean),
        eligibility_criteria: {
          min_age: Number(formData.min_age) || 0,
          max_age: Number(formData.max_age) || 120,
          gender: formData.gender,
          max_annual_income: formData.max_annual_income ? Number(formData.max_annual_income) : null,
          landholding_required: false,
          occupation: formData.occupations_text.split(',').map(o => o.trim()).filter(Boolean),
          caste_category: formData.caste_text.split(',').map(c => c.trim()).filter(Boolean),
          exclusions: []
        }
      };

      if (editingScheme) {
        await adminService.updateScheme(editingScheme.scheme_id, payload);
        showToast(`Scheme '${payload.short_name}' successfully updated.`, 'success');
      } else {
        await adminService.createScheme(payload);
        showToast(`New scheme '${payload.short_name}' published to portal.`, 'success');
      }

      setIsModalOpen(false);
      loadSchemes();
    } catch (err: any) {
      showToast(err.message || 'Operation failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (scheme: any) => {
    const nextStatus = scheme.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await adminService.updateSchemeStatus(scheme.scheme_id, nextStatus);
      showToast(`Scheme status updated to '${nextStatus}'`, 'info');
      loadSchemes();
    } catch (err: any) {
      showToast(err.message || 'Status update failed.', 'error');
    }
  };

  const handleArchive = async (scheme: any) => {
    if (!window.confirm(`Archive scheme '${scheme.short_name}'? It will be deactivated from public citizen search.`)) return;
    try {
      await adminService.archiveScheme(scheme.scheme_id);
      showToast(`Scheme '${scheme.short_name}' archived.`, 'info');
      loadSchemes();
    } catch (err: any) {
      showToast(err.message || 'Archive failed.', 'error');
    }
  };

  const categories = [
    'All',
    'Farmer & Agriculture',
    'Housing & Shelter',
    'Health & Medical',
    'Women & Child',
    'Youth & Employment',
    'Education & Skills',
    'Social Security'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-govblue-700" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              Government Welfare Scheme Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage official citizen schemes, eligibility criteria, benefit ceilings, and official portal links.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Scheme</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search scheme name, ministry, or tag..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:border-govblue-600 outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.slice(1).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>

          <button
            onClick={loadSchemes}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Reload schemes"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Schemes Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold">
            <div className="animate-spin w-6 h-6 border-2 border-govblue-600 border-t-transparent rounded-full mx-auto mb-2" />
            Loading scheme records...
          </div>
        ) : schemes.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-medium">
            No schemes found matching the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Scheme Details</th>
                  <th className="px-4 py-3.5">Ministry & Level</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Benefit Pool</th>
                  <th className="px-4 py-3.5">Quality & Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schemes.map((s) => {
                  const isActive = (s.status || 'Active') === 'Active';
                  const isVerified = (s.verification_status || 'Verified') === 'Verified';

                  return (
                    <tr key={s.scheme_id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">{s.short_name}</div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 max-w-sm">{s.scheme_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-slate-400">{s.scheme_id}</span>
                          {s.application_link && (
                            <a
                              href={s.application_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-sky-600 hover:underline flex items-center gap-0.5"
                            >
                              <span>Official Link</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-slate-800 font-medium block truncate max-w-[200px]">{s.ministry}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{s.level || 'Central'} • {s.state || 'All-India'}</span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-700 text-[11px]">
                          {s.category}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-mono font-bold text-slate-900">
                          {s.benefit_amount > 0 ? `₹${Number(s.benefit_amount).toLocaleString()}` : 'Subsidy / Service'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{s.processing_time_days || 15} days processing</span>
                      </td>

                      <td className="px-4 py-4 space-y-1">
                        <div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {s.status || 'Active'}
                          </span>
                        </div>
                        <div>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              isVerified
                                ? 'bg-sky-50 text-sky-700'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {isVerified ? 'Verified Data' : 'Needs Review'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(s)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                            title="Edit Scheme"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(s)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                              isActive
                                ? 'border border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={isActive ? 'Deactivate scheme' : 'Activate scheme'}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleArchive(s)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Archive scheme"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl border border-slate-200 p-6 my-8 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-heading font-black text-lg text-slate-900">
                {editingScheme ? `Edit Scheme: ${editingScheme.short_name}` : 'Publish New Welfare Scheme'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheme Official Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.scheme_name}
                    onChange={e => setFormData({ ...formData, scheme_name: e.target.value })}
                    placeholder="e.g. Pradhan Mantri Kisan Samman Nidhi"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-govblue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Short Code / Acronym *</label>
                  <input
                    type="text"
                    required
                    value={formData.short_name}
                    onChange={e => setFormData({ ...formData, short_name: e.target.value })}
                    placeholder="e.g. PM-KISAN"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-govblue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ministry</label>
                  <input
                    type="text"
                    value={formData.ministry}
                    onChange={e => setFormData({ ...formData, ministry: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-govblue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white outline-none cursor-pointer"
                  >
                    {categories.slice(1).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Level & State</label>
                  <select
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white outline-none cursor-pointer"
                  >
                    <option value="All-India">Central (All-India)</option>
                    <option value="Karnataka">State (Karnataka)</option>
                    <option value="Maharashtra">State (Maharashtra)</option>
                    <option value="Tamil Nadu">State (Tamil Nadu)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scheme Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Official scheme mandate, target beneficiaries, and core assistance details..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-govblue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Benefits Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.key_benefits}
                  onChange={e => setFormData({ ...formData, key_benefits: e.target.value })}
                  placeholder="e.g. ₹6,000 per year directly transferred in three equal four-monthly installments"
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-govblue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Benefit Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.benefit_amount}
                    onChange={e => setFormData({ ...formData, benefit_amount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-govblue-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Processing Time (Days)</label>
                  <input
                    type="number"
                    value={formData.processing_time_days}
                    onChange={e => setFormData({ ...formData, processing_time_days: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-govblue-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Verification Quality</label>
                  <select
                    value={formData.verification_status}
                    onChange={e => setFormData({ ...formData, verification_status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white outline-none cursor-pointer"
                  >
                    <option value="Verified">Verified (Official Source)</option>
                    <option value="Needs Review">Needs Review</option>
                    <option value="Outdated">Outdated Guidelines</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Portal Application URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.application_link}
                    onChange={e => setFormData({ ...formData, application_link: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-govblue-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Source Verification URL</label>
                  <input
                    type="url"
                    value={formData.source_url}
                    onChange={e => setFormData({ ...formData, source_url: e.target.value })}
                    placeholder="https://data.gov.in/..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-govblue-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Required Documents (comma separated)</label>
                  <input
                    type="text"
                    value={formData.required_docs_text}
                    onChange={e => setFormData({ ...formData, required_docs_text: e.target.value })}
                    placeholder="Aadhaar Card, Bank Passbook, Ration Card"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-govblue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Search Keywords / Tags</label>
                  <input
                    type="text"
                    value={formData.tags_text}
                    onChange={e => setFormData({ ...formData, tags_text: e.target.value })}
                    placeholder="farmers, subsidy, DBT, income"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-govblue-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-5 py-2 text-xs font-bold shadow-sm"
                >
                  {submitting ? 'Saving...' : editingScheme ? 'Save Changes' : 'Publish Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
