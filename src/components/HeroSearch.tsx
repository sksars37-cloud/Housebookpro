import React from 'react';
import { Search, MapPin, Building, SlidersHorizontal, Sparkles, ShieldCheck, Tv, Coins } from 'lucide-react';
import { FilterState, ListingType } from '../types';
import { CITIES_LIST } from '../data/sampleListings';

interface HeroSearchProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onOpenFilters: () => void;
  onOpenUpiModal: () => void;
  onOpenKycModal: () => void;
  onOpenAdsense: () => void;
  activeFiltersCount: number;
  totalCount: number;
  currencySymbol: string;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onOpenFilters,
  onOpenUpiModal,
  onOpenKycModal,
  onOpenAdsense,
  activeFiltersCount,
  totalCount,
  currencySymbol
}) => {
  const BHK_OPTIONS = [
    { label: 'All BHK', value: 'all' },
    { label: '1 BHK', value: 1 },
    { label: '2 BHK', value: 2 },
    { label: '3 BHK', value: 3 },
    { label: '4+ BHK', value: 4 },
  ];

  return (
    <div className="relative bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white pt-4 pb-5 px-3 sm:px-6 overflow-hidden rounded-2xl sm:rounded-3xl mx-3 sm:mx-6 my-2 shadow-lg">
      {/* Background decorations */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        
        {/* Compact Title & Subtitle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3">
          <div className="text-left sm:flex-1">
            <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Find Verified Homes on</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-200 to-indigo-200">
                HouseBook
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 font-normal mt-0.5">
              Zero brokerage listings, instant direct owner chat, and verified property legal checks.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAdsense}
              className="px-2 py-1 bg-white/10 hover:bg-white/20 text-amber-300 border border-white/15 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all"
            >
              <Tv className="w-3 h-3 text-amber-400" />
              <span>Watch Ads (+15 🪙)</span>
            </button>
            <button
              onClick={onOpenKycModal}
              className="px-2 py-1 bg-white/10 hover:bg-white/20 text-emerald-300 border border-white/15 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>KYC Hub</span>
            </button>
          </div>
        </div>

        {/* Compact Search & Filter Box Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-slate-900 shadow-xl border border-white/20 text-left">
          
          {/* Top Filter Bar: Tabs & Count */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <button
                id="hero-tab-all"
                type="button"
                onClick={() => onFilterChange({ listingType: 'all' })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filters.listingType === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              <button
                id="hero-tab-buy"
                type="button"
                onClick={() => onFilterChange({ listingType: 'sale' })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filters.listingType === 'sale'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Buy
              </button>
              <button
                id="hero-tab-rent"
                type="button"
                onClick={() => onFilterChange({ listingType: 'rent' })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filters.listingType === 'rent'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Rent
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>{totalCount} properties</span>
            </div>
          </div>

          {/* Search Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
            
            {/* City Dropdown */}
            <div className="sm:col-span-3 relative">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mr-1.5" />
                <select
                  id="hero-city-select"
                  value={filters.city}
                  onChange={(e) => onFilterChange({ city: e.target.value })}
                  className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Cities</option>
                  <option value="bengaluru">Bengaluru</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="delhi">Delhi NCR</option>
                  <option value="pune">Pune</option>
                  <option value="hyderabad">Hyderabad</option>
                </select>
              </div>
            </div>

            {/* Keyword / Locality Search */}
            <div className="sm:col-span-6 relative">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1.5" />
                <input
                  id="hero-search-input"
                  type="text"
                  placeholder="Locality, project, landmark..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="text-xs text-slate-400 hover:text-slate-600 px-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filter Modal Trigger & Search Button */}
            <div className="sm:col-span-3 flex items-center gap-1.5">
              <button
                id="hero-more-filters-btn"
                type="button"
                onClick={onOpenFilters}
                className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                title="All Filters"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
              </button>
              <button
                id="hero-search-action-btn"
                type="button"
                className="py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center justify-center gap-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find</span>
              </button>
            </div>
          </div>

          {/* Compact BHK Quick Selection Chips */}
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-semibold text-slate-500 shrink-0 mr-1">
              BHK:
            </span>
            {BHK_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                id={`chip-bhk-${opt.value}`}
                type="button"
                onClick={() => onFilterChange({ bedrooms: opt.value as any })}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                  filters.bedrooms === opt.value
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300 font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
