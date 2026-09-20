import React from 'react';
import { FilterState, PropertyType, FurnishingStatus } from '../types';
import { AMENITIES_LIST } from '../data/sampleListings';
import { X, Check, RotateCcw, SlidersHorizontal, ArrowLeft, Building2, Home, Sparkles, CheckCircle2 } from 'lucide-react';

interface PropertyFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalResultsCount: number;
  currencySymbol: string;
}

export const PropertyFiltersModal: React.FC<PropertyFiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
  totalResultsCount,
  currencySymbol
}) => {
  if (!isOpen) return null;

  const PROPERTY_TYPES: { label: string; value: PropertyType | 'all' }[] = [
    { label: 'All Types', value: 'all' },
    { label: 'Apartment', value: 'apartment' },
    { label: 'Villa', value: 'villa' },
    { label: 'Penthouse', value: 'penthouse' },
    { label: 'Independent House', value: 'independent_house' },
    { label: 'Studio', value: 'studio' },
    { label: 'Duplex', value: 'duplex' },
    { label: 'Commercial Office', value: 'commercial' }
  ];

  const FURNISHING_OPTIONS: { label: string; value: FurnishingStatus | 'all' }[] = [
    { label: 'Any Furnishing', value: 'all' },
    { label: 'Fully Furnished', value: 'furnished' },
    { label: 'Semi-Furnished', value: 'semi_furnished' },
    { label: 'Unfurnished', value: 'unfurnished' }
  ];

  const handleAmenityToggle = (amenity: string) => {
    const current = filters.amenities;
    if (current.includes(amenity)) {
      onFilterChange({ amenities: current.filter(a => a !== amenity) });
    } else {
      onFilterChange({ amenities: [...current, amenity] });
    }
  };

  return (
    <div
      id="filters-fullscreen-container"
      className="fixed inset-0 z-50 bg-slate-50 flex flex-col w-full h-full animate-fade-in overflow-hidden"
    >
      {/* Full-screen Top Header Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            id="btn-filters-back"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Search & Filter Properties</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">
              Set your preferences for property type, BHK, furnishing, budget & verified amenities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-reset-filters-top"
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 py-1.5 px-3 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
          <button
            id="btn-filters-close"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Full-screen Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* SECTION 1: Looking To (Listing Type) */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
            <label className="block font-bold text-xs text-slate-900 uppercase tracking-wider">
              Looking To (Purpose)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'All Listings', value: 'all', desc: 'Buy & Rentals' },
                { label: 'Buy Homes', value: 'sale', desc: 'Resale & New Projects' },
                { label: 'Rentals', value: 'rent', desc: 'Flats & Houses' }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onFilterChange({ listingType: item.value as any })}
                  className={`py-3 px-4 rounded-xl font-semibold text-left transition-all border ${
                    filters.listingType === item.value
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-bold">{item.label}</div>
                  <div className="text-[11px] text-slate-500 font-normal hidden sm:block mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2: Property Category */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
            <label className="block font-bold text-xs text-slate-900 uppercase tracking-wider">
              Property Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PROPERTY_TYPES.map((pt) => (
                <button
                  key={pt.label}
                  type="button"
                  onClick={() => onFilterChange({ propertyType: pt.value })}
                  className={`py-2.5 px-3 rounded-xl font-medium text-xs transition-all border text-left ${
                    filters.propertyType === pt.value
                      ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3: Bedrooms / BHK */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
            <label className="block font-bold text-xs text-slate-900 uppercase tracking-wider">
              Bedrooms (BHK)
            </label>
            <div className="flex flex-wrap gap-2.5">
              {[
                { label: 'Any BHK', value: 'all' },
                { label: '1 BHK', value: 1 },
                { label: '2 BHK', value: 2 },
                { label: '3 BHK', value: 3 },
                { label: '4 BHK', value: 4 },
                { label: '5+ BHK', value: 5 }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onFilterChange({ bedrooms: item.value as any })}
                  className={`py-2 px-4 rounded-xl font-semibold text-xs transition-all border ${
                    filters.bedrooms === item.value
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 4: Furnishing Status */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
            <label className="block font-bold text-xs text-slate-900 uppercase tracking-wider">
              Furnishing Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {FURNISHING_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onFilterChange({ furnishing: opt.value })}
                  className={`py-2.5 px-3 text-center rounded-xl font-medium text-xs transition-all border ${
                    filters.furnishing === opt.value
                      ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 5: Amenities & Features */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-xs text-slate-900 uppercase tracking-wider">
                Amenities & Facilities
              </label>
              <span className="text-xs text-slate-500">
                {filters.amenities.length} selected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {AMENITIES_LIST.map((amenity) => {
                const isSelected = filters.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-between border transition-all text-left ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-semibold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate mr-1">{amenity}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 6: Trust & Verification Badges */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
            <label className="block font-bold text-xs text-slate-900 uppercase tracking-wider">
              Verification & Trust
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Verified Listings Only</span>
                    <span className="text-[11px] text-slate-500">Physically inspected with verified documents</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => onFilterChange({ verifiedOnly: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Featured & VIP Properties</span>
                    <span className="text-[11px] text-slate-500">Top ranked luxury and prime listings</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filters.featuredOnly}
                  onChange={(e) => onFilterChange({ featuredOnly: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>

        </div>
      </main>

      {/* Full-screen Sticky Bottom Action Bar */}
      <footer className="bg-white border-t border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0 sticky bottom-0 z-20 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            id="btn-reset-filters-bottom"
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
        <button
          id="btn-apply-filters"
          type="button"
          onClick={onClose}
          className="py-2.5 px-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          <span>Show {totalResultsCount} Matching Properties</span>
        </button>
      </footer>
    </div>
  );
};
