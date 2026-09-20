export type ListingType = 'sale' | 'rent';

export type CurrencyCode = 'INR' | 'USD' | 'EUR';

export type PropertyType =
  | 'apartment'
  | 'villa'
  | 'independent_house'
  | 'penthouse'
  | 'studio'
  | 'commercial'
  | 'duplex';

export type FurnishingStatus = 'furnished' | 'semi_furnished' | 'unfurnished';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  rentPeriod?: 'monthly' | 'yearly';
  listingType: ListingType;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  furnishing: FurnishingStatus;
  city: string;
  locality: string;
  address: string;
  images: string[];
  amenities: string[];
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAvatar?: string;
  ownerRole?: string;
  ownerBio?: string;
  ownerJoined?: string;
  isFeatured: boolean;
  isVerified: boolean;
  views: number;
  coinsBoostExpiresAt?: number;
  createdAt: number;
  updatedAt?: number;
  status: 'available' | 'rented' | 'sold';
  deposit?: number;
  maintenanceFee?: number;
  floor?: string;
  facing?: 'North' | 'South' | 'East' | 'West' | 'North-East' | 'North-West' | 'South-East' | 'South-West';
  parking?: 'Covered' | 'Open' | 'None' | '2+ Covered';
}

export type UserRole = 'buyer' | 'tenant' | 'owner' | 'agent';
export type SubscriptionTier = 'free' | 'pro' | 'vip';
export type KycStatus = 'unsubmitted' | 'pending' | 'approved' | 'rejected';
export type KycDocumentType = 'aadhaar' | 'pan' | 'passport' | 'voter_id' | 'driving_license';

export interface KycRecord {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  userRole: UserRole;
  docType: KycDocumentType;
  docNumber: string;
  panNumber?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  docFrontImage?: string;
  docBackImage?: string;
  selfieImage?: string;
  status: KycStatus;
  submittedAt: number;
  reviewedAt?: number;
  reviewerNotes?: string;
  legalClearanceCertificateId?: string;
  clearedActivities?: string[];
}

export type LegalDocType =
  | 'rental_agreement'
  | 'sale_mou'
  | 'title_clearance'
  | 'possession_handover';

export interface LegalDocument {
  id: string;
  type: LegalDocType;
  title: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyAddress?: string;
  ownerUid: string;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  tenantOrBuyerUid?: string;
  tenantOrBuyerName: string;
  tenantOrBuyerPhone?: string;
  tenantOrBuyerEmail?: string;
  monthlyRentOrSalePrice: number;
  securityDeposit?: number;
  tenureMonths?: number;
  effectiveDate: string;
  termsAndClauses: string[];
  status: 'draft' | 'pending_signature' | 'executed' | 'certified';
  certificateSealNumber: string;
  landlordSignature?: string;
  tenantSignature?: string;
  createdAt: number;
  executedAt?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  bio?: string;
  role: UserRole;
  coins: number;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt?: number;
  savedProperties: string[];
  followingOwners?: string[]; // list of owner UIDs user follows
  unlockedContacts?: string[]; // list of propertyIds whose owner contacts have been unlocked with coins
  kycStatus?: KycStatus;
  kycVerifiedAt?: number;
  kycDocType?: KycDocumentType;
  legalClearanceApproved?: boolean;
  kycCertificateId?: string;
  isAdmin?: boolean;
  customUpiId?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface UpiPackage {
  id: string;
  name: string;
  coins: number;
  bonusCoins: number;
  priceInr: number;
  popular?: boolean;
  tag?: string;
}

export interface UpiPaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  packageId: string;
  packageName: string;
  coinsCredited: number;
  amountInr: number;
  upiIdUsed: string;
  merchantUpi: string;
  utrNumber: string;
  paymentMethod: 'upi_intent' | 'upi_qr' | 'upi_collect';
  status: 'initiated' | 'completed' | 'failed';
  receiptNumber: string;
  createdAt: number;
  completedAt?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  text: string;
  timestamp: number;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  participantAvatars?: Record<string, string>;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyImage: string;
  lastMessage: string;
  lastMessageSenderId: string;
  lastMessageTimestamp: number;
  unreadCount?: Record<string, number>;
  updatedAt: number;
}

export type NotificationType = 'chat' | 'coin' | 'property' | 'sub' | 'system' | 'kyc' | 'legal' | 'payment';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: number;
}

export type CoinTransactionType =
  | 'earned_ad'
  | 'daily_bonus'
  | 'welcome_bonus'
  | 'spent_feature'
  | 'spent_contact'
  | 'spent_boost'
  | 'subscription_bonus'
  | 'reward_spin'
  | 'bought_upi'
  | 'legal_doc_fee';

export interface CoinTransaction {
  id: string;
  userId: string;
  amount: number;
  type: CoinTransactionType;
  description: string;
  createdAt: number;
}

export interface AdSponsor {
  id: string;
  brandName: string;
  tagline: string;
  videoUrl?: string;
  bannerImage: string;
  ctaText: string;
  ctaLink: string;
  durationSeconds: number;
  rewardCoins: number;
  category: string;
}

export interface FilterState {
  searchQuery: string;
  listingType: ListingType | 'all';
  city: string;
  propertyType: PropertyType | 'all';
  minPrice: number;
  maxPrice: number;
  bedrooms: number | 'all';
  bathrooms: number | 'all';
  furnishing: FurnishingStatus | 'all';
  amenities: string[];
  verifiedOnly: boolean;
  featuredOnly: boolean;
  sortBy: 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'views';
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  priceUsd: number;
  priceCoins: number;
  period: string;
  features: string[];
  badgeColor: string;
  popular?: boolean;
}
