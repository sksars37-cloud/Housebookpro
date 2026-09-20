import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SubscriptionTier, SubscriptionPlan } from '../types';
import {
  X,
  Crown,
  Check,
  Sparkles,
  Coins,
  CreditCard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Explorer',
    priceUsd: 0,
    priceCoins: 0,
    period: 'Forever Free',
    badgeColor: 'bg-slate-100 text-slate-700',
    features: [
      '1 Active property listing',
      'Standard search placement',
      'Real-time user chat',
      'Earn coins by watching ads',
      'Unlock contact for 10 coins'
    ]
  },
  {
    id: 'pro',
    name: 'HouseBook Pro',
    priceUsd: 19,
    priceCoins: 250,
    period: 'per month',
    popular: true,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    features: [
      '5 Featured property listings (7 days each)',
      '3x Higher search results ranking',
      'Verified Pro Host / Broker badge',
      'Ad-free portal experience',
      '200 Free monthly bonus coins',
      'Free direct phone reveals'
    ]
  },
  {
    id: 'vip',
    name: 'VIP Elite Gold',
    priceUsd: 49,
    priceCoins: 600,
    period: 'per month',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    features: [
      'Unlimited property listings',
      'Top homepage hero featured slider',
      'VIP Gold badge on all listings & profile',
      'Instant lead inquiry push alerts',
      '500 Free monthly bonus coins',
      'Dedicated relationship concierge'
    ]
  }
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currencySymbol
}) => {
  const { profile, upgradeSubscription, spendCoins } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('pro');
  const [paymentMethod, setPaymentMethod] = useState<'coins' | 'card'>('coins');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTier = profile?.subscriptionTier || 'free';
  const planData = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)!;

  const handleSubscribe = async () => {
    if (!profile) {
      setErrorMessage('Please sign in to upgrade your subscription.');
      return;
    }
    if (selectedPlan === currentTier) {
      setErrorMessage('You are already subscribed to this plan.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (paymentMethod === 'coins') {
        const requiredCoins = planData.priceCoins;
        if (profile.coins < requiredCoins) {
          throw new Error(`Insufficient HouseBook coins. You have ${profile.coins} 🪙 but need ${requiredCoins} 🪙. Watch ads to earn more!`);
        }
        const spent = await spendCoins(requiredCoins, 'spent_boost', `Subscription upgrade to HouseBook ${planData.name}`);
        if (!spent) {
          throw new Error('Coin transaction could not be completed.');
        }
      }

      await upgradeSubscription(selectedPlan);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
      setSuccessMessage(`Successfully upgraded to ${planData.name}! 🎉`);

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Subscription error:', err);
      setErrorMessage(err.message || 'Subscription failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="modal-subscription-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in"
    >
      <div
        id="modal-subscription-container"
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 pt-6 pb-5 text-white relative text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>HouseBook Premium Memberships</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Supercharge Your Property Reach
          </h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
            Get 3x inquiries, verified seller trust badges, and feature your listings at the top of search.
          </p>
        </div>

        {/* Plan Cards Grid */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-center font-bold text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const isCurrent = currentTier === plan.id;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`rounded-3xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/30 shadow-lg scale-[1.02]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] uppercase shadow">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-extrabold text-sm text-slate-900">{plan.name}</h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Current Plan
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">
                          {plan.priceUsd === 0 ? 'Free' : `${currencySymbol}${plan.priceUsd}`}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          /{plan.period}
                        </span>
                      </div>
                      {plan.priceCoins > 0 && (
                        <span className="text-xs font-bold text-amber-600 block mt-0.5">
                          Or {plan.priceCoins} 🪙 Coins
                        </span>
                      )}
                    </div>

                    {/* Features checklist */}
                    <div className="space-y-2 border-t border-slate-100 pt-4">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Radio Indicator */}
                  <div className="pt-5 mt-auto">
                    <button
                      type="button"
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isCurrent ? 'Current Plan' : isSelected ? 'Selected' : 'Select Plan'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment Method Selector if non-free */}
          {planData.priceUsd > 0 && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h5 className="font-bold text-xs text-slate-900">Choose Upgrade Method</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Pay with Coins */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('coins')}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    paymentMethod === 'coins'
                      ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🪙</span>
                    <div>
                      <span className="font-bold text-xs block">Pay with HouseBook Coins</span>
                      <span className="text-[11px] text-amber-800">
                        Requires {planData.priceCoins} Coins (You have {profile?.coins || 0})
                      </span>
                    </div>
                  </div>
                  {paymentMethod === 'coins' && <Check className="w-4 h-4 text-amber-600" />}
                </button>

                {/* Instant Card / Online Pay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-950 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <div>
                      <span className="font-bold text-xs block">Instant Direct Activation</span>
                      <span className="text-[11px] text-indigo-700">
                        {currencySymbol}{planData.priceUsd} / month
                      </span>
                    </div>
                  </div>
                  {paymentMethod === 'card' && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div>
            <button
              id="btn-confirm-subscription"
              onClick={handleSubscribe}
              disabled={isProcessing || selectedPlan === currentTier}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
            >
              {isProcessing ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : selectedPlan === currentTier ? (
                <span>You are on this plan</span>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Activate {planData.name} ({paymentMethod === 'coins' ? `${planData.priceCoins} 🪙` : `${currencySymbol}${planData.priceUsd}`})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
