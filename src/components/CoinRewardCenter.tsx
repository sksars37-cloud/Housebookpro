import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, collection, query, where, orderBy, onSnapshot } from '../lib/firebase';
import { CoinTransaction } from '../types';
import {
  X,
  Coins,
  Tv,
  Sparkles,
  Gift,
  TrendingUp,
  ShieldCheck,
  Phone,
  FileText,
  Crown,
  History,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CoinRewardCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdPlayer?: () => void;
  onOpenAdsense?: () => void;
  onOpenSubscription?: () => void;
  onOpenAddProperty?: () => void;
  onOpenUpiGateway?: () => void;
  onOpenUpiModal?: () => void;
  onOpenKycLegal?: () => void;
}

export const CoinRewardCenter: React.FC<CoinRewardCenterProps> = ({
  isOpen,
  onClose,
  onOpenAdPlayer,
  onOpenAdsense,
  onOpenSubscription,
  onOpenAddProperty,
  onOpenUpiGateway,
  onOpenUpiModal,
  onOpenKycLegal
}) => {
  const { user, profile, addCoins } = useAuth();
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'earn' | 'history' | 'spend'>('earn');
  const [spinLoading, setSpinLoading] = useState(false);
  const [spinReward, setSpinReward] = useState<number | null>(null);

  const openAd = onOpenAdPlayer || onOpenAdsense || (() => {});
  const openUpi = onOpenUpiGateway || onOpenUpiModal || (() => {});
  const openSub = onOpenSubscription || (() => {});

  useEffect(() => {
    if (!isOpen || !user) return;
    try {
      const q = query(
        collection(db, 'coin_transactions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: CoinTransaction[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as CoinTransaction);
        });
        setTransactions(list);
      }, (err) => {
        console.warn('Coin transactions snapshot notice:', err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore coin transactions error:', e);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleDailySpin = async () => {
    if (!user) return;
    setSpinLoading(true);
    setTimeout(async () => {
      const rewards = [20, 50, 100, 25, 10, 200];
      const won = rewards[Math.floor(Math.random() * rewards.length)];
      setSpinReward(won);
      setSpinLoading(false);
      await addCoins(won, 'reward_spin', `Daily Lucky Wheel Spin Reward (+${won} Coins)`);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }, 1000);
  };

  return (
    <div
      id="modal-coin-center-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
    >
      <div
        id="modal-coin-center-container"
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-inner">
              🪙
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-950">Coin Rewards & Wallet Center</h3>
              <p className="text-xs font-semibold text-amber-950/80">
                Earn free coins by watching ads, spinning the wheel, or upgrade with UPI.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 text-slate-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Banner */}
        <div className="bg-amber-50 px-6 py-4 border-b border-amber-200/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-800">Your Current Balance</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-amber-950">
                {profile?.coins || 0} Coins
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                ⚡ Active
              </span>
            </div>
          </div>
          <button
            onClick={openUpi}
            className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Buy Coins via UPI
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('earn')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'earn'
                ? 'border-amber-500 text-amber-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Earn Free Coins
          </button>
          <button
            onClick={() => setActiveTab('spend')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'spend'
                ? 'border-amber-500 text-amber-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Where to Spend
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Transaction History ({transactions.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 max-h-[50vh]">
          {activeTab === 'earn' && (
            <div className="space-y-4">
              {/* Daily Lucky Spin Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-300 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h4 className="font-bold text-sm text-slate-900">Daily Lucky Wheel Spin</h4>
                  </div>
                  <p className="text-xs text-slate-600">Spin once every 24 hours to win up to 200 free coins instantly!</p>
                  {spinReward !== null && (
                    <p className="text-xs font-extrabold text-emerald-600 pt-1">
                      🎉 You won +{spinReward} Coins!
                    </p>
                  )}
                </div>
                <button
                  disabled={spinLoading}
                  onClick={handleDailySpin}
                  className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-xs shadow-md transition-all shrink-0 flex items-center gap-1"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${spinLoading ? 'animate-spin' : ''}`} />
                  <span>{spinLoading ? 'Spinning...' : 'Spin Now'}</span>
                </button>
              </div>

              {/* Watch Sponsor Ads */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-sm text-slate-900">Watch Sponsor Video Ad</h4>
                  </div>
                  <p className="text-xs text-slate-600">Watch short partner property videos to earn +15 coins per view.</p>
                </div>
                <button
                  onClick={openAd}
                  className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all shrink-0"
                >
                  Watch Ad (+15 🪙)
                </button>
              </div>

              {/* KYC Verification Bonus */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-sm text-slate-900">Complete KYC & Legal Verification</h4>
                  </div>
                  <p className="text-xs text-slate-600">Get your identity verified and earn +50 welcome trust coins.</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenKycLegal) onOpenKycLegal();
                  }}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all shrink-0"
                >
                  Verify KYC
                </button>
              </div>
            </div>
          )}

          {activeTab === 'spend' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  📞
                </div>
                <h4 className="font-bold text-sm text-slate-900">Unlock Owner Contact</h4>
                <p className="text-xs text-slate-600">Spend 10 coins to instantly reveal direct owner phone numbers & WhatsApp.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  ⭐
                </div>
                <h4 className="font-bold text-sm text-slate-900">Boost Property Listing</h4>
                <p className="text-xs text-slate-600">Spend 50 coins to feature your property at the top of search results.</p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No coin transactions recorded yet. Earn your first coins above!
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.amount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {tx.amount > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{tx.description}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className={`font-extrabold text-sm ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} 🪙
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
