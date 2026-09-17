import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Scheme } from '../types';
import { schemeService } from '../services/schemeService';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { Button } from '../components/ui/Button';
import { Drawer } from '../components/ui/Drawer';
import { SchemeCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { translateCategory } from '../i18n';

export const SchemeExplorerPage: React.FC = () => {
  const { t, language } = useAccessibility();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialLevel = searchParams.get('level') || 'All';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState(initialLevel);
  const [selectedState, setSelectedState] = useState('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'name' | 'benefit'>('recommended');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const cats = await schemeService.getCategories();
      setCategories(cats);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      const data = await schemeService.getAllSchemes({
        category: selectedCategory,
        state: selectedState,
        search
      });
      setSchemes(data);
      setLoading(false);
    };

    const timer = setTimeout(() => {
      fetchSchemes();
    }, 250); // Debounce search

    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedState]);

  // Sorting
  const sortedSchemes = [...schemes].sort((a, b) => {
    if (sortBy === 'name') return a.short_name.localeCompare(b.short_name);
    if (sortBy === 'benefit') return b.benefit_amount - a.benefit_amount;
    return (b.match_score || 0) - (a.match_score || 0);
  });

  // Filter components
  const FilterContent = (
    <div className="flex flex-col gap-6 text-xs">
      {/* Level filter */}
      <div>
        <label className="font-bold text-slate-800 uppercase tracking-wider block mb-2">
          {t('explorer_jurisdiction')}
        </label>
        <div className="flex flex-col gap-1.5">
          {['All', 'Central', 'State'].map(lvl => (
            <label key={lvl} className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="radio"
                name="level"
                checked={selectedLevel === lvl}
                onChange={() => setSelectedLevel(lvl)}
                className="text-govblue-800 focus:ring-govblue-600"
              />
              <span>
                {lvl === 'All'
                  ? t('explorer_all_jur')
                  : lvl === 'Central'
                  ? t('explorer_central_schemes')
                  : t('explorer_state_schemes')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* State filter */}
      <div>
        <label className="font-bold text-slate-800 uppercase tracking-wider block mb-2">
          {t('explorer_state_focus')}
        </label>
        <select
          value={selectedState}
          onChange={e => setSelectedState(e.target.value)}
          className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
        >
          <option value="All">All States (National + Karnataka)</option>
          <option value="All-India">Central (All-India)</option>
          <option value="Karnataka">Karnataka State Only</option>
        </select>
      </div>

      {/* Category filter */}
      <div>
        <label className="font-bold text-slate-800 uppercase tracking-wider block mb-2">
          {t('Category', 'Category')}
        </label>
        <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === 'All'}
              onChange={() => setSelectedCategory('All')}
              className="text-govblue-800 focus:ring-govblue-600"
            />
            <span>{t('cat_all')}</span>
          </label>
          {categories.map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat}
                onChange={() => setSelectedCategory(cat)}
                className="text-govblue-800 focus:ring-govblue-600"
              />
              <span className="truncate">{translateCategory(cat, language)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset filters */}
      {(selectedCategory !== 'All' || selectedState !== 'All' || search) && (
        <button
          onClick={() => {
            setSelectedCategory('All');
            setSelectedState('All');
            setSelectedLevel('All');
            setSearch('');
          }}
          className="text-govblue-800 font-bold hover:underline self-start"
        >
          {t('Reset all filters', 'Reset all filters')}
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header & Search */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mb-2">
          {t('explorer_title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          {t('explorer_subtitle')}
        </p>
      </div>

      {/* Central Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('explorer_search_placeholder')}
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-govblue-600 outline-none shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle Button */}
        <Button
          variant="secondary"
          size="md"
          onClick={() => setMobileFilterOpen(true)}
          leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          className="lg:hidden w-full sm:w-auto"
        >
          {t('Filters', 'Filters')}
        </Button>

        {/* Sort selector */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white"
          >
            <option value="recommended">{t('sort_recommended')}</option>
            <option value="name">{t('sort_name')}</option>
            <option value="benefit">{t('sort_benefit')}</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Persistent Sidebar + Scheme Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle sticky top-24">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-govblue-800" />
                <span>{t('Filters', 'Filters')}</span>
              </h2>
              <span className="text-xs text-slate-500 font-semibold">{sortedSchemes.length} found</span>
            </div>
            {FilterContent}
          </div>
        </div>

        {/* Scheme Cards Grid */}
        <div className="lg:col-span-9">
          <div className="mb-4 text-xs font-bold text-slate-500">
            {t('Showing', 'Showing')} {sortedSchemes.length} {t('Schemes', 'Schemes')}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <SchemeCardSkeleton key={i} />
              ))}
            </div>
          ) : sortedSchemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedSchemes.map(scheme => (
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
              icon="search"
              title="No matching schemes found"
              description="Try adjusting your keyword or resetting the category filter to explore other available welfare programs."
              actionText="Reset Search"
              onAction={() => {
                setSearch('');
                setSelectedCategory('All');
              }}
            />
          )}
        </div>
      </div>

      {/* Mobile Drawer for Filters */}
      <Drawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        title="Filter Schemes"
      >
        {FilterContent}
        <div className="pt-6 mt-6 border-t border-slate-200">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => setMobileFilterOpen(false)}
          >
            Show {sortedSchemes.length} Results
          </Button>
        </div>
      </Drawer>
    </div>
  );
};
