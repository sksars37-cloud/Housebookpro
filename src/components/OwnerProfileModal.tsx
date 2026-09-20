import React, { useState } from 'react';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { PropertyCard } from './PropertyCard';
import {
  X,
  ChevronLeft,
  ShieldCheck,
  Phone,
  Mail,
  UserPlus,
  UserCheck,
  Building,
  MapPin,
  MessageSquare,
  Star,
  Clock,
  Award,
  CheckCircle2,
  Share2
} from 'lucide-react';

interface OwnerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerData: {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
    email?: string;
    role?: string;
    bio?: string;
  } | null;
  allProperties: Property[];
  onSelectProperty: (p: Property) => void;
  onStartChat: (p: Property) => void;
  onUnlockPhone?: (p: Property) => void;
  currencySymbol: string;
}

export const OwnerProfileModal: React.FC<OwnerProfileModalProps> = ({
  isOpen,
  onClose,
  ownerData,
  allProperties,
  onSelectProperty,
  onStartChat,
  onUnlockPhone,
  currencySymbol
}) => {
  const { isFollowingOwner, toggleFollowOwner } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'rent'>('all');
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!isOpen || !ownerData) return null;

  const isFollowing = isFollowingOwner(ownerData.id);
  const ownerListings = allProperties.filter(p => p.ownerId === ownerData.id);
  
  const filteredListings = ownerListings.filter(p => {
    if (filterType === 'all') return true;
    return p.listingType === filterType;
  });

  const saleCount = ownerListings.filter(p => p.listingType === 'sale').length;
  const rentCount = ownerListings.filter(p => p.listingType === 'rent').length;

  const handleCopyPhone = () => {
    if (ownerData.phone) {
      navigator.clipboard.writeText(ownerData.phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleStartChatWithFirstProperty = () => {
    if (ownerListings.length > 0) {
      onStartChat(ownerListings[0]);
    } else {
      // Fallback mock property
      onStartChat({
        id: `direct-${ownerData.id}`,
        title: `Inquiry with ${ownerData.name}`,
        description: `Direct message conversation with ${ownerData.name}`,
        price: 0,
        listingType: 'sale',
        propertyType: 'apartment',
        city: 'Bengaluru',
        locality: 'Central Corridor',
        address: 'Direct Host Inquiry',
        bedrooms: 2,
        bathrooms: 2,
        areaSqFt: 1200,
        furnishing: 'furnished',
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
        amenities: ['24/7 Security'],
        ownerId: ownerData.id,
        ownerName: ownerData.name,
        ownerPhone: ownerData.phone || '+91 98765 43210',
        ownerEmail: ownerData.email || `${ownerData.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        ownerAvatar: ownerData.avatar,
        isVerified: true,
        isFeatured: false,
        views: 1,
        status: 'available',
        createdAt: Date.now()
      });
    }
  };

  return (
    <div
      id="owner-profile-fullscreen"
      className="fixed inset-0 z-[60] bg-slate-50 flex flex-col w-full h-full overflow-hidden animate-fade-in"
    >
      {/* Sticky Fullscreen Top Bar */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <button
            id="btn-owner-profile-back"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                Partner & Host Profile
              </h2>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified Real Estate Professional
              </span>
            </div>
          </div>
        </div>

        <button
          id="btn-owner-profile-close"
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
          
          {/* Owner Hero Card Banner */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm relative overflow-hidden">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 via-blue-500 to-emerald-500" />
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              
              {/* Left Details: Avatar + Bio */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <div className="relative shrink-0">
                  <img
                    src={ownerData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ownerData.id}`}
                    alt={ownerData.name}
                    className="w-24 h-24 rounded-3xl object-cover border-4 border-indigo-100 shadow-md"
                  />
                  <span
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs"
                    title="Government Verified Profile"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                </div>

                <div className="space-y-1.5 max-w-xl">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      {ownerData.name}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-bold text-xs">
                      {ownerData.role || 'Certified Property Partner'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {ownerData.bio ||
                      'Dedicated real estate specialist with verified credentials, offering prime residential and commercial options across high-growth corridors with zero brokerage and seamless legal assistance.'}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      4.9 / 5.0 (138 Reviews)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      Replies in &lt; 15 mins
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium text-emerald-700">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      100% KYC Approved
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto shrink-0 justify-center">
                {/* Follow Button */}
                <button
                  id="btn-owner-toggle-follow"
                  onClick={() => toggleFollowOwner(ownerData.id, ownerData.name)}
                  className={`flex-1 sm:flex-initial py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isFollowing
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow Host</span>
                    </>
                  )}
                </button>

                {/* Instant Chat CTA */}
                <button
                  id="btn-owner-start-chat"
                  onClick={handleStartChatWithFirstProperty}
                  className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>Direct Chat</span>
                </button>

                {/* Phone Call / Copy */}
                {ownerData.phone && (
                  <button
                    id="btn-owner-call-phone"
                    onClick={handleCopyPhone}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-1.5 transition-all shrink-0"
                    title="Copy Phone Number"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>{copiedPhone ? 'Copied!' : ownerData.phone}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 font-semibold block">Total Published</span>
                <span className="text-lg font-extrabold text-slate-900">{ownerListings.length} Properties</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 font-semibold block">For Sale</span>
                <span className="text-lg font-extrabold text-indigo-600">{saleCount} Listings</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 font-semibold block">For Rent</span>
                <span className="text-lg font-extrabold text-emerald-600">{rentCount} Listings</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 font-semibold block">Brokerage</span>
                <span className="text-lg font-extrabold text-amber-600">0% Direct</span>
              </div>
            </div>
          </div>

          {/* Properties Published Header & Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" />
                <span>All Properties Listed by {ownerData.name} ({filteredListings.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every listing is verified by HouseBook with direct contact and instant site visit schedules.
              </p>
            </div>

            {/* Sub-filter tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({ownerListings.length})
              </button>
              <button
                onClick={() => setFilterType('sale')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'sale'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                For Sale ({saleCount})
              </button>
              <button
                onClick={() => setFilterType('rent')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'rent'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                For Rent ({rentCount})
              </button>
            </div>
          </div>

          {/* Listings Grid */}
          {filteredListings.length === 0 ? (
            <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3 max-w-md mx-auto my-6">
              <Building className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">No Listings in this Category</h3>
              <p className="text-xs text-slate-500">
                This host does not currently have active properties under the selected category.
              </p>
              <button
                onClick={() => setFilterType('all')}
                className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
              >
                View All Listings
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={(prop) => {
                    onClose();
                    onSelectProperty(prop);
                  }}
                  onStartChat={(prop) => {
                    onClose();
                    onStartChat(prop);
                  }}
                  onUnlockPhone={onUnlockPhone}
                  currencySymbol={currencySymbol}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
