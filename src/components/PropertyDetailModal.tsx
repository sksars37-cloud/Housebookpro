import React, { useState } from 'react';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Building,
  Compass,
  Car,
  ShieldCheck,
  Sparkles,
  Phone,
  MessageSquare,
  Calendar,
  Check,
  Calculator,
  Lock,
  ChevronLeft,
  ChevronRight,
  Info,
  UserPlus,
  UserCheck,
  ExternalLink
} from 'lucide-react';

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (property: Property) => void;
  onUnlockPhone: (property: Property) => void;
  onShareProperty?: (property: Property) => void;
  onViewOwnerProfile?: (owner: {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
    email?: string;
    role?: string;
    bio?: string;
  }) => void;
  currencySymbol: string;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  isOpen,
  onClose,
  onStartChat,
  onUnlockPhone,
  onShareProperty,
  onViewOwnerProfile,
  currencySymbol
}) => {
  const { isFavorite, toggleFavoriteProperty, isContactUnlocked, isFollowingOwner, toggleFollowOwner } = useAuth();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [scheduleSent, setScheduleSent] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitNote, setVisitNote] = useState('');

  if (!isOpen || !property) return null;

  const isSaved = isFavorite(property.id);
  const isUnlocked = isContactUnlocked(property.id);
  const isFollowing = isFollowingOwner(property.ownerId);

  const formatPrice = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const handleShare = () => {
    if (onShareProperty) {
      onShareProperty(property);
    } else if (navigator.clipboard) {
      const shareUrl = `${window.location.origin}${window.location.pathname}?property=${encodeURIComponent(property.id)}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleFavorite = async () => {
    const nextSaved = await toggleFavoriteProperty(property.id);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1800);
  };

  const handleOwnerClick = () => {
    if (onViewOwnerProfile) {
      onViewOwnerProfile({
        id: property.ownerId,
        name: property.ownerName,
        avatar: property.ownerAvatar,
        phone: property.ownerPhone,
        email: property.ownerEmail,
        role: property.ownerRole,
        bio: property.ownerBio
      });
    }
  };

  const handleScheduleVisit = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleSent(true);
    setTimeout(() => {
      onStartChat(property);
    }, 1500);
  };

  // Approximate EMI calculation for sales: 20% down, 8.5% interest, 20 years
  const loanAmount = property.price * 0.8;
  const monthlyRate = 0.085 / 12;
  const months = 240;
  const estimatedEmi = property.listingType === 'sale'
    ? Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1))
    : null;

  return (
    <div
      id="property-detail-fullscreen"
      className="fixed inset-0 z-50 bg-slate-50 flex flex-col w-full h-full overflow-hidden animate-fade-in"
    >
      {/* Full-screen Sticky Top Bar */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <button
            id="btn-property-detail-back"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
            aria-label="Back to listings"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
            <span className="hidden sm:inline">Back to listings</span>
          </button>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {property.propertyType.replace('_', ' ')} • ID #{property.id}
            </span>
            {property.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px]">
                <Sparkles className="w-3 h-3 fill-slate-950" /> Featured
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share'}</span>
          </button>
          <button
            id={`btn-modal-shortlist-${property.id}`}
            onClick={handleToggleFavorite}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
              isSaved
                ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Heart className={`w-4 h-4 transition-transform ${isSaved ? 'fill-rose-600 text-rose-600 scale-110' : ''}`} />
            <span className="hidden sm:inline">
              {savedFeedback ? (isSaved ? 'Saved to Shortlist!' : 'Removed') : (isSaved ? 'Shortlisted' : 'Save to Shortlist')}
            </span>
          </button>
          <button
            id="btn-property-detail-close"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Full-screen Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        <div className="max-w-6xl mx-auto space-y-6 text-slate-800">
          
          {/* Main Photo Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900">
              <img
                src={property.images[activePhotoIdx] || property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActivePhotoIdx((prev) => (prev - 1 + property.images.length) % property.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-xs transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActivePhotoIdx((prev) => (prev + 1) % property.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-xs transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Row */}
            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activePhotoIdx === idx ? 'border-indigo-600 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Primary Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col: Specs & Description */}
            <div className="lg:col-span-8 space-y-6">
              
              <div>
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold mb-1">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{property.locality}, {property.city}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {property.title}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {property.address}
                </p>
              </div>

              {/* Price & Rent Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Asking Price</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-indigo-900">
                    {formatPrice(property.price)}
                    {property.listingType === 'rent' && (
                      <span className="text-sm font-semibold text-slate-600">
                        /{property.rentPeriod || 'month'}
                      </span>
                    )}
                  </div>
                  {property.areaSqFt > 0 && (
                    <span className="text-xs text-slate-500">
                      {currencySymbol}{Math.round(property.price / property.areaSqFt)} / sq.ft rate
                    </span>
                  )}
                </div>

                {property.listingType === 'sale' && estimatedEmi && (
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-semibold flex items-center justify-end gap-1">
                      <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                      Estimated EMI
                    </span>
                    <span className="text-base font-bold text-slate-800">
                      {currencySymbol}{estimatedEmi.toLocaleString()} / mo*
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      @ 8.5% p.a. for 20 Yrs (20% Down)
                    </span>
                  </div>
                )}

                {property.listingType === 'rent' && property.deposit && (
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-semibold block">Security Deposit</span>
                    <span className="text-base font-bold text-slate-800">
                      {formatPrice(property.deposit)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Refundable</span>
                  </div>
                )}
              </div>

              {/* Key Highlights Table */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3">Overview & Specifications</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Bedrooms</span>
                    <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Bed className="w-4 h-4 text-indigo-500" />
                      {property.bedrooms > 0 ? `${property.bedrooms} BHK` : 'Studio'}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Bathrooms</span>
                    <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Bath className="w-4 h-4 text-indigo-500" />
                      {property.bathrooms} Baths
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Super Area</span>
                    <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Maximize2 className="w-4 h-4 text-indigo-500" />
                      {property.areaSqFt} sq.ft
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Furnishing</span>
                    <span className="font-bold text-sm text-slate-800 capitalize mt-0.5 block truncate">
                      {property.furnishing.replace('_', ' ')}
                    </span>
                  </div>
                  {property.floor && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">Floor</span>
                      <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <Building className="w-4 h-4 text-indigo-500" />
                        {property.floor}
                      </span>
                    </div>
                  )}
                  {property.facing && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">Facing</span>
                      <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <Compass className="w-4 h-4 text-indigo-500" />
                        {property.facing}
                      </span>
                    </div>
                  )}
                  {property.parking && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">Parking</span>
                      <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <Car className="w-4 h-4 text-indigo-500" />
                        {property.parking}
                      </span>
                    </div>
                  )}
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Verification</span>
                    <span className="font-bold text-sm text-emerald-600 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                      Verified Listing
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-2">About the Property</h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Amenities Grid */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3">Amenities & Society Perks</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs font-semibold text-slate-700 flex items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Owner Contact Card & Schedule Visit */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Owner / SuperAgent Box */}
              <div className="p-5 bg-gradient-to-b from-indigo-50/70 to-white rounded-2xl border border-indigo-100 shadow-xs space-y-4">
                <div
                  id={`btn-open-owner-profile-${property.ownerId}`}
                  onClick={handleOwnerClick}
                  className="flex items-center justify-between gap-3 p-2 -m-2 rounded-xl hover:bg-white/80 transition-all cursor-pointer group"
                  title="Click to view full owner profile & all listings"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={property.ownerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${property.ownerId}`}
                      alt={property.ownerName}
                      className="w-12 h-12 rounded-2xl object-cover border border-indigo-200 group-hover:ring-2 group-hover:ring-indigo-500 transition-all"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {property.ownerName}
                        </h4>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                      </div>
                      <span className="text-[11px] text-indigo-700 font-semibold inline-flex items-center gap-1 bg-indigo-100/60 px-1.5 py-0.5 rounded">
                        <ShieldCheck className="w-3 h-3 text-indigo-600" /> Verified Partner
                      </span>
                    </div>
                  </div>

                  {/* Quick Follow Toggle */}
                  <button
                    id={`btn-modal-follow-owner-${property.ownerId}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFollowOwner(property.ownerId, property.ownerName);
                    }}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all ${
                      isFollowing
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleOwnerClick}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <span>View Owner Profile & All Listings →</span>
                  </button>
                </div>

                {/* Instant Chat CTA */}
                <button
                  id={`btn-modal-chat-${property.id}`}
                  onClick={() => onStartChat(property)}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Instant Chat with Owner</span>
                </button>

                {/* Reveal Direct Phone CTA */}
                <button
                  id={`btn-modal-unlock-phone-${property.id}`}
                  onClick={() => onUnlockPhone(property)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    isUnlocked
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                  }`}
                >
                  {isUnlocked ? (
                    <>
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>{property.ownerPhone} (Direct)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Unlock Direct Phone (10 Coins 🪙)</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-500 text-center">
                  Pro & VIP members get free unlimited phone unlocks.
                </p>
              </div>

              {/* Schedule Visit Form */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Request In-Person Site Visit</span>
                </h5>
                {scheduleSent ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Visit request sent! Opening direct chat...</span>
                  </div>
                ) : (
                  <form onSubmit={handleScheduleVisit} className="space-y-2">
                    <input
                      type="date"
                      required
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <textarea
                      placeholder="Add preferred time or specific questions (optional)..."
                      rows={2}
                      value={visitNote}
                      onChange={(e) => setVisitNote(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      Submit Visit Request
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
