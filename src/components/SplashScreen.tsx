import React, { useEffect, useState } from 'react';
import { Home, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(15);
  const [fadeState, setFadeState] = useState<'entering' | 'active' | 'exiting'>('entering');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(60);
    }, 400);

    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 1200);

    const timer3 = setTimeout(() => {
      setFadeState('exiting');
      setTimeout(onFinish, 400);
    }, 1900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setFadeState('exiting');
    setTimeout(onFinish, 200);
  };

  return (
    <div
      id="housebook-splash-screen"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white transition-opacity duration-400 ${
        fadeState === 'exiting' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Logo and Tagline Card */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">
        {/* Animated Brand Emblem */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-amber-400 p-[2px] shadow-2xl shadow-indigo-500/30 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Home className="w-12 h-12 text-indigo-400 stroke-[1.75]" />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
            HouseBook<span className="text-amber-400">.com</span>
          </h1>
        </div>
        <p className="text-sm font-medium text-slate-400 mb-8 max-w-xs">
          Smart Housing Portal • Verified Homes • Instant Owner Chat & Coin Rewards
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-2 p-0.5 overflow-hidden mb-4 border border-slate-700/50">
          <div
            className="bg-gradient-to-r from-indigo-500 to-amber-400 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-xs text-slate-400 font-medium px-1 mb-8">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Verified Listings
          </span>
          <span>{progress}% Loaded</span>
        </div>

        {/* Skip button */}
        <button
          id="btn-skip-splash"
          onClick={handleSkip}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
        >
          <span>Explore Homes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-6 text-[11px] text-slate-400 tracking-wider uppercase font-medium">
        Powered by Firebase Firestore & Housing Cloud
      </div>
    </div>
  );
};
