import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ExternalLink, 
  FileText, 
  CheckCircle, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Scheme } from '../types';
import { fetchSchemes } from '../api';
import { t } from '../i18n';

interface SchemeCatalogProps {
  language: string;
  onSelectScheme: (scheme: Scheme) => void;
  onNavigateToChecklist: (schemeId: string) => void;
  onNavigateToEligibility: () => void;
  initialCategory?: string;
}

export const SchemeCatalog: React.FC<SchemeCatalogProps> = ({
  language,
  onSelectScheme,
  onNavigateToChecklist,
  onNavigateToEligibility,
  initialCategory = 'All'
}) => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState('All');

  useEffect(() => {
    fetchSchemes()
      .then((data) => setSchemes(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const categories = [
    'All',
    'Agriculture',
    'Healthcare',
    'Housing',
    'Education',
    'Women Welfare',
    'Financial Security',
    'Social Welfare'
  ];

  const filteredSchemes = useMemo(() => {
    return schemes.filter((scheme) => {
      const matchesQuery = !searchQuery || 
        scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || 
        scheme.category.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchesLevel = selectedLevel === 'All' || 
        scheme.level.toLowerCase() === selectedLevel.toLowerCase();

      return matchesQuery && matchesCategory && matchesLevel;
    });
  }, [schemes, searchQuery, selectedCategory, selectedLevel]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Search & Filter Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              Government Welfare Scheme Catalog
            </h2>
            <p className="text-xs text-slate-500">
              Browse 30+ verified Central and Karnataka State schemes with 1-click criteria evaluations.
            </p>
          </div>

          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheme by name, benefits, or department..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:border-crimson-600 outline-none font-medium"
            />
          </div>
        </div>

        {/* Level and Category Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-crimson-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className="text-slate-500">Level:</span>
            {['All', 'Central', 'Karnataka'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scheme Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 animate-pulse">
              <div className="w-1/3 h-5 bg-slate-200 rounded" />
              <div className="w-3/4 h-6 bg-slate-200 rounded" />
              <div className="w-full h-12 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between hover:border-crimson-200 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`badge text-[10px] font-extrabold px-2 py-0.5 ${
                    scheme.level === 'Central' ? 'badge-blue' : 'badge-crimson'
                  }`}>
                    {scheme.level === 'Central' ? 'Central Scheme' : 'Karnataka State'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {scheme.category}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 group-hover:text-crimson-700 transition leading-snug">
                  {scheme.name}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                  {scheme.department}
                </p>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {scheme.description}
                </p>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-xs">
                  <strong className="block text-[10px] uppercase font-bold text-emerald-800">Benefit:</strong>
                  <span className="line-clamp-2">{scheme.benefits}</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => onSelectScheme(scheme)}
                  className="font-bold text-crimson-700 hover:text-crimson-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onNavigateToChecklist(scheme.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Documents</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
