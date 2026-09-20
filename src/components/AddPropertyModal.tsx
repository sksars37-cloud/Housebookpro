import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, collection, addDoc, cleanUndefinedFields } from '../lib/firebase';
import { Property, ListingType, PropertyType, FurnishingStatus } from '../types';
import { CITIES_LIST, AMENITIES_LIST } from '../data/sampleListings';
import {
  X,
  Building2,
  Sparkles,
  Check,
  Image as ImageIcon,
  Plus,
  Trash2,
  Coins,
  AlertCircle,
  Home,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyAdded?: (newProp: Property) => void;
}

const PRESET_PHOTO_GALLERY = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
];

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  isOpen,
  onClose,
  onPropertyAdded
}) => {
  const { user, profile, spendCoins } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listingType, setListingType] = useState<ListingType>('sale');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [price, setPrice] = useState<number | ''>('');
  const [deposit, setDeposit] = useState<number | ''>('');
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [areaSqFt, setAreaSqFt] = useState<number | ''>(1250);
  const [furnishing, setFurnishing] = useState<FurnishingStatus>('furnished');
  const [city, setCity] = useState(CITIES_LIST[1] || 'Mumbai');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Covered Parking', '24/7 Security', 'High Speed WiFi'
  ]);
  const [images, setImages] = useState<string[]>([
    PRESET_PHOTO_GALLERY[0]
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [wantBoost, setWantBoost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleToggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddImageUrl = () => {
    if (customImageUrl.trim()) {
      setImages(prev => [...prev, customImageUrl.trim()]);
      setCustomImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPresetImage = (url: string) => {
    if (!images.includes(url)) {
      setImages(prev => [...prev, url]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      setError('Please sign in to list your property on HouseBook.');
      return;
    }
    if (!title.trim() || !locality.trim() || !address.trim() || !price) {
      setError('Please fill in all mandatory property fields.');
      return;
    }
    if (images.length === 0) {
      setError('Please add at least one property photo.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      let isFeaturedListing = profile.subscriptionTier === 'vip' || profile.subscriptionTier === 'pro';

      // If user chose coin boost
      if (wantBoost && !isFeaturedListing) {
        const BOOST_COST = 25;
        const paid = await spendCoins(BOOST_COST, 'spent_boost', `Featured listing boost for "${title}"`);
        if (!paid) {
          throw new Error('Insufficient coins for listing boost. You need 25 coins.');
        }
        isFeaturedListing = true;
      }

      const newPropertyData: any = {
        title: title.trim(),
        description: description.trim() || `${bedrooms} BHK ${propertyType} in prime locality of ${locality}, ${city}. Includes modern amenities and convenient transport links.`,
        price: Number(price),
        listingType,
        propertyType,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        areaSqFt: Number(areaSqFt) || 1000,
        furnishing,
        city,
        locality: locality.trim(),
        address: address.trim(),
        images,
        amenities: selectedAmenities,
        ownerId: user.uid,
        ownerName: profile.displayName || 'Property Host',
        ownerPhone: profile.phone || '+91 98000 11223',
        ownerEmail: profile.email || 'host@housebook.com',
        ownerAvatar: profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        isFeatured: isFeaturedListing,
        isVerified: profile.subscriptionTier !== 'free',
        views: 1,
        createdAt: Date.now(),
        status: 'available'
      };

      if (listingType === 'rent') {
        newPropertyData.rentPeriod = 'monthly';
      }
      if (deposit) {
        newPropertyData.deposit = Number(deposit);
      }

      const cleanedPayload = cleanUndefinedFields(newPropertyData);
      const docRef = await addDoc(collection(db, 'properties'), cleanedPayload);
      const createdProp: Property = { ...cleanedPayload, id: docRef.id };

      setSuccess(true);
      confetti({ particleCount: 75, spread: 60 });
      if (onPropertyAdded) {
        onPropertyAdded(createdProp);
      }

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error('Add property error:', err);
      setError(err.message || 'Failed to post property. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="modal-add-property-fullscreen"
      className="fixed inset-0 z-50 bg-white flex flex-col w-full h-full overflow-hidden animate-fade-in"
    >
      <div
        id="modal-add-property-container"
        className="bg-white w-full h-full flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">List Your Property on HouseBook</h3>
              <p className="text-[11px] text-slate-300">Reach millions of verified buyers and tenants with direct chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-sm">Property Listed Successfully!</h4>
              <p className="text-xs">Your listing is now live in search results and explore feeds.</p>
            </div>
          )}

          {/* Listing Type & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Listing Type *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setListingType('sale')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    listingType === 'sale'
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  For Sale
                </button>
                <button
                  type="button"
                  onClick={() => setListingType('rent')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    listingType === 'rent'
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  For Rent
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Property Category *</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="apartment">Apartment / Flat</option>
                <option value="villa">Independent Villa</option>
                <option value="penthouse">Luxury Penthouse</option>
                <option value="independent_house">Independent Builder Floor</option>
                <option value="studio">Studio Apartment</option>
                <option value="duplex">Duplex Residence</option>
                <option value="commercial">Commercial Office</option>
              </select>
            </div>
          </div>

          {/* Property Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Property Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Sun-Lit 3BHK Penthouse with Private Terrace"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Pricing & Area Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {listingType === 'sale' ? 'Expected Price ($ / ₹) *' : 'Monthly Rent ($ / ₹) *'}
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder={listingType === 'sale' ? '250000' : '2500'}
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {listingType === 'rent' ? (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Security Deposit</label>
                <input
                  type="number"
                  placeholder="5000"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Super Area (sq.ft) *</label>
                <input
                  type="number"
                  required
                  placeholder="1450"
                  value={areaSqFt}
                  onChange={(e) => setAreaSqFt(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Furnishing Status</label>
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value as FurnishingStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="furnished">Fully Furnished</option>
                <option value="semi_furnished">Semi-Furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>
          </div>

          {/* BHK & Bathrooms */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Bedrooms</label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>0 (Studio / Office)</option>
                <option value={1}>1 BHK</option>
                <option value={2}>2 BHK</option>
                <option value={3}>3 BHK</option>
                <option value={4}>4 BHK</option>
                <option value={5}>5+ BHK</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Bathrooms</label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1}>1 Bathroom</option>
                <option value={2}>2 Bathrooms</option>
                <option value={3}>3 Bathrooms</option>
                <option value={4}>4+ Bathrooms</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">City *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CITIES_LIST.filter(c => c !== 'All Cities').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Locality / Area *</label>
              <input
                type="text"
                required
                placeholder="e.g. Bandra West"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Complete Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. Flat 1402, Highline Residency, Carter Road, Bandra West, Mumbai"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Property Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Property Description</label>
            <textarea
              rows={3}
              placeholder="Highlight special features, nearby schools, hospitals, metro access, view, parking, etc..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Photo Gallery & Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Property Photos ({images.length}) *
              </label>
              <span className="text-[11px] text-slate-400">Click presets below or enter custom URL</span>
            </div>

            {/* Current Images Preview */}
            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-16 rounded-xl overflow-hidden group border border-slate-200">
                  <img src={img} alt="listing" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute inset-0 bg-rose-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Custom Image URL input */}
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste Image URL (https://...)"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Quick architectural preset gallery */}
            <div>
              <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">Quick Photo Presets:</span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {PRESET_PHOTO_GALLERY.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddPresetImage(preset)}
                    className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-500 shrink-0 opacity-80 hover:opacity-100 transition-all"
                  >
                    <img src={preset} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Amenities Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Amenities Included</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES_LIST.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all text-left ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{amenity}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coin Boost / Featured Option */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold text-xs text-amber-950 block">
                    Boost to Featured Listing (3x Views & Inquiries)
                  </span>
                  <span className="text-[11px] text-amber-800">
                    {profile?.subscriptionTier !== 'free'
                      ? '✓ Included Free with your Pro/VIP Plan!'
                      : 'Spend 25 HouseBook Coins to feature for 7 days'}
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={wantBoost || profile?.subscriptionTier !== 'free'}
                disabled={profile?.subscriptionTier !== 'free'}
                onChange={(e) => setWantBoost(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
            </label>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-2">
            <button
              id="btn-submit-property-listing"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  <span>Publish Property Listing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
