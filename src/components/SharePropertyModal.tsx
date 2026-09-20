import React, { useState } from 'react';
import { Property } from '../types';
import { X, Share2, Copy, Check, MessageSquare, ExternalLink, QrCode } from 'lucide-react';

interface SharePropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
}

export const SharePropertyModal: React.FC<SharePropertyModalProps> = ({
  property,
  isOpen,
  onClose,
  currencySymbol
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !property) return null;

  const shareUrl = `${window.location.origin}${window.location.pathname}?property=${encodeURIComponent(property.id)}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatPrice = (amt: number) => `${currencySymbol}${amt.toLocaleString()}`;

  return (
    <div
      id="modal-share-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        id="modal-share-container"
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-base text-slate-900">Share Property Listing</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm text-slate-700">
          {/* Mini property preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <img
              src={property.images[0]}
              alt="prop"
              className="w-14 h-14 rounded-xl object-cover shrink-0"
            />
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-slate-900 truncate">{property.title}</h4>
              <p className="text-[11px] text-indigo-700 font-bold">
                {formatPrice(property.price)} • {property.locality}, {property.city}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Direct Share Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 py-2 px-3 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono select-all text-slate-600"
              />
              <button
                onClick={handleCopy}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-colors shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this verified property on HouseBook: ${property.title} for ${formatPrice(property.price)}. View here: ${shareUrl}`)}`}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm text-center"
            >
              <span>WhatsApp Share</span>
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent(`HouseBook Listing: ${property.title}`)}&body=${encodeURIComponent(`Check out this property: ${shareUrl}`)}`}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm text-center"
            >
              <span>Email Link</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
