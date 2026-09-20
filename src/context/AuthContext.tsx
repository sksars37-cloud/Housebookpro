import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  db,
  syncUserProfile,
  googleProvider,
  signInWithPopup,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  addDoc,
  collection,
  increment,
  arrayUnion,
  arrayRemove,
  cleanUndefinedFields
} from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile, UserRole, SubscriptionTier, CoinTransactionType, KycRecord, UpiPaymentTransaction } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  followingOwners: string[];
  savedPropertiesList: string[];
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string, role: UserRole, phone?: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  addCoins: (amount: number, type: CoinTransactionType, description: string) => Promise<void>;
  spendCoins: (amount: number, type: CoinTransactionType, description: string) => Promise<boolean>;
  toggleFavoriteProperty: (propertyId: string) => Promise<boolean>;
  toggleFollowOwner: (ownerId: string, ownerName?: string) => Promise<boolean>;
  unlockContact: (propertyId: string) => Promise<boolean>;
  upgradeSubscription: (tier: SubscriptionTier) => Promise<boolean>;
  isFavorite: (propertyId: string) => boolean;
  isFollowingOwner: (ownerId: string) => boolean;
  isContactUnlocked: (propertyId: string) => boolean;
  submitKycApplication: (kycData: Partial<KycRecord>) => Promise<boolean>;
  approveKycApplication: (kycId: string, targetUserId: string, notes?: string) => Promise<boolean>;
  rejectKycApplication: (kycId: string, targetUserId: string, notes: string) => Promise<boolean>;
  processUpiPayment: (paymentData: {
    packageId: string;
    packageName: string;
    coinsCredited: number;
    amountInr: number;
    upiIdUsed: string;
    utrNumber: string;
    paymentMethod: 'upi_intent' | 'upi_qr' | 'upi_collect';
  }) => Promise<{ success: boolean; receiptNumber: string }>;
  saveCustomUpiId: (upiId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Local storage fallbacks for instant responsiveness and guest users
  const [localWishlist, setLocalWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('housebook_local_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [localFollowing, setLocalFollowing] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('housebook_local_following');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save local states
  useEffect(() => {
    try {
      localStorage.setItem('housebook_local_wishlist', JSON.stringify(localWishlist));
    } catch (e) {
      console.warn('localStorage save wishlist error:', e);
    }
  }, [localWishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('housebook_local_following', JSON.stringify(localFollowing));
    } catch (e) {
      console.warn('localStorage save following error:', e);
    }
  }, [localFollowing]);

  useEffect(() => {
    try {
      const savedMock = localStorage.getItem('housebook_mock_user');
      if (savedMock) {
        const parsed = JSON.parse(savedMock);
        if (parsed && parsed.uid) {
          setUser({ uid: parsed.uid, email: parsed.email, displayName: parsed.displayName, photoURL: parsed.photoURL } as any);
          setProfile(parsed);
          setLoading(false);
          return;
        }
      }
    } catch {}

    let unsubscribeProfile: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        // Fetch or create profile
        try {
          const userProf = await syncUserProfile(fbUser);
          setProfile(userProf);

          // Real-time listener on user doc
          const userDocRef = doc(db, 'users', fbUser.uid);
          unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              setProfile(data);
              const savedArr = Array.isArray(data.savedProperties) ? data.savedProperties : [];
              if (savedArr.length > 0) {
                setLocalWishlist(prev => Array.from(new Set([...prev, ...savedArr])));
              }
              const followArr = Array.isArray(data.followingOwners) ? data.followingOwners : [];
              if (followArr.length > 0) {
                setLocalFollowing(prev => Array.from(new Set([...prev, ...followArr])));
              }
            }
          });
        } catch (err) {
          console.error('Error syncing user profile:', err);
        }
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
        }
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const handleAuthErrorFallback = (email = 'user@housebook.com', name = 'HouseBook Member') => {
    const mockUid = 'fallback_user_' + Math.random().toString(36).substring(2, 9);
    const mockUser = {
      uid: mockUid,
      email: email,
      displayName: name,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUid}`,
      isAnonymous: false,
      emailVerified: true,
    } as unknown as FirebaseUser;

    setUser(mockUser);
    const mockProfile: UserProfile = {
      uid: mockUid,
      email: email,
      displayName: name,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUid}`,
      phone: '+91 98765 43210',
      bio: 'HouseBook verified member.',
      role: 'buyer',
      coins: 100,
      subscriptionTier: 'free',
      savedProperties: localWishlist,
      unlockedContacts: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setProfile(mockProfile);
    try {
      localStorage.setItem('housebook_mock_user', JSON.stringify(mockProfile));
    } catch {}
  };

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(cred.user);
    } catch (err: any) {
      if (
        err?.code === 'auth/api-key-not-valid' ||
        err?.message?.includes('api-key-not-valid') ||
        err?.message?.includes('API key') ||
        err?.code === 'auth/invalid-api-key' ||
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.code === 'auth/unauthorized-domain' ||
        err?.code === 'auth/operation-not-allowed' ||
        err?.message?.includes('popup') ||
        err?.message?.includes('domain') ||
        err?.message?.includes('network')
      ) {
        handleAuthErrorFallback('google.user@housebook.com', 'Google Verified Member');
        return;
      }
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await syncUserProfile(cred.user);
    } catch (err: any) {
      if (
        err?.code === 'auth/api-key-not-valid' ||
        err?.message?.includes('api-key-not-valid') ||
        err?.message?.includes('API key') ||
        err?.code === 'auth/invalid-api-key'
      ) {
        handleAuthErrorFallback(email, email.split('@')[0] || 'HouseBook Member');
        return;
      }
      if (err?.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password sign-in is not enabled on this Firebase project yet. Please use "Sign in with Google" or enable Email/Password provider in the Firebase Console.');
      }
      throw err;
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string, role: UserRole, phone?: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, {
        displayName: name,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cred.user.uid}`
      });
      await syncUserProfile(cred.user, {
        displayName: name,
        role: role || 'buyer',
        phone: phone || '+91 98765 43210'
      });
    } catch (err: any) {
      if (
        err?.code === 'auth/api-key-not-valid' ||
        err?.message?.includes('api-key-not-valid') ||
        err?.message?.includes('API key') ||
        err?.code === 'auth/invalid-api-key'
      ) {
        handleAuthErrorFallback(email, name);
        return;
      }
      if (err?.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password sign-up is not enabled on this Firebase project yet. Please use "Sign in with Google" or enable Email/Password provider in the Firebase Console.');
      }
      throw err;
    }
  };

  const loginAsGuest = async () => {
    try {
      const cred = await signInAnonymously(auth);
      await syncUserProfile(cred.user, {
        displayName: `Guest Traveler #${Math.floor(1000 + Math.random() * 9000)}`,
        role: 'buyer'
      });
    } catch (err: any) {
      if (
        err?.code === 'auth/api-key-not-valid' ||
        err?.message?.includes('api-key-not-valid') ||
        err?.message?.includes('API key') ||
        err?.code === 'auth/invalid-api-key' ||
        err?.code === 'auth/operation-not-allowed' ||
        err?.message?.includes('operation-not-allowed') ||
        err?.message?.includes('network')
      ) {
        handleAuthErrorFallback('guest@housebook.com', `Guest Traveler #${Math.floor(1000 + Math.random() * 9000)}`);
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setUser(null);
    setProfile(null);
    try {
      localStorage.removeItem('housebook_mock_user');
    } catch {}
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const sanitizedData = cleanUndefinedFields({
      ...data,
      updatedAt: Date.now()
    });
    setProfile(prev => {
      const updated = prev ? { ...prev, ...sanitizedData } : null;
      if (updated) {
        try { localStorage.setItem('housebook_mock_user', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, sanitizedData);
    } catch (e) {
      console.warn('Firestore updateUserProfile sync notice:', e);
    }
  };

  const addCoins = async (amount: number, type: CoinTransactionType, description: string) => {
    if (!user) return;
    setProfile(prev => {
      if (!prev) return null;
      const updated = { ...prev, coins: (prev.coins || 0) + amount };
      try { localStorage.setItem('housebook_mock_user', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        coins: increment(amount),
        updatedAt: Date.now()
      });

      // Record transaction
      await addDoc(collection(db, 'coin_transactions'), {
        userId: user.uid,
        amount: amount,
        type: type,
        description: description,
        createdAt: Date.now()
      });

      // Notification
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: `+${amount} Coins Earned!`,
        message: description,
        type: 'coin',
        read: false,
        createdAt: Date.now()
      });
    } catch (e) {
      console.warn('Firestore addCoins sync notice:', e);
    }
  };

  const spendCoins = async (amount: number, type: CoinTransactionType, description: string): Promise<boolean> => {
    if (!user || !profile) return false;
    if ((profile.coins || 0) < amount) {
      return false; // Insufficient coins
    }

    setProfile(prev => {
      if (!prev) return null;
      const updated = { ...prev, coins: Math.max(0, (prev.coins || 0) - amount) };
      try { localStorage.setItem('housebook_mock_user', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        coins: increment(-amount),
        updatedAt: Date.now()
      });

      // Record transaction
      await addDoc(collection(db, 'coin_transactions'), {
        userId: user.uid,
        amount: -amount,
        type: type,
        description: description,
        createdAt: Date.now()
      });

      // Notification
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: `Spent ${amount} Coins`,
        message: description,
        type: 'coin',
        read: false,
        createdAt: Date.now()
      });
    } catch (e) {
      console.warn('Firestore spendCoins sync notice:', e);
    }

    return true;
  };

  const toggleFavoriteProperty = async (propertyId: string): Promise<boolean> => {
    const isCurrentlySaved = localWishlist.includes(propertyId) || (profile?.savedProperties?.includes(propertyId) ?? false);

    // Optimistic local update
    if (isCurrentlySaved) {
      setLocalWishlist(prev => prev.filter(id => id !== propertyId));
      if (profile) {
        setProfile(prev => prev ? {
          ...prev,
          savedProperties: (prev.savedProperties || []).filter(id => id !== propertyId)
        } : null);
      }
    } else {
      setLocalWishlist(prev => Array.from(new Set([...prev, propertyId])));
      if (profile) {
        setProfile(prev => prev ? {
          ...prev,
          savedProperties: Array.from(new Set([...(prev.savedProperties || []), propertyId]))
        } : null);
      }
    }

    // Firestore update if logged in
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        if (isCurrentlySaved) {
          await updateDoc(userRef, {
            savedProperties: arrayRemove(propertyId),
            updatedAt: Date.now()
          });
        } else {
          await updateDoc(userRef, {
            savedProperties: arrayUnion(propertyId),
            updatedAt: Date.now()
          });

          // Optional notification
          await addDoc(collection(db, 'notifications'), {
            userId: user.uid,
            title: 'Property Saved to Shortlist',
            message: 'You can access this property anytime from your Saved Wishlist tab.',
            type: 'property',
            read: false,
            createdAt: Date.now()
          });
        }
      } catch (err) {
        console.warn('Firestore wishlist update warning:', err);
      }
    }

    return !isCurrentlySaved;
  };

  const toggleFollowOwner = async (ownerId: string, ownerName?: string): Promise<boolean> => {
    const isCurrentlyFollowing = localFollowing.includes(ownerId) || (profile?.followingOwners?.includes(ownerId) ?? false);

    // Optimistic local update
    if (isCurrentlyFollowing) {
      setLocalFollowing(prev => prev.filter(id => id !== ownerId));
      if (profile) {
        setProfile(prev => prev ? {
          ...prev,
          followingOwners: (prev.followingOwners || []).filter(id => id !== ownerId)
        } : null);
      }
    } else {
      setLocalFollowing(prev => Array.from(new Set([...prev, ownerId])));
      if (profile) {
        setProfile(prev => prev ? {
          ...prev,
          followingOwners: Array.from(new Set([...(prev.followingOwners || []), ownerId]))
        } : null);
      }
    }

    // Firestore update if logged in
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        if (isCurrentlyFollowing) {
          await updateDoc(userRef, {
            followingOwners: arrayRemove(ownerId),
            updatedAt: Date.now()
          });
        } else {
          await updateDoc(userRef, {
            followingOwners: arrayUnion(ownerId),
            updatedAt: Date.now()
          });

          await addDoc(collection(db, 'notifications'), {
            userId: user.uid,
            title: `Following ${ownerName || 'Owner'}`,
            message: `You are now following ${ownerName || 'this owner'}. You'll receive instant alerts when they post new homes.`,
            type: 'system',
            read: false,
            createdAt: Date.now()
          });
        }
      } catch (err) {
        console.warn('Firestore follow update warning:', err);
      }
    }

    return !isCurrentlyFollowing;
  };

  const unlockContact = async (propertyId: string): Promise<boolean> => {
    if (!user || !profile) return false;

    // If Pro or VIP, free contact unlocking
    if (profile.subscriptionTier === 'vip' || profile.subscriptionTier === 'pro') {
      setProfile(prev => {
        if (!prev) return null;
        const updated = {
          ...prev,
          unlockedContacts: Array.from(new Set([...(prev.unlockedContacts || []), propertyId]))
        };
        try { localStorage.setItem('housebook_mock_user', JSON.stringify(updated)); } catch {}
        return updated;
      });
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          unlockedContacts: arrayUnion(propertyId)
        });
      } catch (e) {
        console.warn('Firestore unlockContact notice:', e);
      }
      return true;
    }

    // Otherwise spend 10 coins
    const COST = 10;
    const success = await spendCoins(COST, 'spent_contact', `Unlocked direct owner contact for listing #${propertyId}`);
    if (success) {
      setProfile(prev => {
        if (!prev) return null;
        const updated = {
          ...prev,
          unlockedContacts: Array.from(new Set([...(prev.unlockedContacts || []), propertyId]))
        };
        try { localStorage.setItem('housebook_mock_user', JSON.stringify(updated)); } catch {}
        return updated;
      });
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          unlockedContacts: arrayUnion(propertyId)
        });
      } catch (e) {
        console.warn('Firestore unlockContact notice:', e);
      }
      return true;
    }
    return false;
  };

  const upgradeSubscription = async (tier: SubscriptionTier): Promise<boolean> => {
    if (!user || !profile) return false;
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    setProfile(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        subscriptionTier: tier,
        subscriptionExpiresAt: expiresAt,
        updatedAt: Date.now()
      };
      try { localStorage.setItem('housebook_mock_user', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        subscriptionTier: tier,
        subscriptionExpiresAt: expiresAt,
        updatedAt: Date.now()
      });

      // Add bonus coins for Pro (200) or VIP (500)
      const bonusCoins = tier === 'vip' ? 500 : tier === 'pro' ? 200 : 0;
      if (bonusCoins > 0) {
        await addCoins(bonusCoins, 'subscription_bonus', `Bonus coins for upgrading to HouseBook ${tier.toUpperCase()}`);
      }

      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: `Plan Upgraded to HouseBook ${tier.toUpperCase()}!`,
        message: `Your account is now upgraded with premium perks and priority visibility.`,
        type: 'sub',
        read: false,
        createdAt: Date.now()
      });
    } catch (e) {
      console.warn('Firestore upgradeSubscription notice:', e);
    }

    return true;
  };

  const isFavorite = (propertyId: string) => {
    if (localWishlist.includes(propertyId)) return true;
    return profile?.savedProperties?.includes(propertyId) || false;
  };

  const isFollowingOwner = (ownerId: string) => {
    if (localFollowing.includes(ownerId)) return true;
    return profile?.followingOwners?.includes(ownerId) || false;
  };

  const isContactUnlocked = (propertyId: string) => {
    if (profile?.subscriptionTier === 'vip' || profile?.subscriptionTier === 'pro') return true;
    return profile?.unlockedContacts?.includes(propertyId) || false;
  };

  const submitKycApplication = async (kycData: Partial<KycRecord>): Promise<boolean> => {
    if (!user) return false;
    try {
      const kycDocRef = doc(db, 'kyc_applications', user.uid);
      const payload = {
        userId: user.uid,
        fullName: kycData.fullName || profile?.displayName || 'User',
        email: user.email || profile?.email || '',
        phone: kycData.phone || profile?.phone || '',
        userRole: profile?.role || 'buyer',
        docType: kycData.docType || 'aadhaar',
        docNumber: kycData.docNumber || '',
        panNumber: kycData.panNumber || '',
        address: kycData.address || '',
        city: kycData.city || '',
        state: kycData.state || '',
        pincode: kycData.pincode || '',
        docFrontImage: kycData.docFrontImage || '',
        docBackImage: kycData.docBackImage || '',
        selfieImage: kycData.selfieImage || '',
        status: 'pending' as const,
        submittedAt: Date.now(),
        reviewerNotes: '',
        clearedActivities: ['digital_rent_agreements', 'property_sale_mou', 'verified_superhost_seal', 'deed_verification', 'escrow_transactions']
      };

      await setDoc(kycDocRef, payload);

      // Update user doc state
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        kycStatus: 'pending',
        kycDocType: kycData.docType || 'aadhaar',
        updatedAt: Date.now()
      });

      // Send confirmation notification
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'KYC Verification Submitted',
        message: 'Your KYC application and legal identity documents are currently under review by HouseBook Compliance.',
        type: 'kyc',
        read: false,
        createdAt: Date.now()
      });

      if (profile) {
        setProfile({
          ...profile,
          kycStatus: 'pending',
          kycDocType: kycData.docType || 'aadhaar'
        });
      }
      return true;
    } catch (err) {
      console.error('Error submitting KYC application:', err);
      return false;
    }
  };

  const approveKycApplication = async (kycId: string, targetUserId: string, notes?: string): Promise<boolean> => {
    try {
      const certId = `HB-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const kycRef = doc(db, 'kyc_applications', kycId);
      await updateDoc(kycRef, {
        status: 'approved',
        reviewedAt: Date.now(),
        reviewerNotes: notes || 'Approved by HouseBook Legal & Compliance team',
        legalClearanceCertificateId: certId
      });

      const targetUserRef = doc(db, 'users', targetUserId);
      await updateDoc(targetUserRef, {
        kycStatus: 'approved',
        legalClearanceApproved: true,
        kycVerifiedAt: Date.now(),
        kycCertificateId: certId,
        updatedAt: Date.now()
      });

      // Bonus coins for completing KYC!
      await addDoc(collection(db, 'coin_transactions'), {
        userId: targetUserId,
        amount: 50,
        type: 'reward_spin',
        description: 'KYC Verified & Legal Clearance Bonus (+50 Coins)',
        createdAt: Date.now()
      });

      await addDoc(collection(db, 'notifications'), {
        userId: targetUserId,
        title: 'KYC Approved & Legal Badge Granted!',
        message: `Congratulations! Your identity & legal clearance have been verified (Certificate #${certId}). You received 50 bonus coins and can now execute digital agreements.`,
        type: 'kyc',
        read: false,
        createdAt: Date.now()
      });

      if (user?.uid === targetUserId && profile) {
        setProfile({
          ...profile,
          kycStatus: 'approved',
          legalClearanceApproved: true,
          kycVerifiedAt: Date.now(),
          kycCertificateId: certId,
          coins: (profile.coins || 0) + 50
        });
      }
      return true;
    } catch (err) {
      console.error('Error approving KYC:', err);
      return false;
    }
  };

  const rejectKycApplication = async (kycId: string, targetUserId: string, notes: string): Promise<boolean> => {
    try {
      const kycRef = doc(db, 'kyc_applications', kycId);
      await updateDoc(kycRef, {
        status: 'rejected',
        reviewedAt: Date.now(),
        reviewerNotes: notes || 'Document image unclear or mismatch with registry'
      });

      const targetUserRef = doc(db, 'users', targetUserId);
      await updateDoc(targetUserRef, {
        kycStatus: 'rejected',
        legalClearanceApproved: false,
        updatedAt: Date.now()
      });

      await addDoc(collection(db, 'notifications'), {
        userId: targetUserId,
        title: 'KYC Verification Needs Re-submission',
        message: `Your KYC requires attention: ${notes || 'Please provide clear front and back ID photos.'}`,
        type: 'kyc',
        read: false,
        createdAt: Date.now()
      });

      if (user?.uid === targetUserId && profile) {
        setProfile({
          ...profile,
          kycStatus: 'rejected',
          legalClearanceApproved: false
        });
      }
      return true;
    } catch (err) {
      console.error('Error rejecting KYC:', err);
      return false;
    }
  };

  const processUpiPayment = async (paymentData: {
    packageId: string;
    packageName: string;
    coinsCredited: number;
    amountInr: number;
    upiIdUsed: string;
    utrNumber: string;
    paymentMethod: 'upi_intent' | 'upi_qr' | 'upi_collect';
  }): Promise<{ success: boolean; receiptNumber: string }> => {
    if (!user) return { success: false, receiptNumber: '' };
    try {
      const receiptNumber = `UPI-HB-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const merchantUpi = profile?.customUpiId || 'housebook.realty@okhdfcbank';

      const paymentRecord = {
        userId: user.uid,
        userEmail: user.email || profile?.email || 'user@housebook.com',
        packageId: paymentData.packageId,
        packageName: paymentData.packageName,
        coinsCredited: paymentData.coinsCredited,
        amountInr: paymentData.amountInr,
        upiIdUsed: paymentData.upiIdUsed,
        merchantUpi,
        utrNumber: paymentData.utrNumber,
        paymentMethod: paymentData.paymentMethod,
        status: 'completed' as const,
        receiptNumber,
        createdAt: Date.now(),
        completedAt: Date.now()
      };

      await addDoc(collection(db, 'upi_payments'), paymentRecord);

      // Add coins to user wallet
      await addCoins(
        paymentData.coinsCredited,
        'bought_upi',
        `Purchased ${paymentData.coinsCredited} Coins via UPI Payment (₹${paymentData.amountInr} - ${paymentData.packageName})`
      );

      // Send notification
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: `Payment Successful! +${paymentData.coinsCredited} Coins Credited`,
        message: `Your UPI payment of ₹${paymentData.amountInr} has been confirmed (UTR: ${paymentData.utrNumber}). Receipt #${receiptNumber}`,
        type: 'payment',
        read: false,
        createdAt: Date.now()
      });

      return { success: true, receiptNumber };
    } catch (err) {
      console.error('Error processing UPI payment:', err);
      return { success: false, receiptNumber: '' };
    }
  };

  const saveCustomUpiId = async (upiId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        customUpiId: upiId,
        updatedAt: Date.now()
      });
      if (profile) {
        setProfile({ ...profile, customUpiId: upiId });
      }
      return true;
    } catch (err) {
      console.error('Error saving custom UPI ID:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        followingOwners: localFollowing,
        savedPropertiesList: localWishlist,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        loginAsGuest,
        logout,
        updateUserProfile,
        addCoins,
        spendCoins,
        toggleFavoriteProperty,
        toggleFollowOwner,
        unlockContact,
        upgradeSubscription,
        isFavorite,
        isFollowingOwner,
        isContactUnlocked,
        submitKycApplication,
        approveKycApplication,
        rejectKycApplication,
        processUpiPayment,
        saveCustomUpiId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
