import React, { useState } from 'react';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  MessageSquare,
  Phone,
  Sparkles,
  ShieldCheck,
  Eye,
  Share2,
  Crown,
  ChevronLeft,
  ChevronRight,
  Lock
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelectProperty?: (property: Property) => void;
  onSelect?: (property: Property) => void;
  onStartChat: (property: Property) => void;
  onUnlockPhone?: (property: Property) => void;
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

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelectProperty,
  onSelect,
  onStartChat,
  onUnlockPhone,
  onShareProperty,
  onViewOwnerProfile,
  currencySymbol
}) => {
  const { isFavorite, toggleFavoriteProperty, isContactUnlocked } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const isSaved = isFavorite(property.id);
  const isUnlocked = isContactUnlocked(property.id);

  const handleCardClick = () => {
    if (onSelectProperty) onSelectProperty(property);
    if (onSelect) onSelect(property);
  };

  const handleOwnerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const formatPrice = (amount: number) => {
    if (amount >= 100000) {
      return `${currencySymbol}${(amount / 1000).toLocaleString()}k`;
    }
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShareProperty) {
      onShareProperty(property);
    } else if (navigator.clipboard) {
      const shareUrl = `${window.location.origin}${window.location.pathname}?property=${encodeURIComponent(property.id)}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavoriteProperty(property.id);
  };

  return (
    <div
      id={`property-card-${property.id}`}
      onClick={handleCardClick}
      className="group bg-white rounded-3xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer relative"
    >
      {/* Image Gallery Header */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={property.images[currentImageIndex] || property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20 pointer-events-none" />

        {/* Badges Top Left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {property.isFeatured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[10px] tracking-wide shadow-md uppercase">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              Featured
            </span>
          )}
          {property.isVerified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] tracking-wide shadow-md">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white font-medium text-[10px] uppercase">
            {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>

        {/* Top Right Actions (Favorite & Share) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            id={`btn-share-${property.id}`}
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center backdrop-blur-xs shadow-md transition-all hover:scale-110"
            title="Share listing link"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            id={`btn-fav-${property.id}`}
            onClick={handleToggleFavorite}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xs shadow-md transition-all hover:scale-110 ${
              isSaved
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 hover:bg-white text-slate-600 hover:text-rose-500'
            }`}
            title="Save to Shortlist"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Carousel Prev/Next Controls (If multiple photos) */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-slate-950/70 text-[10px] text-white font-medium backdrop-blur-xs">
              {currentImageIndex + 1}/{property.images.length}
            </div>
          </>
        )}

        {/* Bottom Left Price on Image */}
        <div className="absolute bottom-3 left-3 text-white z-10">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-white tracking-tight drop-shadow-sm">
              {formatPrice(property.price)}
            </span>
            {property.listingType === 'rent' && (
              <span className="text-xs font-semibold text-slate-200">
                /{property.rentPeriod || 'mo'}
              </span>
            )}
          </div>
          {property.price > 1000 && property.areaSqFt > 0 && (
            <span className="text-[10px] text-slate-300 font-medium">
              {currencySymbol}{Math.round(property.price / property.areaSqFt)}/sq.ft
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          
          {/* Location & Title */}
          <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold mb-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="truncate">{property.locality}, {property.city}</span>
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {property.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed font-normal">
            {property.description}
          </p>

          {/* Key Metrics Chips (BHK, Baths, Area) */}
          <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-slate-100 text-slate-700 text-xs">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="font-semibold text-slate-800">
                {property.bedrooms > 0 ? `${property.bedrooms} BHK` : 'Studio'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="font-semibold text-slate-800">
                {property.bathrooms} Bath
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="font-semibold text-slate-800">
                {property.areaSqFt} sq.ft
              </span>
            </div>
          </div>

          {/* Amenities Tag Preview */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {property.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={`${property.id}-amenity-${idx}-${amenity}`}
                className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-lg bg-slate-100 text-slate-400">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Owner Info & Direct Contact / Chat Buttons */}
        <div className="pt-2 flex items-center justify-between gap-2">
          
          {/* Owner Avatar & Name with Click to View Profile */}
          <div
            id={`btn-card-owner-${property.ownerId}`}
            onClick={handleOwnerClick}
            className="flex items-center gap-2 min-w-0 p-1 -m-1 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer group/owner"
            title="Click to view owner profile & all listings"
          >
            <img
              src={property.ownerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${property.ownerId}`}
              alt={property.ownerName}
              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 group-hover/owner:ring-2 group-hover/owner:ring-indigo-500 transition-all"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 group-hover/owner:text-indigo-600 truncate transition-colors">
                {property.ownerName}
              </p>
              <p className="text-[10px] text-slate-400 font-medium capitalize truncate flex items-center gap-1">
                <span>View Host</span>
                <span>•</span>
                <span>{property.furnishing.replace('_', ' ')}</span>
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Direct Instant Chat Trigger */}
            <button
              id={`btn-chat-owner-${property.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartChat(property);
              }}
              className="py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Chat directly with owner on HouseBook"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>

            {/* Unlock Phone Button */}
            <button
              id={`btn-unlock-contact-${property.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onUnlockPhone) onUnlockPhone(property);
              }}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                isUnlocked
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {isUnlocked ? (
                <>
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate max-w-[85px]">{property.ownerPhone}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Call (10 🪙)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
