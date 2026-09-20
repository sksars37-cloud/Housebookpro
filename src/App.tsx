import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './context/AuthContext';
import { db, collection, query, orderBy, onSnapshot, testConnection } from './lib/firebase';
import { Property, FilterState, CurrencyCode } from './types';
import { SAMPLE_PROPERTIES } from './data/sampleListings';

// Components
import { SplashScreen } from './components/SplashScreen';
import { AuthModal } from './components/AuthModal';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HeroSearch } from './components/HeroSearch';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { PropertyFiltersModal } from './components/PropertyFilters';
import { AddPropertyModal } from './components/AddPropertyModal';
import { CoinRewardCenter } from './components/CoinRewardCenter';
import { ChatSystem } from './components/ChatSystem';
import { AdSensePlayerModal } from './components/AdSensePlayerModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { UpiPaymentModal } from './components/UpiPaymentModal';
import { KycLegalModal } from './components/KycLegalModal';
import { NotificationCenter } from './components/NotificationCenter';
import { UserProfileSettings } from './components/UserProfileSettings';
import { OwnerProfileModal } from './components/OwnerProfileModal';
import { SharePropertyModal } from './components/SharePropertyModal';

import {
  Building2,
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
  Plus,
  Coins,
  Crown,
  Heart,
  MessageSquare,
  Scale,
  Bell,
  User,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  MapPin,
  HelpCircle,
  Tv
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const { user, profile, unlockContact, addCoins } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  const favorites = profile?.savedProperties || [];

  // Currency State
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€';

  // Navigation / Tabs: 'explore' | 'shortlist' | 'chats' | 'legal'
  const [activeTab, setActiveTab] = useState<'explore' | 'shortlist' | 'chats' | 'legal'>('explore');

  // Properties State with local storage cache
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem('housebook_custom_properties');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...SAMPLE_PROPERTIES.filter(sp => !parsed.some(p => p.id === sp.id))];
        }
      }
    } catch {}
    return SAMPLE_PROPERTIES;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    listingType: 'all',
    city: 'all',
    propertyType: 'all',
    minPrice: 0,
    maxPrice: 100000000,
    bedrooms: 'all',
    bathrooms: 'all',
    furnishing: 'all',
    amenities: [],
    verifiedOnly: false,
    featuredOnly: false,
    sortBy: 'newest'
  });

  // Selected property for detail view
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [addPropertyModalOpen, setAddPropertyModalOpen] = useState(false);
  const [coinRewardModalOpen, setCoinRewardModalOpen] = useState(false);
  const [adsenseModalOpen, setAdsenseModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const [ownerProfileData, setOwnerProfileData] = useState<{
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
    email?: string;
    role?: string;
    bio?: string;
  } | null>(null);
  const [shareProp, setShareProp] = useState<Property | null>(null);
  const [initialPropertyForChat, setInitialPropertyForChat] = useState<Property | null>(null);

  // Health check test connection on startup
  useEffect(() => {
    testConnection();
  }, []);

  // Load properties from Firestore with local fallback
  useEffect(() => {
    try {
      const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreList: Property[] = [];
        snapshot.forEach((docSnap) => {
          firestoreList.push({ id: docSnap.id, ...docSnap.data() } as Property);
        });
        if (firestoreList.length > 0) {
          const merged = [...firestoreList, ...SAMPLE_PROPERTIES.filter(sp => !firestoreList.some(fp => fp.id === sp.id))];
          setProperties(merged);
        }
      }, (err) => {
        console.warn('Properties snapshot notice (operating with local dataset):', err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore not initialized yet, operating with local sample dataset.');
    }
  }, []);

  // Handle local persistence when new property is added
  const handlePropertyAdded = (newProp: Property) => {
    setProperties(prev => {
      const updated = [newProp, ...prev.filter(p => p.id !== newProp.id)];
      try {
        const customOnly = updated.filter(p => !SAMPLE_PROPERTIES.some(sp => sp.id === p.id));
        localStorage.setItem('housebook_custom_properties', JSON.stringify(customOnly));
      } catch {}
      return updated;
    });
  };

  // Filter properties logic
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // Search query in title, locality, city, address
      const queryStr = searchQuery.trim() || filters.searchQuery.trim();
      if (queryStr) {
        const q = queryStr.toLowerCase();
        const matchTitle = prop.title.toLowerCase().includes(q);
        const matchLoc = prop.locality.toLowerCase().includes(q);
        const matchCity = prop.city.toLowerCase().includes(q);
        const matchAddr = prop.address.toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchCity && !matchAddr) return false;
      }

      // Listing type (sale / rent)
      if (filters.listingType !== 'all' && prop.listingType !== filters.listingType) {
        return false;
      }

      // Property type
      if (filters.propertyType !== 'all' && prop.propertyType !== filters.propertyType) {
        return false;
      }

      // Bedrooms
      if (filters.bedrooms !== 'all') {
        const targetBhk = Number(filters.bedrooms);
        if (targetBhk === 4) {
          if (prop.bedrooms < 4) return false;
        } else {
          if (prop.bedrooms !== targetBhk) return false;
        }
      }

      // Furnishing
      if (filters.furnishing !== 'all' && prop.furnishing !== filters.furnishing) {
        return false;
      }

      // Verified Only
      if (filters.verifiedOnly && !prop.isVerified) {
        return false;
      }

      // Featured Only
      if (filters.featuredOnly && !prop.isFeatured) {
        return false;
      }

      // City filter
      if (filters.city !== 'all' && prop.city.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }

      // Amenities
      if (filters.amenities.length > 0) {
        const hasAll = filters.amenities.every(am => prop.amenities.includes(am));
        if (!hasAll) return false;
      }

      return true;
    });
  }, [properties, searchQuery, filters]);

  // Shortlisted properties
  const shortlistedProperties = useMemo(() => {
    return properties.filter(p => favorites.includes(p.id));
  }, [properties, favorites]);

  const handleStartChatWithProperty = (property: Property) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setInitialPropertyForChat(property);
    setActiveTab('chats');
  };

  const handleUnlockPhoneForProperty = async (property: Property) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    await unlockContact(property.id);
  };

  const handleOpenAddProperty = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setAddPropertyModalOpen(true);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.listingType !== 'all') count++;
    if (filters.propertyType !== 'all') count++;
    if (filters.bedrooms !== 'all') count++;
    if (filters.furnishing !== 'all') count++;
    if (filters.verifiedOnly) count++;
    if (filters.featuredOnly) count++;
    if (filters.city !== 'all') count++;
    count += filters.amenities.length;
    return count;
  }, [filters]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col selection:bg-indigo-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currency={currency}
        onCurrencyChange={setCurrency}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenAddProperty={handleOpenAddProperty}
        onOpenCoinCenter={() => setCoinRewardModalOpen(true)}
        onOpenSubscription={() => setSubscriptionModalOpen(true)}
        onOpenUpiModal={() => setUpiModalOpen(true)}
        onOpenKycModal={() => setKycModalOpen(true)}
        onOpenNotifications={() => setNotifModalOpen(true)}
        onOpenUserSettings={() => setUserSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 pb-24 sm:pb-16">
        
        {/* TAB 1: EXPLORE / HOME */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            
            {/* Hero Search Section */}
            <HeroSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFilterChange={(updates) => setFilters(prev => ({ ...prev, ...updates }))}
              onOpenFilters={() => setFiltersOpen(true)}
              onOpenUpiModal={() => setUpiModalOpen(true)}
              onOpenKycModal={() => setKycModalOpen(true)}
              onOpenAdsense={() => setAdsenseModalOpen(true)}
              activeFiltersCount={activeFiltersCount}
              totalCount={filteredProperties.length}
              currencySymbol={currencySymbol}
            />

            {/* Content Listing Grid Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <span>Verified Real Estate Listings</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {filteredProperties.length} found
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Direct owner listings, verified documentation & 3D virtual tours
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFiltersOpen(true)}
                    className="flex items-center gap-1.5 py-2 px-3.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                  </button>
                </div>
              </div>

              {/* Listings Grid */}
              {filteredProperties.length === 0 ? (
                <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 max-w-lg mx-auto my-12">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">No properties matched your filters</h3>
                  <p className="text-xs text-slate-500">
                    Try adjusting your search criteria, clearing filters, or switching cities to explore more properties.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({
                        searchQuery: '',
                        listingType: 'all',
                        city: 'all',
                        propertyType: 'all',
                        minPrice: 0,
                        maxPrice: 100000000,
                        bedrooms: 'all',
                        bathrooms: 'all',
                        furnishing: 'all',
                        amenities: [],
                        verifiedOnly: false,
                        featuredOnly: false,
                        sortBy: 'newest'
                      });
                    }}
                    className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onSelect={(prop) => setSelectedProperty(prop)}
                      onStartChat={handleStartChatWithProperty}
                      onUnlockPhone={handleUnlockPhoneForProperty}
                      onShareProperty={(prop) => setShareProp(prop)}
                      onViewOwnerProfile={(owner) => setOwnerProfileData(owner)}
                      currencySymbol={currencySymbol}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SHORTLISTED PROPERTIES */}
        {activeTab === 'shortlist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
                  <span>My Shortlisted Properties</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your saved dream homes and investment properties ({shortlistedProperties.length})
                </p>
              </div>
            </div>

            {shortlistedProperties.length === 0 ? (
              <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3 max-w-md mx-auto my-12">
                <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-base text-slate-800">Your Shortlist is Empty</h3>
                <p className="text-xs text-slate-500">
                  Click the heart icon on any property card while exploring to save it to your shortlist for easy comparison.
                </p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
                >
                  Explore Properties
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shortlistedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onSelect={(prop) => setSelectedProperty(prop)}
                    onStartChat={handleStartChatWithProperty}
                    onUnlockPhone={handleUnlockPhoneForProperty}
                    onShareProperty={(prop) => setShareProp(prop)}
                    onViewOwnerProfile={(owner) => setOwnerProfileData(owner)}
                    currencySymbol={currencySymbol}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CHATS */}
        {activeTab === 'chats' && (
          <ChatSystem
            initialPropertyForChat={initialPropertyForChat}
            onClearInitialProperty={() => setInitialPropertyForChat(null)}
            onViewPropertyDetails={(propId) => {
              const found = properties.find(p => p.id === propId);
              if (found) setSelectedProperty(found);
            }}
            onViewOwnerProfile={(owner) => setOwnerProfileData(owner)}
            currencySymbol={currencySymbol}
          />
        )}

        {/* TAB 4: LEGAL HUB */}
        {activeTab === 'legal' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-md text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto">
                <Scale className="w-8 h-8" />
              </div>
              <h2 className="font-extrabold text-2xl text-slate-900">HouseBook Legal & KYC Registry</h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Verify your identity, sign e-stamped 11-month rental agreements, and execute sale MOUs securely with national legal registry stamps.
              </p>
              <button
                onClick={() => setKycModalOpen(true)}
                className="py-3 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/20 transition-all inline-flex items-center gap-2"
              >
                <span>Open KYC & Legal Workspace</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddProperty={handleOpenAddProperty}
      />

      {/* MODALS */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <PropertyDetailModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onStartChat={handleStartChatWithProperty}
        onUnlockPhone={handleUnlockPhoneForProperty}
        onShareProperty={(prop) => setShareProp(prop)}
        onViewOwnerProfile={(owner) => setOwnerProfileData(owner)}
        currencySymbol={currencySymbol}
      />

      <PropertyFiltersModal
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onFilterChange={(updates) => setFilters(prev => ({ ...prev, ...updates }))}
        onResetFilters={() => {
          setFilters({
            searchQuery: '',
            listingType: 'all',
            city: 'all',
            propertyType: 'all',
            minPrice: 0,
            maxPrice: 100000000,
            bedrooms: 'all',
            bathrooms: 'all',
            furnishing: 'all',
            amenities: [],
            verifiedOnly: false,
            featuredOnly: false,
            sortBy: 'newest'
          });
        }}
        totalResultsCount={filteredProperties.length}
        currencySymbol={currencySymbol}
      />

      <AddPropertyModal
        isOpen={addPropertyModalOpen}
        onClose={() => setAddPropertyModalOpen(false)}
        onPropertyAdded={handlePropertyAdded}
      />

      <CoinRewardCenter
        isOpen={coinRewardModalOpen}
        onClose={() => setCoinRewardModalOpen(false)}
        onOpenUpiModal={() => setUpiModalOpen(true)}
        onOpenAdsense={() => setAdsenseModalOpen(true)}
      />

      <AdSensePlayerModal
        isOpen={adsenseModalOpen}
        onClose={() => setAdsenseModalOpen(false)}
      />

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        currencySymbol={currencySymbol}
      />

      <UpiPaymentModal
        isOpen={upiModalOpen}
        onClose={() => setUpiModalOpen(false)}
      />

      <KycLegalModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        allProperties={properties}
      />

      <NotificationCenter
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
      />

      <UserProfileSettings
        isOpen={userSettingsOpen}
        onClose={() => setUserSettingsOpen(false)}
        currencySymbol={currencySymbol}
        onOpenUpiModal={() => setUpiModalOpen(true)}
        onOpenKycModal={() => setKycModalOpen(true)}
        onOpenSubscriptionModal={() => setSubscriptionModalOpen(true)}
      />

      <OwnerProfileModal
        isOpen={!!ownerProfileData}
        onClose={() => setOwnerProfileData(null)}
        ownerData={ownerProfileData}
        allProperties={properties}
        onSelectProperty={(p) => {
          setOwnerProfileData(null);
          setSelectedProperty(p);
        }}
        onStartChat={(p) => {
          setOwnerProfileData(null);
          handleStartChatWithProperty(p);
        }}
        onUnlockPhone={handleUnlockPhoneForProperty}
        currencySymbol={currencySymbol}
      />

      <SharePropertyModal
        property={shareProp}
        isOpen={!!shareProp}
        onClose={() => setShareProp(null)}
        currencySymbol={currencySymbol}
      />

    </div>
  );
}
