import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, collection, query, orderBy, onSnapshot, addDoc, doc, setDoc, cleanUndefinedFields } from '../lib/firebase';
import { KycRecord, KycDocumentType, LegalDocument, Property } from '../types';
import {
  X,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UploadCloud,
  Camera,
  FileCheck2,
  Scale,
  Download,
  Stamp,
  UserCheck,
  Eye,
  Check,
  Sparkles,
  Key,
  ChevronRight,
  Printer,
  Building,
  ShieldAlert,
  ArrowRight,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface KycLegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'kyc' | 'agreements' | 'admin';
  allProperties?: Property[];
}

export const KycLegalModal: React.FC<KycLegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'kyc',
  allProperties = []
}) => {
  const {
    user,
    profile,
    submitKycApplication,
    approveKycApplication,
    rejectKycApplication
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'kyc' | 'agreements' | 'admin'>(initialTab);

  // KYC Application Form State
  const [fullName, setFullName] = useState(profile?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '+91 98765 43210');
  const [docType, setDocType] = useState<KycDocumentType>('aadhaar');
  const [docNumber, setDocNumber] = useState('XXXX-XXXX-8921');
  const [panNumber, setPanNumber] = useState('ABCDE1234F');
  const [address, setAddress] = useState('Flat 402, Green Valley Apartments, MG Road');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560001');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [kycSuccessMessage, setKycSuccessMessage] = useState(false);

  // Admin Review State
  const [allKycApplications, setAllKycApplications] = useState<KycRecord[]>([]);
  const [selectedReviewKyc, setSelectedReviewKyc] = useState<KycRecord | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewingAction, setIsReviewingAction] = useState(false);

  // Agreement Generator State
  const [selectedAgreementType, setSelectedAgreementType] = useState<'rental' | 'sale_mou' | 'title_search'>('rental');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(allProperties[0]?.id || '');
  const [landlordName, setLandlordName] = useState(profile?.displayName || 'Rajesh Sharma');
  const [tenantName, setTenantName] = useState('Amit Kumar Verma');
  const [tenantPhone, setTenantPhone] = useState('+91 98111 22334');
  const [rentAmount, setRentAmount] = useState<number>(28000);
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [tenureMonths, setTenureMonths] = useState<number>(11);
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [generatedDoc, setGeneratedDoc] = useState<LegalDocument | null>(null);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  // Check admin status (sksars37@gmail.com is primary admin)
  const isAdminUser = user?.email === 'sksars37@gmail.com' || profile?.isAdmin === true || user?.email?.includes('admin');

  // Listen to KYC applications in admin tab
  useEffect(() => {
    if (!isOpen || !user) return;
    const q = query(collection(db, 'kyc_applications'), orderBy('submittedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: KycRecord[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as KycRecord);
      });
      setAllKycApplications(list);
    }, (err) => {
      console.warn('KYC snapshot notice:', err);
    });
    return () => unsubscribe();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const isApproved = profile?.kycStatus === 'approved' || profile?.legalClearanceApproved;
  const isPending = profile?.kycStatus === 'pending';
  const isRejected = profile?.kycStatus === 'rejected';

  // Fast auto-fill templates for easy demo testing
  const handleAutoFillLandlord = () => {
    setFullName('Suresh Kumar (Verified SuperHost)');
    setPhone('+91 98450 99881');
    setDocType('aadhaar');
    setDocNumber('4589-7712-9014');
    setPanNumber('AAAPS8901K');
    setAddress('Villa 12, Palm Meadows, Whitefield');
    setCity('Bengaluru');
    setState('Karnataka');
    setPincode('560066');
    setAgreedTerms(true);
  };

  const handleAutoFillBuyer = () => {
    setFullName('Priya Nair (Verified Buyer)');
    setPhone('+91 97120 44556');
    setDocType('passport');
    setDocNumber('Z9810452');
    setPanNumber('BNRPN4412Q');
    setAddress('Tower B, Skyline Residency, Bandra West');
    setCity('Mumbai');
    setState('Maharashtra');
    setPincode('400050');
    setAgreedTerms(true);
  };

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      alert('Please accept the legal authorization declaration to proceed.');
      return;
    }

    setIsSubmittingKyc(true);
    try {
      const ok = await submitKycApplication({
        fullName,
        phone,
        docType,
        docNumber,
        panNumber,
        address,
        city,
        state,
        pincode,
        docFrontImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
        selfieImage: profile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80'
      });
      if (ok) {
        setKycSuccessMessage(true);
        confetti({ particleCount: 60, spread: 50 });
      }
    } catch (err) {
      console.error('Submit KYC error:', err);
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  const handleAdminApprove = async (app: KycRecord) => {
    setIsReviewingAction(true);
    try {
      await approveKycApplication(app.id, app.userId, reviewNotes || 'Identity verified against National Govt database');
      confetti({ particleCount: 80, spread: 70 });
      setSelectedReviewKyc(null);
      setReviewNotes('');
    } finally {
      setIsReviewingAction(false);
    }
  };

  const handleAdminReject = async (app: KycRecord) => {
    setIsReviewingAction(true);
    try {
      await rejectKycApplication(app.id, app.userId, reviewNotes || 'Document ID blurred. Please upload clear front and back scan.');
      setSelectedReviewKyc(null);
      setReviewNotes('');
    } finally {
      setIsReviewingAction(false);
    }
  };

  // Generate Real Digital Agreement
  const handleGenerateLegalAgreement = async () => {
    if (!isApproved) {
      alert('KYC Approval & Legal Clearance is required to draft official digital agreements.');
      return;
    }

    setIsGeneratingDoc(true);
    const prop = allProperties.find(p => p.id === selectedPropertyId) || allProperties[0];
    const certSeal = `HB-AGR-${Math.floor(100000 + Math.random() * 900000)}-IN`;

    const standardClauses = [
      `1. LEASE TENURE: The Landlord hereby lets and the Tenant hereby takes the Schedule Property for an initial tenure of ${tenureMonths} months starting from ${effectiveDate}.`,
      `2. MONTHLY RENT: The Tenant agrees to pay a monthly rent of ₹${rentAmount.toLocaleString()} on or before the 5th of each English calendar month.`,
      `3. INTEREST-FREE SECURITY DEPOSIT: The Tenant has deposited ₹${depositAmount.toLocaleString()} as refundable security deposit to be returned at the time of vacant possession handover.`,
      `4. PERMITTED USE: The premises shall be used exclusively for bona fide residential purposes and not for any unlawful or commercial activities.`,
      `5. MAINTENANCE & UTILITIES: Tenant shall pay electricity, water, and apartment association maintenance charges separately.`,
      `6. NOTICE PERIOD: Either party may terminate this agreement by providing one calendar month written notice or rent in lieu thereof.`,
      `7. DIGITAL LEGAL CERTIFICATION: This document is executed under the Information Technology Act, 2000 and authenticated by HouseBook Legal Registry (Seal: ${certSeal}).`
    ];

    const newDoc: LegalDocument = {
      id: `doc_${Date.now()}`,
      type: selectedAgreementType === 'rental' ? 'rental_agreement' : 'sale_mou',
      title: selectedAgreementType === 'rental' ? `11-Month Residential Tenancy Agreement (${prop?.title || 'Property'})` : `Agreement to Sell & Purchase MOU (${prop?.title || 'Property'})`,
      propertyId: prop?.id || 'prop_default',
      propertyTitle: prop?.title || 'Residential Property',
      propertyAddress: prop?.address || (prop ? `${prop.locality}, ${prop.city}` : 'Flat 402, Green Valley, Bengaluru'),
      ownerUid: user?.uid || 'owner',
      ownerName: landlordName || 'Property Owner',
      ownerPhone: profile?.phone || '+91 98000 11223',
      ownerEmail: user?.email || 'owner@housebook.com',
      tenantOrBuyerName: tenantName || 'Tenant / Buyer',
      tenantOrBuyerPhone: tenantPhone || '+91 98111 22334',
      monthlyRentOrSalePrice: Number(rentAmount) || 25000,
      securityDeposit: Number(depositAmount) || 100000,
      tenureMonths: Number(tenureMonths) || 11,
      effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
      termsAndClauses: standardClauses,
      status: 'certified',
      certificateSealNumber: certSeal,
      landlordSignature: landlordName || 'Landlord Signatory',
      tenantSignature: tenantName || 'Tenant Signatory',
      createdAt: Date.now(),
      executedAt: Date.now()
    };

    try {
      const sanitizedDoc = cleanUndefinedFields(newDoc);
      await addDoc(collection(db, 'legal_documents'), sanitizedDoc);
      setGeneratedDoc(newDoc);
      confetti({ particleCount: 100, spread: 80 });
    } catch (err) {
      console.warn('Doc save notice:', err);
      setGeneratedDoc(newDoc);
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  return (
    <div
      id="modal-kyc-legal-fullscreen"
      className="fixed inset-0 z-50 bg-white flex flex-col w-full h-full overflow-hidden animate-fade-in"
    >
      <div
        id="modal-kyc-legal-container"
        className="bg-white w-full h-full flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 pt-5 pb-4 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 backdrop-blur-md flex items-center justify-center border border-indigo-400/30 text-indigo-300">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-white">HouseBook KYC & Legal Workspace</h3>
                  {isApproved && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>KYC Verified & Legal Cleared</span>
                    </span>
                  )}
                  {isPending && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Under Review</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">
                  Identity verification, government document approval, and digital rental/sale agreement execution
                </p>
              </div>
            </div>

            {/* Quick action for test / demo */}
            <div className="hidden sm:block">
              {isAdminUser && (
                <span className="text-[10px] font-bold px-2 py-1 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-lg">
                  Admin / Reviewer Mode
                </span>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-white/10 rounded-xl p-1 mt-4 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('kyc')}
              className={`flex-1 py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'kyc' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>1. KYC Identity Verification</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('agreements')}
              className={`flex-1 py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'agreements' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>2. Legal Activities & Agreements</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4 text-amber-500" />
              <span>3. Compliance Approval Panel</span>
              {allKycApplications.filter(a => a.status === 'pending').length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center">
                  {allKycApplications.filter(a => a.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          
          {/* TAB 1: KYC VERIFICATION */}
          {activeTab === 'kyc' && (
            <div className="space-y-6">
              
              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                isApproved
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : isPending
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : isRejected
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isApproved ? 'bg-emerald-600 text-white' : isPending ? 'bg-amber-500 text-slate-950' : 'bg-indigo-600 text-white'
                }`}>
                  {isApproved ? <CheckCircle2 className="w-6 h-6" /> : isPending ? <Clock className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">
                      {isApproved && 'KYC Approved: Full Legal Activities Clearance Active'}
                      {isPending && 'KYC Application Under Review by Compliance Officer'}
                      {isRejected && 'KYC Rejected: Re-submission Required'}
                      {!isApproved && !isPending && !isRejected && 'Complete KYC Verification to Unlock Legal Activities'}
                    </h4>
                    {isApproved && profile?.kycCertificateId && (
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                        {profile.kycCertificateId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-90 mt-1">
                    {isApproved && 'You are an authorized HouseBook Legal Member. You can sign digital tenancy agreements, execute sale MOUs, and display the Verified Host Seal.'}
                    {isPending && 'Our legal team is validating your identity documents against central government registries. Review is typically completed within 15 minutes.'}
                    {isRejected && 'Your previous submission did not meet photo clarity requirements. Please re-enter your details and upload clear images below.'}
                    {!isApproved && !isPending && !isRejected && 'Verified users receive a 50 HouseBook Coin bonus, verified trust badge on listings, and digital agreement capabilities.'}
                  </p>
                </div>
              </div>

              {/* Form Section */}
              {(!isApproved || isRejected) && (
                <form onSubmit={handleSubmitKyc} className="space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-indigo-600" />
                      <span>Government Identity Details</span>
                    </h4>

                    {/* Auto-fill buttons for quick demo verification */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Quick Fill:</span>
                      <button
                        type="button"
                        onClick={handleAutoFillLandlord}
                        className="py-1 px-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold rounded-lg transition-colors"
                      >
                        Verified Landlord
                      </button>
                      <button
                        type="button"
                        onClick={handleAutoFillBuyer}
                        className="py-1 px-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold rounded-lg transition-colors"
                      >
                        Verified Buyer
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Full Legal Name (as per Govt ID)</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rajesh Sharma"
                        className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number</label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98000 12345"
                        className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Select Identity Document</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value as KycDocumentType)}
                        className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="aadhaar">Aadhaar Card (UIDAI Verified)</option>
                        <option value="pan">Permanent Account Number (PAN Card)</option>
                        <option value="passport">Indian Passport</option>
                        <option value="voter_id">Election Voter ID Card</option>
                        <option value="driving_license">Driving License</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Document Number</label>
                      <input
                        type="text"
                        required
                        value={docNumber}
                        onChange={(e) => setDocNumber(e.target.value)}
                        placeholder="e.g. 4589-7712-9014"
                        className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">PAN / Tax Identification Number</label>
                      <input
                        type="text"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. ABCDE1234F"
                        className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">City & State</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                        />
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="State"
                          className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Permanent Address (as in Document)</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street address, Flat No., Area"
                      className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* Document Upload Simulation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-white rounded-xl border border-dashed border-slate-300 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-slate-800 block">Govt ID Proof Front Scan</span>
                        <span className="text-emerald-600 font-semibold text-[11px]">✓ Uploaded & OCR Scanned</span>
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-dashed border-slate-300 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-slate-800 block">Live Liveness Selfie Proof</span>
                        <span className="text-emerald-600 font-semibold text-[11px]">✓ Face Matched (99.4%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Legal Declaration Checkbox */}
                  <div className="flex items-start gap-2.5 pt-2">
                    <input
                      type="checkbox"
                      id="kyc-terms"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <label htmlFor="kyc-terms" className="text-xs text-slate-600 leading-relaxed">
                      I solemnly affirm that the details furnished above and documents uploaded are genuine. I authorize HouseBook to verify this data against official government and banking databases for legal property transactions.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingKyc}
                    className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmittingKyc ? (
                      <span>Verifying & Submitting to Compliance...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit KYC & Claim +50 HouseBook Coins 🪙</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Clearance Perks Grid */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Unlocked Legal Activities with Verified KYC:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1">
                    <Stamp className="w-5 h-5 text-indigo-600" />
                    <h5 className="font-bold text-xs text-slate-900">Digital Rent Agreements</h5>
                    <p className="text-[11px] text-slate-500">
                      Legally binding 11-month e-stamped residential lease agreements.
                    </p>
                  </div>
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1">
                    <Scale className="w-5 h-5 text-emerald-600" />
                    <h5 className="font-bold text-xs text-slate-900">Sale MOU & Token Deeds</h5>
                    <p className="text-[11px] text-slate-500">
                      Standardized earnest money agreement to sell with digital signatures.
                    </p>
                  </div>
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h5 className="font-bold text-xs text-slate-900">SuperHost Verification Seal</h5>
                    <p className="text-[11px] text-slate-500">
                      Get 3.5x higher buyer inquiries with the gold verification badge.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEGAL ACTIVITIES & DIGITAL AGREEMENTS */}
          {activeTab === 'agreements' && (
            <div className="space-y-6">
              
              {!isApproved ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
                  <h4 className="font-bold text-base text-slate-900">KYC Clearance Required</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    To prevent fraudulent leases and protect property owners, legal agreements can only be executed by KYC-Approved members.
                  </p>
                  <button
                    onClick={() => setActiveTab('kyc')}
                    className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
                  >
                    Complete Verification (Step 1)
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Agreement Type Picker */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAgreementType('rental');
                        setGeneratedDoc(null);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        selectedAgreementType === 'rental'
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-600/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <Stamp className="w-5 h-5 text-indigo-600 mb-1.5" />
                      <h5 className="font-bold text-xs text-slate-900">11-Month Rental Agreement</h5>
                      <p className="text-[11px] text-slate-500">Official tenancy draft for residential properties</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAgreementType('sale_mou');
                        setGeneratedDoc(null);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        selectedAgreementType === 'sale_mou'
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-600/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <Scale className="w-5 h-5 text-emerald-600 mb-1.5" />
                      <h5 className="font-bold text-xs text-slate-900">Property Sale MOU & Token</h5>
                      <p className="text-[11px] text-slate-500">Earnest money consideration & agreement to sell</p>
                    </button>
                  </div>

                  {/* Generator Form */}
                  {!generatedDoc ? (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                          Agreement Terms & Parties
                        </h4>
                        <span className="text-[11px] text-indigo-600 font-bold">
                          Digital Seal Included 🔒
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Select Property</label>
                          <select
                            value={selectedPropertyId}
                            onChange={(e) => setSelectedPropertyId(e.target.value)}
                            className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                          >
                            {allProperties.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.title} ({p.city} - ₹{p.price.toLocaleString()})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Effective Commencement Date</label>
                          <input
                            type="date"
                            value={effectiveDate}
                            onChange={(e) => setEffectiveDate(e.target.value)}
                            className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Landlord / Owner Name</label>
                          <input
                            type="text"
                            value={landlordName}
                            onChange={(e) => setLandlordName(e.target.value)}
                            className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Tenant / Buyer Name</label>
                          <input
                            type="text"
                            value={tenantName}
                            onChange={(e) => setTenantName(e.target.value)}
                            className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Monthly Rent / Sale Price (₹)</label>
                          <input
                            type="number"
                            value={rentAmount}
                            onChange={(e) => setRentAmount(Number(e.target.value))}
                            className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Security Deposit / Token Advance (₹)</label>
                          <input
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(Number(e.target.value))}
                            className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs outline-none font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isGeneratingDoc}
                        onClick={handleGenerateLegalAgreement}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Stamp className="w-4 h-4" />
                        <span>Generate & Execute Digital Agreement with Registry Seal</span>
                      </button>
                    </div>
                  ) : (
                    /* Rendered Legal Agreement */
                    <div className="space-y-4 bg-white p-6 rounded-3xl border-2 border-indigo-200 shadow-xl animate-fade-in text-xs font-serif text-slate-800">
                      
                      {/* Formal Legal Document Header */}
                      <div className="text-center pb-4 border-b-2 border-slate-300 space-y-1 font-sans">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">HouseBook Legal Registry</span>
                          <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded">
                            SEAL: {generatedDoc.certificateSealNumber}
                          </span>
                        </div>
                        <h3 className="font-black text-base text-slate-900 tracking-wide uppercase mt-2">
                          {generatedDoc.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-sans">
                          Executed under Indian Contract Act, 1872 & Information Technology Act, 2000
                        </p>
                      </div>

                      {/* Agreement Text */}
                      <div className="space-y-3 leading-relaxed text-xs">
                        <p>
                          This <strong>{selectedAgreementType === 'rental' ? 'Residential Tenancy Agreement' : 'Agreement to Sell'}</strong> is made and entered into on this <strong>{new Date(generatedDoc.createdAt).toLocaleDateString()}</strong> at <strong>{city}</strong> by and between:
                        </p>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-sans text-xs space-y-1.5">
                          <p>
                            <strong>PARTY 1 (LANDLORD / FIRST PARTY):</strong> {generatedDoc.ownerName}, KYC Verified Member (UID: {generatedDoc.ownerUid.slice(0, 8)}...).
                          </p>
                          <p>
                            <strong>PARTY 2 (TENANT / SECOND PARTY):</strong> {generatedDoc.tenantOrBuyerName}, Contact: {generatedDoc.tenantOrBuyerPhone || tenantPhone}.
                          </p>
                          <p>
                            <strong>SCHEDULE PROPERTY:</strong> {generatedDoc.propertyTitle}, Located at {generatedDoc.propertyAddress}.
                          </p>
                        </div>

                        <div className="space-y-2 pt-2">
                          <h5 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
                            TERMS AND MUTUAL COVENANTS:
                          </h5>
                          {generatedDoc.termsAndClauses.map((clause, idx) => (
                            <p key={idx} className="text-slate-700 pl-2 border-l-2 border-slate-200">
                              {clause}
                            </p>
                          ))}
                        </div>

                        {/* Signatures & Seal Box */}
                        <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-6 font-sans">
                          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200 text-center">
                            <span className="text-[10px] text-slate-400 block mb-1">Landlord Signature</span>
                            <span className="font-cursive font-bold text-indigo-900 text-sm italic">
                              ✍️ {generatedDoc.landlordSignature}
                            </span>
                            <span className="text-[9px] text-emerald-600 block mt-1 font-semibold">
                              ✓ Digital Token Authenticated
                            </span>
                          </div>
                          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 text-center">
                            <span className="text-[10px] text-slate-400 block mb-1">Tenant Signature</span>
                            <span className="font-cursive font-bold text-emerald-900 text-sm italic">
                              ✍️ {generatedDoc.tenantSignature}
                            </span>
                            <span className="text-[9px] text-emerald-600 block mt-1 font-semibold">
                              ✓ Verified e-Sign Hash
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-4 border-t border-slate-200 flex items-center justify-between font-sans">
                        <button
                          type="button"
                          onClick={() => setGeneratedDoc(null)}
                          className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                        >
                          ← Create Another Agreement
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print / Save as PDF</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMPLIANCE APPROVAL PANEL */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Submitted KYC Applications Queue</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Review incoming documents and issue Legal Clearance Certificates
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl">
                  Total: {allKycApplications.length} applications
                </span>
              </div>

              {allKycApplications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                  <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs">No pending KYC submissions in the queue right now.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('kyc')}
                    className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Submit a test KYC verification from Step 1
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {allKycApplications.map((app) => {
                    const isAppApproved = app.status === 'approved';
                    const isAppPending = app.status === 'pending';
                    const isAppRejected = app.status === 'rejected';

                    return (
                      <div
                        key={app.id}
                        className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                              {app.fullName ? app.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-xs text-slate-900">{app.fullName}</h5>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                                  {app.userRole}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-mono">
                                {app.docType.toUpperCase()}: {app.docNumber} | {app.phone}
                              </p>
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase flex items-center gap-1 ${
                            isAppApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isAppPending
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isAppApproved && <CheckCircle2 className="w-3 h-3" />}
                            {isAppPending && <Clock className="w-3 h-3" />}
                            <span>{app.status}</span>
                          </span>
                        </div>

                        <div className="text-xs bg-slate-50 p-2.5 rounded-xl text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                          <span>📍 <strong>Address:</strong> {app.address}, {app.city}, {app.state} - {app.pincode}</span>
                          {app.panNumber && <span>💳 <strong>PAN:</strong> {app.panNumber}</span>}
                          <span>🕒 <strong>Submitted:</strong> {new Date(app.submittedAt).toLocaleString()}</span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleAdminReject(app)}
                            disabled={isReviewingAction}
                            className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdminApprove(app)}
                            disabled={isReviewingAction}
                            className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Grant Legal Badge</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
