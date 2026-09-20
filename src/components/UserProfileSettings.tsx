import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  User,
  ShieldCheck,
  Coins,
  Crown,
  Bell,
  LogOut,
  Save,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  Building
} from 'lucide-react';

interface UserProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  onOpenUpiModal: () => void;
  onOpenKycModal: () => void;
  onOpenSubscriptionModal: () => void;
}

export const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({
  isOpen,
  onClose,
  currencySymbol,
  onOpenUpiModal,
  onOpenKycModal,
  onOpenSubscriptionModal
}) => {
  const { user, profile, logout } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div
      id="modal-user-settings-fullscreen"
      className="fixed inset-0 z-50 bg-white flex flex-col w-full h-full overflow-hidden animate-fade-in"
    >
      <div
        id="modal-user-settings-container"
        className="bg-white w-full h-full flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-base text-slate-900">User Account & Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm text-slate-700">
          
          {/* User Profile Card Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-slate-50 rounded-2xl border border-indigo-100 flex items-center gap-4">
            <img
              src={profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
              alt="avatar"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500 shadow-sm"
            />
            <div className="min-w-0">
              <h4 className="font-extrabold text-base text-slate-900 truncate">
                {profile?.displayName || user.displayName || 'HouseBook User'}
              </h4>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px] capitalize">
                  {profile?.role || 'buyer'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center gap-1">
                  <span>🪙</span> {profile?.coins || 0} Coins
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] capitalize">
                  {profile?.subscriptionTier || 'Free'} Tier
                </span>
              </div>
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenUpiModal();
              }}
              className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl text-center transition-colors group"
            >
              <Coins className="w-5 h-5 text-amber-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-amber-900 text-xs block">Buy Coins 🪙</span>
              <span className="text-[10px] text-amber-700">UPI Instant</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenKycModal();
              }}
              className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-center transition-colors group"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-emerald-900 text-xs block">KYC & Legal</span>
              <span className="text-[10px] text-emerald-700">Digital Seal</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenSubscriptionModal();
              }}
              className="p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-2xl text-center transition-colors group"
            >
              <Crown className="w-5 h-5 text-indigo-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-indigo-900 text-xs block">VIP Upgrade</span>
              <span className="text-[10px] text-indigo-700">Pro & Elite</span>
            </button>
          </div>

          {/* Edit Profile Form */}
          <form onSubmit={handleSave} className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Personal Information</h5>
            {savedSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile updated successfully!</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98000 12345"
                className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bio / About</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Real estate investor or verified home seeker..."
                className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </form>

          {/* Logout button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-400 text-xs">HouseBook Realty OS v2.4</span>
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
