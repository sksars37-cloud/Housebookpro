import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdSponsor } from '../types';
import { SAMPLE_AD_SPONSORS } from '../data/sampleListings';
import {
  X,
  Tv,
  Sparkles,
  Volume2,
  VolumeX,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdSensePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCoinsAwarded?: (coins: number) => void;
}

export const AdSensePlayerModal: React.FC<AdSensePlayerModalProps> = ({
  isOpen,
  onClose,
  onCoinsAwarded
}) => {
  const { addCoins, user } = useAuth();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(12);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  const ad: AdSponsor = SAMPLE_AD_SPONSORS[currentAdIndex % SAMPLE_AD_SPONSORS.length];

  useEffect(() => {
    if (!isOpen) return;
    // Pick random sponsor
    const randomIdx = Math.floor(Math.random() * SAMPLE_AD_SPONSORS.length);
    setCurrentAdIndex(randomIdx);
    setTimeLeft(SAMPLE_AD_SPONSORS[randomIdx].durationSeconds || 12);
    setAdCompleted(false);
    setIsPlaying(true);
    setShowSkipWarning(false);
  }, [isOpen]);

  // Countdown timer for ad
  useEffect(() => {
    if (!isOpen || adCompleted || !isPlaying) return;
    if (timeLeft <= 0) {
      handleCompleteAd();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleCompleteAd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timeLeft, isPlaying, adCompleted]);

  const handleCompleteAd = async () => {
    setAdCompleted(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    const reward = ad.rewardCoins || 15;
    if (user) {
      await addCoins(reward, 'earned_ad', `Reward for watching sponsor video: ${ad.brandName}`);
    }
    if (onCoinsAwarded) {
      onCoinsAwarded(reward);
    }
  };

  const handleAttemptClose = () => {
    if (adCompleted) {
      onClose();
    } else {
      setShowSkipWarning(true);
    }
  };

  const handleForceClose = () => {
    setShowSkipWarning(false);
    onClose();
  };

  const handleWatchAnother = () => {
    const nextIdx = (currentAdIndex + 1) % SAMPLE_AD_SPONSORS.length;
    setCurrentAdIndex(nextIdx);
    setTimeLeft(SAMPLE_AD_SPONSORS[nextIdx].durationSeconds || 12);
    setAdCompleted(false);
    setIsPlaying(true);
  };

  if (!isOpen) return null;

  const totalDuration = ad.durationSeconds || 12;
  const progressPercent = Math.min(100, Math.round(((totalDuration - timeLeft) / totalDuration) * 100));

  return (
    <div
      id="modal-adsense-player-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div
        id="modal-adsense-player-container"
        className="relative w-full max-w-xl bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col"
      >
        {/* AdSense Top Header Info */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
              Ad • Google AdSense
            </span>
            <span className="text-slate-400 truncate max-w-[200px]">{ad.category}</span>
          </div>
          <div className="flex items-center gap-3">
            {!adCompleted ? (
              <span className="font-mono text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                Reward in {timeLeft}s
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> +{ad.rewardCoins} Coins Earned!
              </span>
            )}
            <button
              onClick={handleAttemptClose}
              className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video / Interactive Ad Player Canvas */}
        <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
          <img
            src={ad.bannerImage}
            alt={ad.brandName}
            className="w-full h-full object-cover opacity-90 transition-transform duration-1000 scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-black/30 to-black/40 pointer-events-none" />

          {/* Ad Center Content */}
          <div className="absolute bottom-6 left-6 right-6 text-left space-y-2 z-10">
            <div className="inline-block px-2.5 py-1 rounded-lg bg-indigo-600/90 text-white font-bold text-[11px] backdrop-blur-xs">
              {ad.brandName}
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug drop-shadow-md">
              {ad.tagline}
            </h3>
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
              <a
                href={ad.ctaLink}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105"
              >
                <span>{ad.ctaText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Mute & Pause Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Ad Progress Bar at Bottom of Video */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-indigo-500 transition-all duration-300 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Ad Completion Reward Banner */}
        {adCompleted ? (
          <div className="p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-t border-slate-800 text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>+{ad.rewardCoins} HouseBook Coins Added to Your Wallet!</span>
            </div>
            <p className="text-xs text-slate-300">
              Use your coins to boost properties to top ranking, unlock direct owner phone numbers, or save on VIP membership!
            </p>
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={handleWatchAnother}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Watch Another Ad (+15 🪙)</span>
              </button>
              <button
                onClick={onClose}
                className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
              >
                Done & Return
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Google AdSense Verified Sponsor Network</span>
            </span>
            <span>Reward: <strong>+{ad.rewardCoins} Coins</strong></span>
          </div>
        )}

        {/* Skip Warning Prompt if user clicks close before timer ends */}
        {showSkipWarning && (
          <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6 text-center animate-fade-in">
            <div className="max-w-sm space-y-3">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
              <h4 className="font-bold text-base text-white">Skip this Video Ad?</h4>
              <p className="text-xs text-slate-300">
                If you close now, you will lose the <strong>+{ad.rewardCoins} Coins</strong> reward for this session ({timeLeft}s left).
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowSkipWarning(false)}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Resume Ad ({timeLeft}s)
                </button>
                <button
                  onClick={handleForceClose}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Skip Reward
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
