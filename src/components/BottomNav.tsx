import React from 'react';
import { Home, Search, PlusCircle, MessageSquare, User, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BottomNavProps {
  activeTab?: string;
  currentTab?: string;
  onTabChange?: (tab: any) => void;
  onSelectTab?: (tab: any) => void;
  onOpenAddProperty: () => void;
  onOpenAdCenter?: () => void;
  unreadChatCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  currentTab,
  onTabChange,
  onSelectTab,
  onOpenAddProperty,
  onOpenAdCenter,
  unreadChatCount = 0
}) => {
  const tab = activeTab || currentTab || 'explore';
  const handleSelect = (t: string) => {
    if (onTabChange) onTabChange(t);
    if (onSelectTab) onSelectTab(t);
  };

  return (
    <div
      id="housebook-bottom-nav"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg"
    >
      <button
        id="bottom-nav-explore"
        onClick={() => handleSelect('explore')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
          tab === 'explore' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px]">Explore</span>
      </button>

      <button
        id="bottom-nav-shortlist"
        onClick={() => handleSelect('shortlist')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
          tab === 'shortlist' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Search className="w-5 h-5" />
        <span className="text-[10px]">Saved</span>
      </button>

      {/* Post Action Center Button */}
      <button
        id="bottom-nav-post"
        onClick={onOpenAddProperty}
        className="flex flex-col items-center justify-center -mt-5"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 border-2 border-white active:scale-95 transition-transform">
          <PlusCircle className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-indigo-600 mt-0.5">Post</span>
      </button>

      <button
        id="bottom-nav-chats"
        onClick={() => handleSelect('chats')}
        className={`relative flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
          tab === 'chats' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[10px]">Chats</span>
        {unreadChatCount > 0 && (
          <span className="absolute top-0 right-2 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadChatCount}
          </span>
        )}
      </button>

      <button
        id="bottom-nav-legal"
        onClick={() => handleSelect('legal')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
          tab === 'legal' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Coins className="w-5 h-5 text-amber-500" />
        <span className="text-[10px]">Legal Hub</span>
      </button>
    </div>
  );
};
