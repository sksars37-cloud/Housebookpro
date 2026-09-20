import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CurrencyCode } from '../types';
import {
  Home,
  Search,
  PlusCircle,
  Coins,
  MessageSquare,
  Bell,
  User,
  Crown,
  Settings,
  LogOut,
  Sparkles,
  Building,
  Heart,
  ChevronDown,
  ShieldCheck,
  Tv
} from 'lucide-react';

interface NavbarProps {
  currency?: CurrencyCode;
  onCurrencyChange?: (c: CurrencyCode) => void;
  activeTab?: string;
  currentTab?: string;
  onTabChange?: (tab: any) => void;
  onSelectTab?: (tab: any) => void;
  onOpenAuth: () => void;
  onOpenAddProperty: () => void;
  onOpenAdCenter?: () => void;
  onOpenCoinCenter?: () => void;
  onOpenSubscription: () => void;
  onOpenNotifications: () => void;
  onOpenSettings?: () => void;
  onOpenUserSettings?: () => void;
  onOpenUpiGateway?: () => void;
  onOpenUpiModal?: () => void;
  onOpenKycLegal?: () => void;
  onOpenKycModal?: () => void;
  unreadChatCount?: number;
  unreadNotificationCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency = 'INR',
  onCurrencyChange,
  activeTab,
  currentTab,
  onTabChange,
  onSelectTab,
  onOpenAuth,
  onOpenAddProperty,
  onOpenAdCenter,
  onOpenCoinCenter,
  onOpenSubscription,
  onOpenNotifications,
  onOpenSettings,
  onOpenUserSettings,
  onOpenUpiGateway,
  onOpenUpiModal,
  onOpenKycLegal,
  onOpenKycModal,
  unreadChatCount = 0,
  unreadNotificationCount = 0
}) => {
  const { user, profile, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const tab = activeTab || currentTab || 'explore';
  const handleSelectTab = (t: string) => {
    if (onTabChange) onTabChange(t);
    if (onSelectTab) onSelectTab(t);
  };

  const openAdCenter = onOpenAdCenter || onOpenCoinCenter || (() => {});
  const openSettings = onOpenSettings || onOpenUserSettings || (() => {});
  const openUpi = onOpenUpiGateway || onOpenUpiModal || (() => {});
  const openKyc = onOpenKycLegal || onOpenKycModal || (() => {});

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs w-full overflow-x-clip">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Left Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink-0">
            <button
              id="brand-logo-btn"
              onClick={() => handleSelectTab('explore')}
              className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-none shrink-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform shrink-0">
                <Home className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                    HouseBook
                  </span>
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 hidden sm:inline">
                    .com
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wide hidden md:block">
                  Housing & Realty Network
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 shrink-0">
              <button
                id="nav-explore-btn"
                onClick={() => handleSelectTab('explore')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-colors shrink-0 ${
                  tab === 'explore'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Explore
              </button>
              <button
                id="nav-saved-btn"
                onClick={() => handleSelectTab('shortlist')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
                  tab === 'shortlist'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Shortlist ({profile?.savedProperties?.length || 0})</span>
              </button>
              <button
                id="nav-kyc-legal-btn"
                onClick={openKyc}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
                  tab === 'legal' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>KYC Legal Hub</span>
                {profile?.kycStatus === 'approved' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                )}
              </button>
              <button
                id="nav-ads-btn"
                onClick={openAdCenter}
                className="hidden xl:flex px-2.5 py-1.5 text-xs font-semibold rounded-xl text-amber-700 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/60 transition-colors items-center gap-1.5 shrink-0"
              >
                <Tv className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Watch Ads</span>
              </button>
              <button
                id="nav-vip-btn"
                onClick={onOpenSubscription}
                className="hidden xl:flex px-2.5 py-1.5 text-xs font-semibold rounded-xl text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/60 transition-colors items-center gap-1.5 shrink-0"
              >
                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Pro Plan</span>
              </button>
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Currency Selector (hidden on mobile, shown on sm+) */}
            {onCurrencyChange && (
              <div className="hidden sm:block shrink-0">
                <select
                  value={currency}
                  onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                  className="text-xs font-bold py-1 px-1.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 cursor-pointer focus:outline-none"
                >
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                </select>
              </div>
            )}

            {/* Direct UPI Buy Coins Button - shown only on extra wide screens */}
            <button
              id="nav-buy-coins-upi-btn"
              onClick={openUpi}
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all shrink-0"
              title="Buy Coins with UPI Payment Gateway"
            >
              <span className="text-xs">⚡</span>
              <span>Buy Coins</span>
            </button>

            {/* Coins Balance Indicator */}
            {profile && (
              <button
                id="nav-coins-wallet-btn"
                onClick={openAdCenter}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 border border-amber-300 text-amber-900 text-xs font-bold transition-all shadow-xs shrink-0"
                title="Your HouseBook Coins - Click to earn more or spend"
              >
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[11px] shadow-xs shrink-0">
                  🪙
                </span>
                <span className="font-extrabold text-xs">{profile.coins}</span>
              </button>
            )}

            {/* Post Property Button (hidden on mobile, visible on md+) */}
            <button
              id="nav-post-property-btn"
              onClick={onOpenAddProperty}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all shrink-0"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Post Property</span>
            </button>

            {/* Messages / Chat Trigger */}
            <button
              id="nav-chat-btn"
              onClick={() => handleSelectTab('chats')}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              title="Chat with Owners & Buyers"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadChatCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadChatCount > 9 ? '9+' : unreadChatCount}
                </span>
              )}
            </button>

            {/* Notifications Trigger */}
            <button
              id="nav-notification-btn"
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* User Profile / Auth Area */}
            {user && profile ? (
              <div className="relative shrink-0">
                <button
                  id="nav-user-menu-btn"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200 shrink-0"
                >
                  <img
                    src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                    alt={profile.displayName}
                    className="w-7 h-7 rounded-xl object-cover border border-indigo-200 shrink-0"
                  />
                  <span className="hidden xl:block text-xs font-semibold text-slate-800 max-w-[90px] truncate">
                    {profile.displayName.split(' ')[0]}
                  </span>
                  {profile.subscriptionTier !== 'free' && (
                    <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div
                    id="user-profile-dropdown"
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in"
                  >
                    {/* Mobile Currency Selector */}
                    {onCurrencyChange && (
                      <div className="sm:hidden px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Currency</span>
                        <select
                          value={currency}
                          onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                          className="text-xs font-bold py-1 px-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-pointer focus:outline-none"
                        >
                          <option value="INR">₹ INR</option>
                          <option value="USD">$ USD</option>
                          <option value="EUR">€ EUR</option>
                        </select>
                      </div>
                    )}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {profile.displayName}
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          profile.subscriptionTier === 'vip'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : profile.subscriptionTier === 'pro'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {profile.subscriptionTier}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {profile.email}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 text-xs">
                        <span className="text-slate-500">Wallet Coins:</span>
                        <span className="font-bold text-amber-600 flex items-center gap-1">
                          🪙 {profile.coins}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          openSettings();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Profile & Listings</span>
                      </button>
                      <button
                        onClick={() => {
                          openKyc();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50/50 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>KYC & Legal Workspace</span>
                        {profile.kycStatus === 'approved' && (
                          <span className="ml-auto text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                            Verified
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          openUpi();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-indigo-700 hover:bg-indigo-50/50 flex items-center gap-2"
                      >
                        <span className="text-sm">⚡</span>
                        <span>Buy Coins via UPI Gateway</span>
                      </button>
                      <button
                        onClick={() => {
                          openAdCenter();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-amber-700 hover:bg-amber-50/50 flex items-center gap-2"
                      >
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span>Coin Rewards & Ad Center</span>
                      </button>
                      <button
                        onClick={() => {
                          onOpenSubscription();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-indigo-700 hover:bg-indigo-50/50 flex items-center gap-2"
                      >
                        <Crown className="w-4 h-4 text-amber-500" />
                        <span>Manage Subscription</span>
                      </button>
                      <button
                        onClick={() => {
                          openSettings();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Settings & Currency</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-nav-login"
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
