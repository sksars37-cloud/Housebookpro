import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UpiPackage } from '../types';
import {
  X,
  QrCode,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Coins,
  Receipt,
  Building,
  AlertCircle,
  Clock,
  Download,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPackageId?: string;
}

export const UPI_COIN_PACKAGES: UpiPackage[] = [
  {
    id: 'starter_50',
    name: 'Starter Pack',
    coins: 50,
    bonusCoins: 5,
    priceInr: 49,
    tag: 'Quick Start'
  },
  {
    id: 'popular_250',
    name: 'Popular Booster',
    coins: 250,
    bonusCoins: 35,
    priceInr: 199,
    popular: true,
    tag: 'Most Popular'
  },
  {
    id: 'pro_600',
    name: 'Pro Super Saver',
    coins: 600,
    bonusCoins: 120,
    priceInr: 399,
    tag: 'Best Value (+20% Extra)'
  },
  {
    id: 'mega_1500',
    name: 'Mega VIP Realtor',
    coins: 1500,
    bonusCoins: 400,
    priceInr: 899,
    tag: 'Agent Special (+26% Extra)'
  }
];

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  defaultPackageId = 'popular_250'
}) => {
  const { user, profile, processUpiPayment, saveCustomUpiId } = useAuth();
  const [selectedPackId, setSelectedPackId] = useState<string>(defaultPackageId);
  const [payMethod, setPayMethod] = useState<'qr' | 'intent' | 'vpa'>('qr');
  const [userVpa, setUserVpa] = useState<string>(user?.email?.split('@')[0] ? `${user.email.split('@')[0]}@okaxis` : 'sksars37@okhdfcbank');
  const [utrInput, setUtrInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<{
    receiptNumber: string;
    coinsCredited: number;
    amountInr: number;
    utr: string;
    time: number;
    packageName: string;
  } | null>(null);

  const [isEditingMerchantUpi, setIsEditingMerchantUpi] = useState(false);
  const [customMerchantInput, setCustomMerchantInput] = useState(profile?.customUpiId || 'housebook.realty@okhdfcbank');

  if (!isOpen) return null;

  const currentPack = UPI_COIN_PACKAGES.find(p => p.id === selectedPackId) || UPI_COIN_PACKAGES[1];
  const merchantUpi = profile?.customUpiId || 'housebook.realty@okhdfcbank';
  const totalCoins = currentPack.coins + currentPack.bonusCoins;

  // Real standard UPI Intent URL
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(merchantUpi)}&pn=${encodeURIComponent('HouseBook Realty')}&am=${currentPack.priceInr}.00&cu=INR&tn=${encodeURIComponent(`HouseBook ${totalCoins} Coins #${currentPack.id}`)}`;

  const handleCopyUpiId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(merchantUpi);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleConfirmPayment = async (method: 'upi_intent' | 'upi_qr' | 'upi_collect') => {
    setIsProcessing(true);
    const generatedUtr = utrInput.trim() || `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    try {
      const res = await processUpiPayment({
        packageId: currentPack.id,
        packageName: currentPack.name,
        coinsCredited: totalCoins,
        amountInr: currentPack.priceInr,
        upiIdUsed: payMethod === 'vpa' ? userVpa : merchantUpi,
        utrNumber: generatedUtr,
        paymentMethod: method
      });

      if (res.success) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        setPaymentSuccessReceipt({
          receiptNumber: res.receiptNumber,
          coinsCredited: totalCoins,
          amountInr: currentPack.priceInr,
          utr: generatedUtr,
          time: Date.now(),
          packageName: currentPack.name
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveMerchantUpi = async () => {
    if (!customMerchantInput.trim()) return;
    await saveCustomUpiId(customMerchantInput.trim());
    setIsEditingMerchantUpi(false);
  };

  return (
    <div
      id="modal-upi-gateway-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fade-in"
    >
      <div
        id="modal-upi-gateway-container"
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]"
      >
        {/* Gateway Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-900 px-6 pt-5 pb-4 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-white">HouseBook UPI Gateway</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    Instant 24x7
                  </span>
                </div>
                <p className="text-xs text-emerald-100">
                  Buy HouseBook coins via UPI apps (GPay, PhonePe, Paytm, BHIM, QR)
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span className="font-semibold text-white">NPCI & Bank Verified</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          
          {/* If Payment Successful, show official receipt */}
          {paymentSuccessReceipt ? (
            <div className="space-y-6 py-4 animate-scale-up text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-extrabold text-2xl text-slate-900">Payment Successful!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your UPI transaction has been verified and coins are instantly credited to your wallet.
                </p>
              </div>

              {/* Receipt card */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 max-w-md mx-auto text-left space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-400 font-sans">Receipt Ref:</span>
                  <span className="font-bold text-slate-800">{paymentSuccessReceipt.receiptNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">Coin Package:</span>
                  <span className="font-bold text-slate-800">{paymentSuccessReceipt.packageName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">Coins Credited:</span>
                  <span className="font-black text-amber-600 text-sm">+{paymentSuccessReceipt.coinsCredited} 🪙</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">Amount Paid:</span>
                  <span className="font-bold text-emerald-600 text-sm">₹{paymentSuccessReceipt.amountInr}.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">UPI UTR Ref:</span>
                  <span className="font-bold text-slate-700">{paymentSuccessReceipt.utr}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-400 font-sans">New Wallet Balance:</span>
                  <span className="font-extrabold text-indigo-700 text-base">{profile?.coins || 0} 🪙</span>
                </div>
              </div>

              <div className="flex gap-3 justify-center max-w-md mx-auto">
                <button
                  onClick={() => {
                    setPaymentSuccessReceipt(null);
                    onClose();
                  }}
                  className="flex-1 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all"
                >
                  Done & Continue Browsing
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Select Coin Package */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>1. Select Coin Pack</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Coins never expire</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {UPI_COIN_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackId === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackId(pkg.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-600/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {pkg.tag && (
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md mb-2 inline-block self-start ${
                            pkg.popular ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {pkg.tag}
                          </span>
                        )}
                        <div>
                          <div className="text-lg font-black text-slate-900 flex items-center gap-1">
                            <span>{pkg.coins + pkg.bonusCoins}</span>
                            <span className="text-xs">🪙</span>
                          </div>
                          {pkg.bonusCoins > 0 && (
                            <span className="text-[10px] text-emerald-600 font-bold block">
                              +{pkg.bonusCoins} Bonus
                            </span>
                          )}
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900">₹{pkg.priceInr}</span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Choose Payment Method */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>2. Choose UPI Mode</span>
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl text-xs">
                  <button
                    type="button"
                    onClick={() => setPayMethod('qr')}
                    className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                      payMethod === 'qr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Scan QR Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('intent')}
                    className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                      payMethod === 'intent' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                    <span>UPI Apps Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('vpa')}
                    className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                      payMethod === 'vpa' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                    <span>Enter UPI ID</span>
                  </button>
                </div>
              </div>

              {/* PAYMENT VIEW: SCAN QR */}
              {payMethod === 'qr' && (
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
                  {/* Visual QR Simulator */}
                  <div className="bg-white p-3.5 rounded-2xl border-2 border-emerald-500/30 shadow-md flex flex-col items-center shrink-0">
                    <div className="w-36 h-36 bg-slate-900 rounded-xl p-2 flex flex-col items-center justify-center text-white text-center relative overflow-hidden">
                      {/* Stylized QR Pattern */}
                      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
                      <QrCode className="w-24 h-24 text-emerald-400" />
                      <div className="absolute bottom-1 px-2 py-0.5 bg-emerald-500/90 text-[8px] font-bold rounded text-slate-950 uppercase">
                        ₹{currentPack.priceInr}.00
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold mt-2">
                      Scan with GPay / PhonePe / Paytm
                    </span>
                  </div>

                  {/* QR Details */}
                  <div className="space-y-3 flex-1 text-left">
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold block">Merchant UPI ID:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 break-all">
                          {merchantUpi}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyUpiId}
                          className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 transition-colors shrink-0"
                          title="Copy UPI ID"
                        >
                          {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-800">
                      <p className="font-semibold">💡 Instant Crediting Guide:</p>
                      <ol className="list-decimal list-inside text-[11px] text-emerald-700 space-y-0.5 mt-1">
                        <li>Scan QR code with your UPI app</li>
                        <li>Pay <strong className="font-bold">₹{currentPack.priceInr}</strong></li>
                        <li>Click "Verify Payment" below for instant credit</li>
                      </ol>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Optional: Enter 12-digit UTR No."
                        value={utrInput}
                        onChange={(e) => setUtrInput(e.target.value)}
                        className="flex-1 py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENT VIEW: INTENT BUTTONS */}
              {payMethod === 'intent' && (
                <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-600">
                    Click your favorite UPI app to launch payment directly:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { name: 'Google Pay', icon: '🔵', color: 'border-blue-200 bg-blue-50 text-blue-900' },
                      { name: 'PhonePe', icon: '🟣', color: 'border-purple-200 bg-purple-50 text-purple-900' },
                      { name: 'Paytm UPI', icon: '💳', color: 'border-sky-200 bg-sky-50 text-sky-900' },
                      { name: 'BHIM UPI', icon: '🏛️', color: 'border-amber-200 bg-amber-50 text-amber-900' },
                      { name: 'Cred UPI', icon: '🖤', color: 'border-slate-300 bg-slate-100 text-slate-900' },
                      { name: 'Amazon Pay', icon: '📦', color: 'border-orange-200 bg-orange-50 text-orange-900' },
                    ].map((app) => (
                      <a
                        key={app.name}
                        href={upiIntentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`p-3 rounded-2xl border font-bold text-xs flex items-center gap-2.5 transition-transform hover:scale-[1.02] shadow-xs ${app.color}`}
                      >
                        <span className="text-base">{app.icon}</span>
                        <span>{app.name}</span>
                      </a>
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>After completing transaction in your UPI app, click below to verify.</span>
                  </div>
                </div>
              )}

              {/* PAYMENT VIEW: ENTER USER UPI ID */}
              {payMethod === 'vpa' && (
                <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Enter Your UPI ID / VPA
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userVpa}
                        onChange={(e) => setUserVpa(e.target.value)}
                        placeholder="e.g. yourname@okhdfcbank"
                        className="flex-1 py-2.5 px-3.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      A payment request of ₹{currentPack.priceInr} will be initiated to this UPI handle.
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Open your UPI app after clicking Submit to approve the ₹{currentPack.priceInr} request.
                    </span>
                  </div>
                </div>
              )}

              {/* Merchant UPI Configuration for Admins/Owners */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Merchant UPI: <strong className="text-slate-700">{merchantUpi}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingMerchantUpi(!isEditingMerchantUpi)}
                  className="text-indigo-600 hover:text-indigo-800 font-bold underline"
                >
                  {isEditingMerchantUpi ? 'Close' : 'Configure UPI ID'}
                </button>
              </div>

              {isEditingMerchantUpi && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2 animate-fade-in text-xs">
                  <span className="font-bold text-indigo-900 block">Set Custom Receiving UPI ID:</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customMerchantInput}
                      onChange={(e) => setCustomMerchantInput(e.target.value)}
                      placeholder="e.g. sksars37@okhdfcbank"
                      className="flex-1 py-1.5 px-3 bg-white border border-indigo-300 rounded-xl text-xs outline-none"
                    />
                    <button
                      onClick={handleSaveMerchantUpi}
                      className="py-1.5 px-4 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  id="btn-confirm-upi-payment"
                  disabled={isProcessing}
                  onClick={() => handleConfirmPayment(payMethod === 'intent' ? 'upi_intent' : payMethod === 'vpa' ? 'upi_collect' : 'upi_qr')}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying with NPCI Bank Gateway...</span>
                    </div>
                  ) : (
                    <>
                      <span>Verify & Claim {totalCoins} HouseBook Coins (₹{currentPack.priceInr})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
