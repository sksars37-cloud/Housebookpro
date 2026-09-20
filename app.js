/**
 * HouseBook - Pure HTML, CSS, JavaScript Real Estate & Housing Portal
 * Standalone, zero-dependencies client-side application.
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  setDoc,
  collection,
  onSnapshot
} from 'firebase/firestore';
import { createIcons, icons } from 'lucide';

// Register global Lucide bundle for instant rendering across DOM updates
window.lucide = {
  createIcons: (options = {}) => createIcons({ icons, ...options }),
  icons
};

// Firebase Auth & Firestore Configuration
const firebaseConfig = {
  projectId: "gen-lang-client-0709806365",
  appId: "1:193700883699:web:dbb04ddaadbe07be4adb86",
  apiKey: "AIzaSyCc0O6fAib-ghflSdz9OJ5HsqYbkpbSmSU",
  authDomain: "gen-lang-client-0709806365.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-452bf84c-a7a0-4bec-8e0e-da245b4f0e11",
  storageBucket: "gen-lang-client-0709806365.firebasestorage.app",
  messagingSenderId: "193700883699",
  measurementId: "",
  oAuthClientId: "193700883699-kg1oi5vpvj6gca38mv6i175pp21dn1ot.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Initialize Firestore with experimentalForceLongPolling to eliminate 10s backend connection timeouts in sandboxed/iframe environments
let db;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}
const auth = getAuth(app);

// Firestore Error Handler Pattern for Security Rules & Diagnostics
function handleFirestoreError(error, operationType, path = null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  return errInfo;
}

// Resilient Online / Offline Network Monitor (Graceful status, zero 10s blocking network calls)
function initNetworkStatusMonitor() {
  const updateStatus = () => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const statusIndicator = document.getElementById('network-status-indicator');
    if (statusIndicator) {
      if (isOnline) {
        statusIndicator.className = "hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800 text-[11px] font-bold shadow-xs cursor-default";
        statusIndicator.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Cloud</span>
        `;
        statusIndicator.title = "Connected to Live Cloud Firestore";
      } else {
        statusIndicator.className = "hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 text-[11px] font-bold shadow-xs cursor-default";
        statusIndicator.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>Offline Cache</span>
        `;
        statusIndicator.title = "Operating in seamless offline cached mode";
      }
    }
  };

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  setTimeout(updateStatus, 150);
}
initNetworkStatusMonitor();

// Initial Sample Properties Dataset
const SAMPLE_PROPERTIES = [
  {
    id: 'prop-101',
    title: 'Skyline Azure 3BHK Ultra-Luxury Penthouse',
    description: 'Breathtaking panoramic skyline views with floor-to-ceiling glass facades, private infinity plunge pool, Italian marble flooring, designer modular kitchen, and smart automated lighting. Located in prime residential sector with private elevator access.',
    price: 45000000, // in INR
    listingType: 'sale',
    propertyType: 'penthouse',
    bedrooms: 3,
    bathrooms: 3,
    areaSqFt: 2450,
    furnishing: 'furnished',
    city: 'Mumbai',
    locality: 'Bandra West',
    address: 'Carter Road, Bandra West, Mumbai 400050',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Swimming Pool', 'Gym', 'Covered Parking', '24/7 Security', 'Power Backup', 'Balcony', 'Private Garden', 'High Speed WiFi', 'Air Conditioning', 'Elevator'],
    ownerId: 'agent-rajesh-01',
    ownerName: 'Rajesh Sharma',
    ownerPhone: '+91 98201 44521',
    ownerEmail: 'rajesh.sharma@housebook-realty.com',
    ownerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
    isFeatured: true,
    isVerified: true,
    views: 1420,
    createdAt: Date.now() - 86400000 * 2,
    status: 'available',
    floor: '24th of 28 Floors',
    facing: 'North-East',
    parking: '2+ Covered'
  },
  {
    id: 'prop-102',
    title: 'Emerald Palms Modern Garden Villa',
    description: 'Independent 4BHK Spanish style duplex villa with private landscaped garden, home theatre room, separate servant quarter, solar power backup, and gated 24/7 security surveillance in prime Whitefield community.',
    price: 85000, // Monthly rent in INR
    rentPeriod: 'monthly',
    listingType: 'rent',
    propertyType: 'villa',
    bedrooms: 4,
    bathrooms: 4,
    areaSqFt: 3600,
    furnishing: 'semi_furnished',
    city: 'Bangalore',
    locality: 'Whitefield',
    address: 'Palm Meadows Boulevard, Whitefield, Bangalore 560066',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Private Garden', 'Club House', 'Gym', 'Covered Parking', '24/7 Security', 'Pet Friendly', 'Modular Kitchen', 'Power Backup'],
    ownerId: 'owner-priya-02',
    ownerName: 'Priya Iyer',
    ownerPhone: '+91 97410 88234',
    ownerEmail: 'priya.iyer@gmail.com',
    ownerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    isFeatured: true,
    isVerified: true,
    views: 980,
    createdAt: Date.now() - 86400000 * 4,
    status: 'available',
    deposit: 250000,
    maintenanceFee: 5000,
    floor: 'Ground + 1',
    facing: 'East',
    parking: 'Covered'
  },
  {
    id: 'prop-103',
    title: 'Urban Heights 2BHK Designer Apartment',
    description: 'Well-ventilated East-facing 2 bedroom residence next to tech hubs and metro station. Features imported wooden finish tiles, pre-fitted ACs, spacious balcony with garden view.',
    price: 12500000, // in INR
    listingType: 'sale',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1180,
    furnishing: 'furnished',
    city: 'Pune',
    locality: 'Kalyani Nagar',
    address: 'Tower 4, Urban Heights, Kalyani Nagar, Pune 411006',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Gym', 'Elevator', '24/7 Security', 'Covered Parking', 'Balcony', 'Air Conditioning', 'High Speed WiFi'],
    ownerId: 'agent-vikram-03',
    ownerName: 'Vikram Mehta (Premier)',
    ownerPhone: '+91 99220 33112',
    ownerEmail: 'vikram.mehta@realtyexperts.in',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    isFeatured: false,
    isVerified: true,
    views: 650,
    createdAt: Date.now() - 86400000 * 1,
    status: 'available',
    floor: '9th of 16 Floors',
    facing: 'East',
    parking: 'Covered'
  },
  {
    id: 'prop-104',
    title: 'Minimalist Chic Studio Loft near Cyber City',
    description: 'Cozy and stylish studio unit fully furnished with Murphy bed, smart projector, kitchenette, workstation desk, and walk-in wardrobe. Ideal for tech professionals and singles.',
    price: 32000, // Monthly rent in INR
    rentPeriod: 'monthly',
    listingType: 'rent',
    propertyType: 'studio',
    bedrooms: 1,
    bathrooms: 1,
    areaSqFt: 520,
    furnishing: 'furnished',
    city: 'Gurgaon',
    locality: 'DLF Phase 2',
    address: 'Block M, DLF Phase 2, Gurgaon, Haryana 122002',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['High Speed WiFi', 'Air Conditioning', 'Elevator', '24/7 Security', 'Modular Kitchen', 'Power Backup'],
    ownerId: 'owner-ananya-04',
    ownerName: 'Ananya Verma',
    ownerPhone: '+91 98110 54321',
    ownerEmail: 'ananya.v@outlook.com',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    isFeatured: false,
    isVerified: true,
    views: 820,
    createdAt: Date.now() - 86400000 * 5,
    status: 'available',
    deposit: 64000,
    floor: '3rd of 8 Floors',
    facing: 'North',
    parking: 'Open'
  },
  {
    id: 'prop-105',
    title: 'The Grand Royale 4BHK Duplex Manor',
    description: 'Sprawling high-rise duplex residence with double-height ceiling living room, jacuzzi in master suite, private terrace BBQ deck, and dedicated 3-car parking in prestigious Jubilee Hills.',
    price: 68000000, // in INR
    listingType: 'sale',
    propertyType: 'duplex',
    bedrooms: 4,
    bathrooms: 5,
    areaSqFt: 3950,
    furnishing: 'furnished',
    city: 'Hyderabad',
    locality: 'Jubilee Hills',
    address: 'Road No. 36, Jubilee Hills, Hyderabad 500033',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Swimming Pool', 'Club House', 'Private Garden', 'Gym', '24/7 Security', 'Pet Friendly', 'Balcony', 'Covered Parking', 'Elevator'],
    ownerId: 'agent-suresh-05',
    ownerName: 'Suresh Reddy (Prime Estates)',
    ownerPhone: '+91 94401 22998',
    ownerEmail: 'suresh@primeestates.com',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    isFeatured: true,
    isVerified: true,
    views: 2100,
    createdAt: Date.now() - 86400000 * 3,
    status: 'available',
    floor: '18th & 19th Duplex',
    facing: 'East',
    parking: '2+ Covered'
  },
  {
    id: 'prop-106',
    title: 'Prime Corporate Plaza Grade-A Office Space',
    description: 'Ready-to-move fully fitted office space with 40 workstations, 2 conference rooms, executive cabins, reception lobby, pantry, and server room in prime tech corridor.',
    price: 185000, // Monthly rent in INR
    rentPeriod: 'monthly',
    listingType: 'rent',
    propertyType: 'commercial',
    bedrooms: 0,
    bathrooms: 2,
    areaSqFt: 2800,
    furnishing: 'furnished',
    city: 'Delhi NCR',
    locality: 'Noida Sector 62',
    address: 'Tower B, Tech Boulevard, Sector 62, Noida 201309',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Covered Parking', '24/7 Security', 'Power Backup', 'High Speed WiFi', 'Air Conditioning', 'Elevator'],
    ownerId: 'agent-amit-06',
    ownerName: 'Amit Saxena',
    ownerPhone: '+91 98102 99881',
    ownerEmail: 'amit.commercial@housebook.com',
    ownerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
    isFeatured: false,
    isVerified: true,
    views: 430,
    createdAt: Date.now() - 86400000 * 7,
    status: 'available',
    deposit: 550000,
    floor: '5th of 12 Floors',
    parking: '2+ Covered'
  },
  {
    id: 'prop-107',
    title: 'Oceanic Breeze 2BHK Sea-View Flat',
    description: 'Breathtaking uninterrupted Arabian Sea view from living area and master bedroom balcony. Features high ceiling, teak wood doors, Italian tiles, modular kitchen, and reserved basement parking on iconic Marine Drive boulevard.',
    price: 110000, // Monthly rent in INR
    rentPeriod: 'monthly',
    listingType: 'rent',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1150,
    furnishing: 'furnished',
    city: 'Mumbai',
    locality: 'Marine Drive',
    address: 'Marine Drive Promenade, Churchgate, Mumbai 400020',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Sea View', 'Covered Parking', '24/7 Security', 'Elevator', 'Power Backup', 'Air Conditioning', 'High Speed WiFi'],
    ownerId: 'owner-sunil-07',
    ownerName: 'Sunil Kapoor',
    ownerPhone: '+91 98200 77112',
    ownerEmail: 'sunil.kapoor@outlook.com',
    ownerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
    isFeatured: true,
    isVerified: true,
    views: 1890,
    createdAt: Date.now() - 86400000 * 1,
    status: 'available',
    deposit: 350000,
    floor: '11th of 18 Floors',
    facing: 'West',
    parking: 'Covered'
  },
  {
    id: 'prop-108',
    title: 'Greenwood Heights 3BHK Smart Apartment',
    description: 'Modern eco-friendly smart home with home automation systems, EV charging dock, solar water heating, clubhouse access, temperature controlled swimming pool, and badminton court.',
    price: 16500000, // in INR
    listingType: 'sale',
    propertyType: 'apartment',
    bedrooms: 3,
    bathrooms: 3,
    areaSqFt: 1820,
    furnishing: 'semi_furnished',
    city: 'Bangalore',
    locality: 'HSR Layout',
    address: 'Sector 2, HSR Layout, Bangalore 560102',
    images: [
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Swimming Pool', 'Gym', 'Club House', 'Covered Parking', '24/7 Security', 'EV Charging', 'Power Backup'],
    ownerId: 'agent-nisha-08',
    ownerName: 'Nisha Sharma (Green Homes)',
    ownerPhone: '+91 98800 33441',
    ownerEmail: 'nisha@greenhomes.in',
    ownerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    isFeatured: true,
    isVerified: true,
    views: 1120,
    createdAt: Date.now() - 86400000 * 3,
    status: 'available',
    floor: '6th of 14 Floors',
    facing: 'East',
    parking: 'Covered'
  },
  {
    id: 'prop-109',
    title: 'Heritage Portuguese Villa with Private Pool',
    description: 'Exquisite restored 4BHK Goan Portuguese heritage villa nestled in lush coconut groves near Anjuna Beach. Features private swimming pool, open air courtyard, sun deck, and guest cottage.',
    price: 52000000, // in INR
    listingType: 'sale',
    propertyType: 'villa',
    bedrooms: 4,
    bathrooms: 4,
    areaSqFt: 4200,
    furnishing: 'furnished',
    city: 'Goa',
    locality: 'Anjuna',
    address: 'St. Michael Vaddo, Anjuna, North Goa 403509',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Private Garden', 'Swimming Pool', 'Pet Friendly', 'Balcony', 'Covered Parking', 'Power Backup', 'Air Conditioning'],
    ownerId: 'owner-mario-09',
    ownerName: 'Mario D\'Souza',
    ownerPhone: '+91 98221 66543',
    ownerEmail: 'mario.goa@gmail.com',
    ownerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
    isFeatured: true,
    isVerified: true,
    views: 3100,
    createdAt: Date.now() - 86400000 * 2,
    status: 'available',
    floor: 'Ground + 1',
    facing: 'East',
    parking: '3 Open'
  },
  {
    id: 'prop-110',
    title: 'Royal Palm Residency 4BHK Luxury Flat',
    description: 'Palatial 4 bedroom luxury apartment in gated South Delhi colony with private lift, Italian marble lounge, VRV centralized AC, 100% power backup, and servant quarters.',
    price: 38000000, // in INR
    listingType: 'sale',
    propertyType: 'apartment',
    bedrooms: 4,
    bathrooms: 4,
    areaSqFt: 2900,
    furnishing: 'semi_furnished',
    city: 'Delhi NCR',
    locality: 'Vasant Vihar',
    address: 'Block C, Vasant Vihar, New Delhi 110057',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Covered Parking', 'Elevator', '24/7 Security', 'Power Backup', 'Balcony', 'Air Conditioning'],
    ownerId: 'agent-rohit-10',
    ownerName: 'Rohit Tandon',
    ownerPhone: '+91 98111 88990',
    ownerEmail: 'rohit.tandon@delhirealty.com',
    ownerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
    isFeatured: false,
    isVerified: true,
    views: 1450,
    createdAt: Date.now() - 86400000 * 5,
    status: 'available',
    floor: '2nd Floor Builder Floor',
    facing: 'North-East',
    parking: '2 Covered'
  },
  {
    id: 'prop-111',
    title: 'DLF Golf Links 4BHK Golf-Course View Residence',
    description: 'Exclusive 4BHK corner apartment overlooking DLF Golf Course. Italian fitted modular kitchen, private Jacuzzi balcony, club access with Olympic pool and tennis court.',
    price: 59000000, // in INR
    listingType: 'sale',
    propertyType: 'apartment',
    bedrooms: 4,
    bathrooms: 4,
    areaSqFt: 3400,
    furnishing: 'furnished',
    city: 'Gurgaon',
    locality: 'Golf Course Road',
    address: 'DLF Phase 5, Golf Course Road, Gurgaon 122002',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Swimming Pool', 'Gym', 'Club House', 'Covered Parking', '24/7 Security', 'Elevator', 'Power Backup'],
    ownerId: 'agent-karan-11',
    ownerName: 'Karan Malhotra',
    ownerPhone: '+91 98100 22334',
    ownerEmail: 'karan@gurgaonluxury.in',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    isFeatured: true,
    isVerified: true,
    views: 2300,
    createdAt: Date.now() - 86400000 * 2,
    status: 'available',
    floor: '14th of 22 Floors',
    facing: 'East',
    parking: '2 Covered'
  },
  {
    id: 'prop-112',
    title: 'Magarpatta City 2BHK Fully Furnished Flat',
    description: 'Comfortable 2 bedroom apartment inside self-sustained Magarpatta Township close to Cybercity IT park. Fully furnished with sofa set, double beds, wardrobes, smart TV, and washing machine.',
    price: 36000, // Monthly rent in INR
    rentPeriod: 'monthly',
    listingType: 'rent',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1050,
    furnishing: 'furnished',
    city: 'Pune',
    locality: 'Hadapsar',
    address: 'Jasminium Tower, Magarpatta City, Hadapsar, Pune 411028',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Gym', 'Club House', 'Elevator', '24/7 Security', 'Covered Parking', 'Power Backup', 'Air Conditioning'],
    ownerId: 'owner-neha-12',
    ownerName: 'Neha Deshmukh',
    ownerPhone: '+91 98900 11223',
    ownerEmail: 'neha.d@gmail.com',
    ownerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    isFeatured: false,
    isVerified: true,
    views: 790,
    createdAt: Date.now() - 86400000 * 6,
    status: 'available',
    deposit: 80000,
    floor: '5th of 11 Floors',
    facing: 'East',
    parking: 'Covered'
  },
  {
    id: 'prop-113',
    title: 'Pink City Heritage Haveli & Resort Compound',
    description: 'Magnificent 6BHK traditional Rajasthani Haveli with intricate Jharokha stone carving, marble pillars, central fountains, royal courtyards, and lush sprawling lawn grounds.',
    price: 75000000, // in INR
    listingType: 'sale',
    propertyType: 'villa',
    bedrooms: 6,
    bathrooms: 7,
    areaSqFt: 6800,
    furnishing: 'furnished',
    city: 'Jaipur',
    locality: 'C Scheme',
    address: 'Ashok Nagar, C Scheme, Jaipur 302001',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Private Garden', 'Pet Friendly', 'Covered Parking', 'Balcony', 'Air Conditioning', 'Power Backup'],
    ownerId: 'owner-digvijay-13',
    ownerName: 'Thakur Digvijay Singh',
    ownerPhone: '+91 94140 55667',
    ownerEmail: 'digvijay.jaipur@royalheritage.com',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    isFeatured: true,
    isVerified: true,
    views: 3400,
    createdAt: Date.now() - 86400000 * 3,
    status: 'available',
    floor: 'Ground + 2',
    facing: 'North-East',
    parking: '4+ Open'
  },
  {
    id: 'prop-114',
    title: 'HITEC City Prime Commercial Showroom & Retail Ground',
    description: 'Glass-front commercial showroom located on main road opposite Mindspace IT Park. High footfall area with excellent signage visibility, basement customer parking, and high power capacity.',
    price: 240000, // Monthly rent in INR
    rentPeriod: 'monthly',
    listingType: 'rent',
    propertyType: 'commercial',
    bedrooms: 0,
    bathrooms: 2,
    areaSqFt: 3200,
    furnishing: 'unfurnished',
    city: 'Hyderabad',
    locality: 'HITEC City',
    address: 'Mindspace Main Road, HITEC City, Hyderabad 500081',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Covered Parking', '24/7 Security', 'Power Backup', 'Elevator'],
    ownerId: 'agent-venkat-14',
    ownerName: 'Venkat Rao',
    ownerPhone: '+91 98490 88776',
    ownerEmail: 'venkat@hyderabadcommercial.com',
    ownerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
    isFeatured: false,
    isVerified: true,
    views: 610,
    createdAt: Date.now() - 86400000 * 4,
    status: 'available',
    deposit: 720000,
    floor: 'Ground Floor',
    parking: 'Covered'
  }
];

// App Global State
const state = {
  properties: [],
  currency: 'INR', // 'INR' | 'USD' | 'EUR'
  activeTab: 'explore', // 'explore' | 'shortlist' | 'chats' | 'legal' | 'requests' | 'analytics'
  activeFilterListingType: 'all',
  activeCity: 'all',
  activeBhk: 'all',
  activeType: 'all',
  activeBudget: 'all',
  searchQuery: '',
  selectedProperty: null,
  activeChatId: 'chat-101',
  propertyRequests: [
    {
      id: 'req-1',
      title: 'Urgently looking for 3BHK Penthouse / Flat in Bandra West',
      buyerName: 'Aarav Malhotra',
      buyerPhone: '+91 98210 11223',
      city: 'Mumbai',
      locality: 'Bandra West',
      bedrooms: 3,
      propertyType: 'apartment',
      listingType: 'rent',
      budget: '₹80,000 - ₹1.2 Lakh/mo',
      possession: 'Immediate',
      notes: 'Prefer sea-facing or high floor unit with minimum 2 covered car parkings.',
      postedAt: 'Today',
      status: 'active'
    },
    {
      id: 'req-2',
      title: 'Looking to Buy 4BHK Independent Villa in Whitefield',
      buyerName: 'Kavita Sundaram',
      buyerPhone: '+91 97400 44556',
      city: 'Bangalore',
      locality: 'Whitefield',
      bedrooms: 4,
      propertyType: 'villa',
      listingType: 'sale',
      budget: '₹2.5 Cr - ₹3.5 Cr',
      possession: 'Within 1 Month',
      notes: 'Gated community with private garden area and clubhouse access required.',
      postedAt: 'Yesterday',
      status: 'active'
    },
    {
      id: 'req-3',
      title: 'Requirement for Commercial Grade-A Office Space (2500+ Sq.Ft)',
      buyerName: 'Sanjay Deshmukh',
      buyerPhone: '+91 98190 99887',
      city: 'Gurgaon',
      locality: 'DLF Cyber City',
      bedrooms: 0,
      propertyType: 'commercial',
      listingType: 'rent',
      budget: 'Under ₹2 Lakh/mo',
      possession: 'Immediate',
      notes: 'Fully furnished with 30+ workstations, 2 cabins, and pantry.',
      postedAt: '3 days ago',
      status: 'active'
    }
  ],
  user: {
    name: 'Guest User',
    email: '',
    phone: '',
    role: 'Buyer',
    coins: 100,
    isVip: false,
    savedProperties: [],
    unlockedProperties: [],
    isLoggedIn: false
  },
  chats: [
    {
      id: 'chat-101',
      propertyId: 'prop-101',
      sellerName: 'Rajesh Sharma',
      sellerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
      propertyTitle: 'Skyline Azure 3BHK Penthouse',
      propertyPrice: '₹4.50 Cr',
      messages: [
        { sender: 'seller', text: 'Namaste! Thank you for inquiring about Skyline Azure Penthouse in Bandra.', time: 'Yesterday 10:15 AM' },
        { sender: 'user', text: 'Hi Rajesh! Is this penthouse available for an in-person site visit this Saturday?', time: 'Yesterday 10:20 AM' },
        { sender: 'seller', text: 'Yes, absolutely! Saturday 4:00 PM is open. Would you like me to book a gate pass?', time: 'Yesterday 10:22 AM' }
      ]
    },
    {
      id: 'chat-102',
      propertyId: 'prop-102',
      sellerName: 'Priya Iyer',
      sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      propertyTitle: 'Emerald Palms Modern Garden Villa',
      propertyPrice: '₹85,000/mo',
      messages: [
        { sender: 'seller', text: 'Hello! I received your inquiry for the Whitefield villa. It comes with fully maintained private lawn.', time: '2 days ago' },
        { sender: 'user', text: 'Great, are pets allowed inside the villa?', time: '2 days ago' },
        { sender: 'seller', text: 'Yes, pets are warmly welcomed in our community!', time: '2 days ago' }
      ]
    }
  ]
};

// Currency Conversion Rates (Base: INR)
const CURRENCY_RATES = {
  INR: { rate: 1, symbol: '₹', code: 'INR' },
  USD: { rate: 0.012, symbol: '$', code: 'USD' },
  EUR: { rate: 0.011, symbol: '€', code: 'EUR' }
};

// Initialize Application
function initApp() {
  // Initialize Firebase Auth
  initFirebaseAuth();

  // Load custom properties from localStorage
  try {
    const savedProps = localStorage.getItem('housebook_custom_properties');
    if (savedProps) {
      const parsed = JSON.parse(savedProps);
      if (Array.isArray(parsed)) {
        state.properties = [...parsed, ...SAMPLE_PROPERTIES.filter(sp => !parsed.some(p => p.id === sp.id))];
      } else {
        state.properties = [...SAMPLE_PROPERTIES];
      }
    } else {
      state.properties = [...SAMPLE_PROPERTIES];
    }

    const savedUser = localStorage.getItem('housebook_user_data');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      state.user = { ...state.user, ...parsedUser };
    }
  } catch (e) {
    state.properties = [...SAMPLE_PROPERTIES];
  }

  // Bind event listeners
  setupEventListeners();

  // Render UI
  updateUserStatsUI();
  renderProperties();
  renderShortlist();
  renderChats();

  // Refresh Lucide Icons
  refreshIcons();

  // Handle deep link hash e.g. housebook.com/property/prop-101 or #property-prop-101
  /* setTimeout(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#property-')) {
      const propId = hash.replace('#property-', '');
      if (propId) openPropertyDetail(propId);
    }
  }, 500); */

  // Hide Splash Screen after brief load
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.style.opacity = '0';
      splash.style.transition = 'opacity 0.4s ease';
      setTimeout(() => {
        splash.remove();
      }, 400);
    }
  }, 900);
}

// Format Price according to selected currency
function formatPrice(amountInINR, listingType) {
  const curr = CURRENCY_RATES[state.currency] || CURRENCY_RATES.INR;
  const converted = Math.round(amountInINR * curr.rate);
  const suffix = listingType === 'rent' ? '/mo' : '';

  if (state.currency === 'INR') {
    if (amountInINR >= 10000000) {
      return `₹${(amountInINR / 10000000).toFixed(2)} Cr${suffix}`;
    } else if (amountInINR >= 100000) {
      return `₹${(amountInINR / 100000).toFixed(2)} Lakh${suffix}`;
    } else {
      return `₹${amountInINR.toLocaleString('en-IN')}${suffix}`;
    }
  } else {
    return `${curr.symbol}${converted.toLocaleString()}${suffix}`;
  }
}

// Quick Category Pills Filtering
window.setFilterCategory = function(category) {
  state.activeFilterListingType = category === 'all' ? 'all' : (category === 'sale' || category === 'rent' ? category : 'all');
  if (category === 'villa') {
    state.activeType = 'villa';
    state.activeFilterListingType = 'all';
  } else if (category === 'commercial') {
    state.activeType = 'commercial';
    state.activeFilterListingType = 'all';
  } else {
    state.activeType = 'all';
  }

  // Update pill styles
  document.querySelectorAll('.explore-cat-pill').forEach(btn => {
    btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm', 'font-black');
    btn.classList.add('bg-slate-100', 'text-slate-700', 'font-bold');
  });
  if (event && event.currentTarget) {
    event.currentTarget.classList.remove('bg-slate-100', 'text-slate-700', 'font-bold');
    event.currentTarget.classList.add('bg-indigo-600', 'text-white', 'shadow-sm', 'font-black');
  }

  renderProperties();
};

window.handleSearchSync = function(query) {
  state.searchQuery = query;
  renderProperties();
};

// Render Properties in Explore Grid
function renderProperties() {
  const grid = document.getElementById('properties-grid');
  const countBadge = document.getElementById('listing-count-display');
  const exploreBadge = document.getElementById('explore-properties-count-badge');
  if (!grid) return;

  // Filter properties
  const filtered = state.properties.filter(p => {
    // Listing Type Tab
    if (state.activeFilterListingType === 'sale' && p.listingType !== 'sale') return false;
    if (state.activeFilterListingType === 'rent' && p.listingType !== 'rent') return false;
    if (state.activeFilterListingType === 'commercial' && p.propertyType !== 'commercial') return false;
    if (state.activeFilterListingType === 'luxury' && !p.isFeatured && p.price < 40000000) return false;

    // City
    if (state.activeCity !== 'all' && p.city.toLowerCase() !== state.activeCity.toLowerCase()) return false;

    // BHK
    if (state.activeBhk !== 'all') {
      const bhkNum = parseInt(state.activeBhk, 10);
      if (bhkNum === 4 && p.bedrooms < 4) return false;
      if (bhkNum !== 4 && p.bedrooms !== bhkNum) return false;
    }

    // Property Type
    if (state.activeType !== 'all' && p.propertyType !== state.activeType) return false;

    // Budget
    if (state.activeBudget !== 'all') {
      if (state.activeBudget === 'budget-low' && p.price > 5000000) return false;
      if (state.activeBudget === 'budget-mid' && (p.price < 5000000 || p.price > 20000000)) return false;
      if (state.activeBudget === 'budget-high' && p.price < 20000000) return false;
    }

    // Search Query
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const match = p.title.toLowerCase().includes(q) ||
                    p.locality.toLowerCase().includes(q) ||
                    p.city.toLowerCase().includes(q) ||
                    p.address.toLowerCase().includes(q) ||
                    p.propertyType.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} Properties`;
  }
  if (exploreBadge) {
    exploreBadge.textContent = `${filtered.length} Properties Found`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <i data-lucide="search-x" class="w-8 h-8"></i>
        </div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">No Matching Properties Found</h3>
        <p class="text-slate-500 max-w-md mx-auto mb-6">Try clearing some of your filters or searching with a different locality or property type.</p>
        <button onclick="resetAllFilters()" class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm shadow-md transition-colors">
          <i data-lucide="rotate-ccw" class="w-4 h-4"></i> Reset All Filters
        </button>
      </div>
    `;
    refreshIcons();
    return;
  }

  grid.innerHTML = filtered.map(property => {
    const isSaved = state.user.savedProperties.includes(property.id);
    const isUnlocked = state.user.unlockedProperties.includes(property.id) || state.user.isVip;
    const firstImg = property.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';

    return `
      <div class="property-card bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm flex flex-col group">
        <!-- Card Image Header -->
        <div class="relative h-60 w-full overflow-hidden bg-slate-100 cursor-pointer" onclick="openPropertyDetail('${property.id}')">
          <img 
            src="${firstImg}" 
            alt="${property.title}"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20"></div>

          <!-- Badges -->
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            ${property.isVerified ? `
              <span class="badge-verified px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600"></i> Verified
              </span>
            ` : ''}
            <span class="${property.listingType === 'sale' ? 'badge-sale' : 'badge-rent'} px-2.5 py-1 rounded-full text-xs font-bold uppercase">
              For ${property.listingType}
            </span>
          </div>

          <!-- Favorite Button -->
          <button 
            type="button"
            onclick="event.stopPropagation(); toggleFavorite('${property.id}')"
            class="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-rose-500 hover:scale-110 flex items-center justify-center shadow-md transition-all z-10"
            title="${isSaved ? 'Remove from Saved' : 'Save Property'}"
          >
            <i data-lucide="heart" class="w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}"></i>
          </button>

          <!-- Price & Photo count on Image Bottom -->
          <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white z-10">
            <div>
              <div class="text-2xl font-extrabold tracking-tight drop-shadow-md">
                ${formatPrice(property.price, property.listingType)}
              </div>
              <div class="text-xs text-slate-200 flex items-center gap-1 font-medium">
                <i data-lucide="map-pin" class="w-3 h-3 text-indigo-400"></i>
                ${property.locality}, ${property.city}
              </div>
            </div>
            <div class="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-1">
              <i data-lucide="image" class="w-3 h-3"></i> ${property.images.length}
            </div>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 
              class="font-bold text-slate-800 text-base mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1 cursor-pointer"
              onclick="openPropertyDetail('${property.id}')"
            >
              ${property.title}
            </h3>

            <!-- Specifications Grid -->
            <div class="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 text-xs text-slate-600 font-medium mb-3">
              <div class="flex items-center gap-1.5">
                <i data-lucide="bed" class="w-4 h-4 text-indigo-500"></i>
                <span>${property.bedrooms > 0 ? `${property.bedrooms} BHK` : property.propertyType.toUpperCase()}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <i data-lucide="bath" class="w-4 h-4 text-indigo-500"></i>
                <span>${property.bathrooms} Baths</span>
              </div>
              <div class="flex items-center gap-1.5">
                <i data-lucide="maximize" class="w-4 h-4 text-indigo-500"></i>
                <span>${property.areaSqFt} sq.ft</span>
              </div>
            </div>
          </div>

          <!-- Card Action Buttons -->
          <div class="grid grid-cols-2 gap-2 pt-2">
            <button 
              type="button"
              onclick="openPropertyDetail('${property.id}')"
              class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-600"></i>
              View Details
            </button>

            <button 
              type="button"
              onclick="${isUnlocked ? `window.open('tel:${property.ownerPhone}')` : `unlockContact('${property.id}')`}"
              class="px-3 py-2 ${isUnlocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <i data-lucide="${isUnlocked ? 'phone-call' : 'lock'}" class="w-3.5 h-3.5"></i>
              ${isUnlocked ? 'Call Owner' : 'Unlock (10 🪙)'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  refreshIcons();
}

// Render Shortlisted Properties Tab
function renderShortlist() {
  const container = document.getElementById('shortlist-grid');
  const countBadge = document.getElementById('shortlist-count-badge');
  if (!container) return;

  const savedList = state.properties.filter(p => state.user.savedProperties.includes(p.id));

  if (countBadge) {
    countBadge.textContent = savedList.length;
  }

  if (savedList.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <i data-lucide="heart-off" class="w-8 h-8"></i>
        </div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">No Saved Properties Yet</h3>
        <p class="text-slate-500 max-w-md mx-auto mb-6">Click the heart icon on any property to save it to your personal shortlist for quick access.</p>
        <button onclick="switchTab('explore')" class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm shadow-md transition-colors">
          <i data-lucide="compass" class="w-4 h-4"></i> Browse Properties
        </button>
      </div>
    `;
    refreshIcons();
    return;
  }

  container.innerHTML = savedList.map(property => {
    return `
      <div class="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 p-4 items-center">
        <img 
          src="${property.images[0]}" 
          alt="${property.title}" 
          class="w-full md:w-44 h-36 rounded-xl object-cover cursor-pointer"
          onclick="openPropertyDetail('${property.id}')"
        />
        <div class="flex-1 w-full">
          <div class="flex items-start justify-between">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">For ${property.listingType}</span>
              <h4 class="font-bold text-slate-800 text-base hover:text-indigo-600 cursor-pointer" onclick="openPropertyDetail('${property.id}')">${property.title}</h4>
              <p class="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <i data-lucide="map-pin" class="w-3 h-3 text-slate-400"></i> ${property.locality}, ${property.city}
              </p>
            </div>
            <div class="text-right">
              <div class="text-lg font-extrabold text-indigo-600">${formatPrice(property.price, property.listingType)}</div>
              <span class="text-xs text-slate-400">${property.areaSqFt} sq.ft</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
            <div class="flex items-center gap-2 text-xs text-slate-600">
              <span class="bg-slate-100 px-2 py-1 rounded-lg">${property.bedrooms} Beds</span>
              <span class="bg-slate-100 px-2 py-1 rounded-lg">${property.bathrooms} Baths</span>
              <span class="bg-slate-100 px-2 py-1 rounded-lg capitalize">${property.furnishing.replace('_', ' ')}</span>
            </div>

            <div class="flex items-center gap-2">
              <button 
                onclick="toggleFavorite('${property.id}')"
                class="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium transition-colors"
              >
                Remove
              </button>
              <button 
                onclick="openPropertyDetail('${property.id}')"
                class="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  refreshIcons();
}

// AI Property Recommendations Engine (Offline-Resilient & Intelligent)
state.aiCategoryFilter = 'all';

function setAiCategoryFilter(cat) {
  state.aiCategoryFilter = cat;
  const pills = ['all', 'family', 'rental', 'budget', 'luxury'];
  pills.forEach(p => {
    const el = document.getElementById(`ai-pill-${p}`);
    if (el) {
      if (p === cat) {
        el.className = 'ai-filter-pill px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-black whitespace-nowrap transition-all text-[11px] shadow-sm cursor-pointer';
      } else {
        el.className = 'ai-filter-pill px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold whitespace-nowrap transition-all text-[11px] cursor-pointer';
      }
    }
  });

  const promptInput = document.getElementById('ai-prompt-input');
  const query = promptInput ? promptInput.value.trim() : '';
  renderAiRecommendations(cat, query);
}

function executeAiRecommendationSearch() {
  const promptInput = document.getElementById('ai-prompt-input');
  const query = promptInput ? promptInput.value.trim() : '';
  renderAiRecommendations(state.aiCategoryFilter || 'all', query);
  showToast('✨ AI recommendations updated based on your preferences!', 'success');
}

function calculateAiPropertyInsight(prop, category, query) {
  let matchScore = 93;
  let reason = '';
  let badgeTag = 'Top AI Pick';

  if (category === 'family' || (prop.bedrooms && prop.bedrooms >= 3)) {
    matchScore = 98;
    badgeTag = 'Family Choice';
    reason = `Spacious ${prop.bedrooms || 3}BHK layout (${prop.areaSqFt || 1800} sq.ft) with premium cross-ventilation, 24/7 gated security, and children's park.`;
  } else if (category === 'rental' || prop.listingType === 'rent') {
    matchScore = 97;
    badgeTag = 'High Rental Yield';
    reason = `Projected rental yield of approx. 5.8% annually with strong tenant demand in ${prop.locality || prop.city}. Zero brokerage direct-owner transaction.`;
  } else if (category === 'budget' || prop.price <= 20000000) {
    matchScore = 96;
    badgeTag = 'High Value Deal';
    reason = `Priced approx. 12% below current ${prop.locality || prop.city} locality benchmarks. High capital appreciation upside for buyers.`;
  } else if (category === 'luxury' || prop.propertyType === 'penthouse' || prop.propertyType === 'villa' || prop.price > 30000000) {
    matchScore = 99;
    badgeTag = 'Ultra Luxury';
    reason = `Architectural luxury with bespoke finishes, scenic open views, private elevator access, and clubhouse amenities.`;
  } else {
    if (prop.city === 'Mumbai') {
      matchScore = 98;
      reason = `Prime connectivity to BKC and Western Express Highway, RERA verified title clearance, and direct owner pricing.`;
    } else if (prop.city === 'Bangalore') {
      matchScore = 97;
      reason = `Proximity to key Tech Parks & international schools, serene tree-lined sector, and top-grade construction quality.`;
    } else if (prop.city === 'Delhi' || prop.city === 'Gurgaon') {
      matchScore = 96;
      reason = `Wide access avenues, metro connectivity within 700m, modular kitchen installed, and 100% power backup.`;
    } else {
      matchScore = 95;
      reason = `High-demand residential neighborhood with superior resale liquidity, zero brokerage fees, and clear ownership documents.`;
    }
  }

  if (query) {
    const qLower = query.toLowerCase();
    const searchable = `${prop.title} ${prop.description} ${prop.locality} ${prop.city} ${prop.amenities ? prop.amenities.join(' ') : ''}`.toLowerCase();
    if (searchable.includes(qLower)) {
      matchScore = Math.min(99, matchScore + 2);
      reason = `Directly matches your prompt "${query}". ${reason}`;
    }
  }

  return { matchScore, reason, badgeTag };
}

function renderAiRecommendations(category = state.aiCategoryFilter || 'all', query = '') {
  const container = document.getElementById('ai-recommendations-grid');
  const countBadge = document.getElementById('ai-results-count');
  if (!container) return;

  let filtered = [...state.properties];

  if (category === 'family') {
    filtered = filtered.filter(p => (p.bedrooms && p.bedrooms >= 3) || p.propertyType === 'villa' || p.propertyType === 'penthouse');
  } else if (category === 'rental') {
    filtered = filtered.filter(p => p.listingType === 'rent' || p.propertyType === 'commercial' || p.propertyType === 'apartment');
  } else if (category === 'budget') {
    filtered = filtered.filter(p => (p.listingType === 'sale' && p.price <= 20000000) || (p.listingType === 'rent' && p.price <= 50000));
  } else if (category === 'luxury') {
    filtered = filtered.filter(p => p.propertyType === 'penthouse' || p.propertyType === 'villa' || p.price >= 30000000);
  }

  if (query) {
    const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    if (tokens.length > 0) {
      filtered = filtered.filter(p => {
        const text = `${p.title} ${p.description} ${p.locality} ${p.city} ${p.propertyType} ${p.listingType} ${p.amenities ? p.amenities.join(' ') : ''}`.toLowerCase();
        return tokens.some(tok => text.includes(tok));
      });
    }
  }

  if (filtered.length === 0) {
    filtered = [...state.properties];
  }

  const scoredList = filtered.map(prop => ({
    prop,
    ...calculateAiPropertyInsight(prop, category, query)
  })).sort((a, b) => b.matchScore - a.matchScore);

  if (countBadge) {
    const catTitles = {
      all: 'Top AI Picks',
      family: 'Family Homes (3BHK+)',
      rental: 'High Rental Yield',
      budget: 'Budget Deals',
      luxury: 'Luxury & Villas'
    };
    countBadge.textContent = `Showing ${scoredList.length} AI Recommendations • ${catTitles[category] || 'Personalized Picks'}`;
  }

  container.innerHTML = scoredList.map(({ prop, matchScore, reason, badgeTag }) => {
    const isSaved = state.user.savedProperties.includes(prop.id);
    const imgUrl = (prop.images && prop.images.length > 0) ? prop.images[0] : (prop.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80');
    const loc = prop.locality ? `${prop.locality}, ${prop.city}` : (prop.city || 'Prime Location');

    return `
      <div class="property-card bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col group relative">
        <div class="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 backdrop-blur-md text-amber-300 text-xs font-black rounded-full border border-amber-400/40 shadow-xl">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-400 animate-pulse"></i>
          <span>${matchScore}% AI Match</span>
        </div>

        <div class="relative h-56 overflow-hidden bg-slate-900 cursor-pointer" onclick="openPropertyDetail('${prop.id}')">
          <img 
            src="${imgUrl}" 
            alt="${prop.title}"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>

          <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
            <span class="px-2.5 py-1 bg-white/20 backdrop-blur-md text-[11px] font-black rounded-lg uppercase tracking-wider">
              ${prop.propertyType}
            </span>
            <span class="text-sm font-black font-heading text-emerald-300 drop-shadow-md">
              ${formatPrice(prop.price, prop.listingType)}
            </span>
          </div>

          <button 
            type="button"
            onclick="event.stopPropagation(); toggleFavorite('${prop.id}')"
            class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-rose-600 transition-transform active:scale-90 shadow-md cursor-pointer z-20"
            title="${isSaved ? 'Remove from Saved' : 'Save to Shortlist'}"
          >
            <i data-lucide="heart" class="w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}"></i>
          </button>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2">
              <span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black rounded-md uppercase">
                ${badgeTag}
              </span>
              <span class="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                <i data-lucide="map-pin" class="w-3 h-3 text-slate-400"></i> ${loc}
              </span>
            </div>

            <h3 class="font-extrabold text-slate-900 text-base line-clamp-1 hover:text-indigo-600 cursor-pointer transition-colors" onclick="openPropertyDetail('${prop.id}')">
              ${prop.title}
            </h3>

            <div class="p-3 bg-gradient-to-r from-amber-50/90 to-indigo-50/90 border border-amber-200/80 rounded-2xl text-[11px] text-slate-800 leading-relaxed shadow-xs flex items-start gap-2">
              <i data-lucide="sparkles" class="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"></i>
              <p class="font-medium"><strong class="font-black text-indigo-950">Why AI Recommends:</strong> ${reason}</p>
            </div>

            <div class="flex items-center gap-3 text-xs text-slate-600 pt-1 font-bold">
              <span class="flex items-center gap-1"><i data-lucide="bed" class="w-3.5 h-3.5 text-slate-400"></i> ${prop.bedrooms || 3} BHK</span>
              <span>•</span>
              <span class="flex items-center gap-1"><i data-lucide="maximize" class="w-3.5 h-3.5 text-slate-400"></i> ${prop.areaSqFt || 1200} sq.ft</span>
              <span>•</span>
              <span class="capitalize text-slate-500">${(prop.furnishing || 'semi_furnished').replace('_', ' ')}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <button 
              type="button" 
              onclick="openPropertyDetail('${prop.id}')" 
              class="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-600"></i>
              <span>View Property</span>
            </button>
            <button 
              type="button" 
              onclick="startChatWithProperty('${prop.id}')" 
              class="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
            >
              <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
              <span>Chat Direct</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  refreshIcons();
}

// File Picker Image Upload State
let postPropertyImageFiles = [];

function handlePropertyImageFilesSelect(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      postPropertyImageFiles.push(e.target.result);
      renderPropertyImageFilePreviews();
    };
    reader.readAsDataURL(file);
  });
}

function renderPropertyImageFilePreviews() {
  const container = document.getElementById('post-property-file-previews');
  if (!container) return;

  if (postPropertyImageFiles.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = postPropertyImageFiles.map((img, idx) => `
    <div class="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
      <img src="${img}" class="w-full h-full object-cover" />
      <button 
        type="button" 
        onclick="removePostPropertyImageFile(${idx})" 
        class="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow hover:bg-rose-700"
      >
        ×
      </button>
    </div>
  `).join('');
}

function removePostPropertyImageFile(index) {
  postPropertyImageFiles.splice(index, 1);
  renderPropertyImageFilePreviews();
}

// Firestore Database Sync Helpers
async function savePropertyToFirestore(property) {
  try {
    if (db) {
      await setDoc(doc(db, 'properties', property.id), property, { merge: true });
      console.log('Firestore: Property synced doc');
    }
  } catch (e) {
    handleFirestoreError(e, 'write', `properties/${property.id}`);
    console.warn('Firestore sync warning:', e);
  }
}

async function saveChatToFirestore(chat) {
  try {
    if (db && auth.currentUser) {
      await setDoc(doc(db, 'chats', chat.id), chat, { merge: true });
      console.log('Firestore: Chat synced doc');
    }
  } catch (e) {
    handleFirestoreError(e, 'write', `chats/${chat.id}`);
    console.warn('Firestore sync warning:', e);
  }
}

// Instagram DM Style Chatting System
let chatSearchQuery = '';
let mobileChatActive = false;

function filterChatsList(query) {
  chatSearchQuery = query.toLowerCase();
  renderChats();
}

function selectChat(chatId) {
  state.activeChatId = chatId;
  mobileChatActive = true;
  renderChats();
}

function backToChatList() {
  mobileChatActive = false;
  renderChats();
}

function renderChats() {
  const chatList = document.getElementById('chat-conversations-list');
  const chatHeader = document.getElementById('chat-active-header');
  const chatMessages = document.getElementById('chat-messages-container');
  const listContainer = document.getElementById('chat-list-container');
  const windowContainer = document.getElementById('chat-window-container');
  if (!chatList || !chatMessages) return;

  // Toggle responsive layout on mobile
  if (listContainer && windowContainer) {
    if (mobileChatActive) {
      listContainer.classList.add('hidden');
      listContainer.classList.remove('flex');
      windowContainer.classList.remove('hidden');
      windowContainer.classList.add('flex');
    } else {
      listContainer.classList.remove('hidden');
      listContainer.classList.add('flex');
      windowContainer.classList.add('hidden');
      windowContainer.classList.remove('flex');
    }
  }

  const filteredChats = state.chats.filter(c => {
    if (!chatSearchQuery) return true;
    return c.sellerName.toLowerCase().includes(chatSearchQuery) ||
           c.propertyTitle.toLowerCase().includes(chatSearchQuery);
  });

  // Render left conversation list
  if (filteredChats.length === 0) {
    chatList.innerHTML = `
      <div class="p-6 text-center text-xs text-slate-400">
        No conversations matching "${chatSearchQuery}"
      </div>
    `;
  } else {
    chatList.innerHTML = filteredChats.map(chat => {
      const isActive = chat.id === state.activeChatId;
      const lastMsg = chat.messages[chat.messages.length - 1] || { text: 'Started inquiry', time: '' };

      return `
        <div 
          onclick="selectChat('${chat.id}')"
          class="p-2.5 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${isActive ? 'bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-purple-200 shadow-sm' : 'hover:bg-slate-100 border border-transparent'}"
        >
          <div class="relative flex-shrink-0">
            <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5">
              <img src="${chat.sellerAvatar}" class="w-full h-full rounded-full object-cover bg-white" />
            </div>
            <span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h5 class="font-extrabold text-slate-900 text-xs truncate flex items-center gap-1">
                ${chat.sellerName}
                <i data-lucide="badge-check" class="w-3.5 h-3.5 text-blue-500"></i>
              </h5>
              <span class="text-[10px] text-slate-400 font-medium">${lastMsg.time}</span>
            </div>
            <p class="text-[11px] text-purple-700 font-bold truncate">${chat.propertyTitle}</p>
            <p class="text-xs text-slate-500 truncate mt-0.5 ${isActive ? 'font-semibold text-slate-700' : ''}">
              ${lastMsg.sender === 'user' ? 'You: ' : ''}${lastMsg.image ? '📷 Sent a photo' : (lastMsg.voice ? '🎙️ Voice note' : lastMsg.text)}
            </p>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render active chat
  const activeChat = state.chats.find(c => c.id === state.activeChatId) || state.chats[0];
  if (activeChat) {
    if (chatHeader) {
      chatHeader.innerHTML = `
        <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button 
            type="button" 
            onclick="backToChatList()" 
            class="md:hidden p-1.5 -ml-1 text-slate-700 hover:bg-slate-100 rounded-xl flex items-center justify-center font-bold text-xs"
            title="Back to Conversations List"
          >
            <i data-lucide="arrow-left" class="w-5 h-5"></i>
          </button>

          <div class="relative flex-shrink-0">
            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 cursor-pointer" onclick="openOwnerProfile('${activeChat.sellerName}')">
              <img src="${activeChat.sellerAvatar}" class="w-full h-full rounded-full object-cover bg-white" />
            </div>
            <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
          </div>

          <div class="min-w-0 flex-1">
            <h4 class="font-black text-slate-900 text-sm flex items-center gap-1 cursor-pointer truncate" onclick="openOwnerProfile('${activeChat.sellerName}')">
              ${activeChat.sellerName}
              <i data-lucide="badge-check" class="w-4 h-4 text-blue-500 flex-shrink-0"></i>
            </h4>
            <span class="text-[11px] text-purple-600 font-bold block truncate">Re: ${activeChat.propertyTitle} • ${activeChat.propertyPrice}</span>
          </div>
        </div>

        <!-- Call & Action Icons -->
        <div class="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <button 
            type="button" 
            onclick="triggerSimulatedCall('audio', '${activeChat.sellerName}', '${activeChat.sellerAvatar}')"
            class="p-2 rounded-full hover:bg-slate-100 text-slate-700 hover:text-purple-600 transition-colors"
            title="Audio Call"
          >
            <i data-lucide="phone" class="w-4 h-4"></i>
          </button>
          <button 
            type="button" 
            onclick="triggerSimulatedCall('video', '${activeChat.sellerName}', '${activeChat.sellerAvatar}')"
            class="p-2 rounded-full hover:bg-slate-100 text-slate-700 hover:text-purple-600 transition-colors"
            title="Video Call"
          >
            <i data-lucide="video" class="w-4 h-4"></i>
          </button>
          <button 
            type="button" 
            onclick="openPropertyDetail('${activeChat.propertyId}')"
            class="p-2 rounded-full hover:bg-indigo-50 text-indigo-600 transition-colors"
            title="View Property Card"
          >
            <i data-lucide="info" class="w-4 h-4"></i>
          </button>
        </div>
      `;
    }

    chatMessages.innerHTML = activeChat.messages.map((m, idx) => {
      const isMe = m.sender === 'user';
      return `
        <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative">
          <div 
            ondblclick="toggleMessageHeartReaction('${activeChat.id}', ${idx})"
            class="max-w-[82%] p-3 text-xs sm:text-sm font-medium shadow-sm transition-all cursor-pointer relative ${isMe ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl rounded-br-xs' : 'bg-white text-slate-800 rounded-2xl rounded-bl-xs border border-slate-200'}"
            title="Double click to ❤️"
          >
            ${m.image ? `
              <div class="rounded-xl overflow-hidden mb-1 max-w-xs">
                <img src="${m.image}" class="w-full max-h-56 object-cover rounded-xl" />
              </div>
            ` : ''}

            ${m.voice ? `
              <div class="flex items-center gap-2 py-1 px-1">
                <div class="w-8 h-8 rounded-full ${isMe ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'} flex items-center justify-center font-bold text-xs">
                  ▶
                </div>
                <div class="flex-1">
                  <div class="h-2 w-28 rounded-full ${isMe ? 'bg-white/40' : 'bg-slate-200'} overflow-hidden relative">
                    <div class="h-full w-2/3 ${isMe ? 'bg-white' : 'bg-purple-600'}"></div>
                  </div>
                  <span class="text-[9px] opacity-80 mt-0.5 block">0:14 • Audio Voice Note</span>
                </div>
              </div>
            ` : ''}

            ${m.text ? `<div>${m.text}</div>` : ''}

            ${m.hasHeart ? `
              <span class="absolute -bottom-2.5 ${isMe ? '-left-2' : '-right-2'} text-xs bg-white text-rose-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md border border-slate-100 animate-bounce">
                ❤️
              </span>
            ` : ''}
          </div>

          <div class="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
            <span>${m.time}</span>
            ${isMe ? '<i data-lucide="check-check" class="w-3 h-3 text-purple-500 inline"></i>' : ''}
          </div>
        </div>
      `;
    }).join('');

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  refreshIcons();
}

function sendChatMessage() {
  const input = document.getElementById('chat-input-field');
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  input.value = '';

  const activeChat = state.chats.find(c => c.id === state.activeChatId);
  if (!activeChat) return;

  // Add user message
  activeChat.messages.push({
    sender: 'user',
    text: text,
    time: 'Just now'
  });
  renderChats();
  saveChatToFirestore(activeChat);

  triggerSellerAutoReply(activeChat);
}

function toggleMessageHeartReaction(chatId, msgIndex) {
  const chat = state.chats.find(c => c.id === chatId);
  if (!chat || !chat.messages[msgIndex]) return;

  chat.messages[msgIndex].hasHeart = !chat.messages[msgIndex].hasHeart;
  renderChats();
  saveChatToFirestore(chat);
  if (chat.messages[msgIndex].hasHeart) {
    showToast('Liked message ❤️', 'success');
  }
}

function handleChatImagePick(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const activeChat = state.chats.find(c => c.id === state.activeChatId);
    if (!activeChat) return;

    activeChat.messages.push({
      sender: 'user',
      text: 'Sent a photo attachment',
      image: e.target.result,
      time: 'Just now'
    });

    renderChats();
    saveChatToFirestore(activeChat);
    triggerSellerAutoReply(activeChat);
  };
  reader.readAsDataURL(file);
}

function sendVoiceNoteMessage() {
  const activeChat = state.chats.find(c => c.id === state.activeChatId);
  if (!activeChat) return;

  activeChat.messages.push({
    sender: 'user',
    voice: true,
    text: '',
    time: 'Just now'
  });

  renderChats();
  saveChatToFirestore(activeChat);
  showToast('🎙️ Voice note sent!', 'success');
  triggerSellerAutoReply(activeChat);
}

function sendQuickHeart() {
  const activeChat = state.chats.find(c => c.id === state.activeChatId);
  if (!activeChat) return;

  activeChat.messages.push({
    sender: 'user',
    text: '❤️',
    time: 'Just now'
  });

  renderChats();
  saveChatToFirestore(activeChat);
  triggerSellerAutoReply(activeChat);
}

function triggerSellerAutoReply(activeChat) {
  const indicator = document.getElementById('chat-typing-indicator');
  if (indicator) indicator.classList.remove('hidden');

  setTimeout(() => {
    if (indicator) indicator.classList.add('hidden');

    const replies = [
      'Thanks for the message! I am online now and ready to answer any questions about the house.',
      'That looks great! I can schedule an in-person walkthrough tomorrow at 11 AM.',
      'The price is competitive and includes all club house & parking maintenance amenities.',
      'Sending you the location map pin and video tour right away! 📍'
    ];
    const replyText = replies[Math.floor(Math.random() * replies.length)];

    activeChat.messages.push({
      sender: 'seller',
      text: replyText,
      time: 'Just now'
    });

    renderChats();
    saveChatToFirestore(activeChat);
    showToast(`New reply from ${activeChat.sellerName} 💬`, 'info');
  }, 1500);
}

function triggerSimulatedCall(type, name, avatar) {
  showToast(`📞 Calling ${name} (${type.toUpperCase()})...`, 'gold');
  if (window.confetti) {
    window.confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
  }
}

// Open Fullscreen Property Detail Modal
function openPropertyDetail(propertyId) {
  const property = state.properties.find(p => p.id === propertyId);
  if (!property) return;

  state.selectedProperty = property;
  window.location.hash = `property-${property.id}`;

  const modal = document.getElementById('property-detail-modal');
  const body = document.getElementById('property-detail-body');
  if (!modal || !body) return;

  const isSaved = state.user.savedProperties.includes(property.id);
  const isUnlocked = state.user.unlockedProperties.includes(property.id) || state.user.isVip;
  const isMyProperty = state.user.isLoggedIn && (
    property.postedBy?.name === state.user.name || 
    property.ownerName === state.user.name || 
    property.isUserPosted ||
    (state.user.email && property.postedBy?.email === state.user.email)
  );

  body.innerHTML = `
    <!-- Top Sticky Header -->
    <div class="sticky top-0 bg-slate-900/95 backdrop-blur-md px-4 sm:px-8 py-3.5 border-b border-slate-800 flex items-center justify-between z-30 shadow-xl">
      <div class="flex items-center gap-3">
        <button onclick="closePropertyDetailModal()" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-1.5 text-xs font-black active:scale-95">
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
          <span>Back</span>
        </button>
        <div>
          <span class="text-[10px] font-black uppercase tracking-widest text-indigo-400">For ${property.listingType.toUpperCase()}</span>
          <h2 class="text-xs sm:text-sm font-extrabold text-white line-clamp-1">${property.title}</h2>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button onclick="shareProperty('${property.id}')" class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95" title="Copy Shareable Link housebook.com/property/${property.id}">
          <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
          <span class="hidden sm:inline">Share Link</span>
        </button>
        <button onclick="toggleFavorite('${property.id}')" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors">
          <i data-lucide="heart" class="w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}"></i>
        </button>
        <button onclick="closePropertyDetailModal()" class="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 transition-colors">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>
    </div>

    <!-- Fullscreen Main Container -->
    <div class="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      
      <!-- Image Gallery Container -->
      <div class="space-y-3">
        <div class="relative h-72 sm:h-[420px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl group">
          <img id="detail-main-img" src="${property.images[0]}" class="w-full h-full object-cover transition-all duration-300" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 pointer-events-none"></div>

          <div class="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            ${property.isVerified ? `
              <span class="px-3 py-1 bg-emerald-500/90 text-white font-black text-xs rounded-full flex items-center gap-1 shadow-md">
                <i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Verified Property
              </span>
            ` : ''}
            <span class="px-3 py-1 bg-indigo-600/90 text-white font-black text-xs rounded-full uppercase shadow-md">
              ${property.propertyType}
            </span>
          </div>

          <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
            <div>
              <div class="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg">
                ${formatPrice(property.price, property.listingType)}
              </div>
              <div class="text-xs text-indigo-300 font-bold flex items-center gap-1.5 mt-1">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-indigo-400"></i>
                ${property.address || `${property.locality}, ${property.city}`}
              </div>
            </div>
            <span class="px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl text-xs font-extrabold text-slate-200 flex items-center gap-1.5 border border-white/10">
              <i data-lucide="images" class="w-3.5 h-3.5"></i> ${property.images.length} Photos
            </span>
          </div>
        </div>

        <!-- Thumbnails switcher -->
        <div class="flex gap-2.5 overflow-x-auto pb-2">
          ${property.images.map((img, idx) => `
            <img 
              src="${img}" 
              onclick="document.getElementById('detail-main-img').src='${img}'"
              class="w-24 h-16 rounded-2xl object-cover border-2 border-slate-800 hover:border-indigo-500 cursor-pointer flex-shrink-0 transition-all hover:scale-105" 
            />
          `).join('')}
        </div>
      </div>

      <!-- Key Specs & Direct Buy Request Action Card Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left Column: Specs & Description -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Specs Grid -->
          <div class="grid grid-cols-3 gap-3 p-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl text-center">
            <div class="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
              <span class="block text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Bedrooms</span>
              <span class="text-lg font-black text-white">${property.bedrooms} BHK</span>
            </div>
            <div class="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
              <span class="block text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Bathrooms</span>
              <span class="text-lg font-black text-white">${property.bathrooms} Baths</span>
            </div>
            <div class="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
              <span class="block text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Super Area</span>
              <span class="text-lg font-black text-white">${property.areaSqFt} sq.ft</span>
            </div>
          </div>

          <!-- Description -->
          <div class="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-lg font-extrabold text-white font-heading">About This Property</h3>
            <p class="text-slate-300 text-xs sm:text-sm leading-relaxed">${property.description}</p>
          </div>

          <!-- Specifications -->
          <div class="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 class="text-lg font-extrabold text-white font-heading">Specifications</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div class="p-3 bg-slate-800/60 rounded-2xl border border-slate-700">
                <span class="text-[10px] text-slate-400 block font-bold uppercase">Floor</span>
                <span class="font-bold text-slate-200 mt-0.5 block">${property.floor || 'Standard Floor'}</span>
              </div>
              <div class="p-3 bg-slate-800/60 rounded-2xl border border-slate-700">
                <span class="text-[10px] text-slate-400 block font-bold uppercase">Facing</span>
                <span class="font-bold text-slate-200 mt-0.5 block">${property.facing || 'East'}</span>
              </div>
              <div class="p-3 bg-slate-800/60 rounded-2xl border border-slate-700">
                <span class="text-[10px] text-slate-400 block font-bold uppercase">Furnishing</span>
                <span class="font-bold text-slate-200 mt-0.5 block capitalize">${property.furnishing.replace('_', ' ')}</span>
              </div>
              <div class="p-3 bg-slate-800/60 rounded-2xl border border-slate-700">
                <span class="text-[10px] text-slate-400 block font-bold uppercase">Parking</span>
                <span class="font-bold text-slate-200 mt-0.5 block">${property.parking || 'Covered'}</span>
              </div>
            </div>
          </div>

          <!-- Amenities -->
          <div class="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-lg font-extrabold text-white font-heading">Amenities & Society Highlights</h3>
            <div class="flex flex-wrap gap-2">
              ${property.amenities.map(am => `
                <span class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-950/60 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-800/50">
                  <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i> ${am}
                </span>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right Column: Buyer Request & Seller Actions Card -->
        <div class="space-y-6">
          
          ${isMyProperty ? `
            <!-- MY OWN PROPERTY NOTICE CARD -->
            <div class="p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl border-2 border-indigo-500/50 shadow-2xl space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg">
                  <i data-lucide="home" class="w-5 h-5"></i>
                </div>
                <div>
                  <h4 class="font-black text-white text-base font-heading">🌟 Your Property Listing</h4>
                  <p class="text-xs text-indigo-200">Published by you on HouseBook</p>
                </div>
              </div>

              <p class="text-xs text-slate-300 leading-relaxed">
                This is your own property listing. You cannot send visit requests or contact yourself. You can manage or edit this property from your Profile > My Listings.
              </p>

              <button 
                onclick="switchTab('profile'); switchProfileTab('listings'); closePropertyDetailModal();"
                class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs shadow-lg shadow-indigo-600/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <i data-lucide="layout-grid" class="w-4 h-4"></i>
                <span>Manage in My Listings</span>
              </button>
            </div>

            <div class="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl space-y-3 text-center">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <i data-lucide="shield-check" class="w-6 h-6"></i>
              </div>
              <h4 class="font-extrabold text-white text-sm">Owner Status: Active Listing</h4>
              <p class="text-xs text-slate-400">All customer purchase inquiries for this property will show up in your Profile Requests.</p>
            </div>
          ` : `
            <!-- PROMINENT BUYER REQUEST CARD -->
            <div class="p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 rounded-3xl border-2 border-indigo-500/50 shadow-2xl space-y-4 relative overflow-hidden">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-lg">
                  <i data-lucide="shopping-bag" class="w-5 h-5"></i>
                </div>
                <div>
                  <h4 class="font-black text-white text-base font-heading">Interested to Buy?</h4>
                  <p class="text-xs text-indigo-200">Send an official purchase offer to owner</p>
                </div>
              </div>

              <p class="text-xs text-slate-300 leading-relaxed">
                Express purchase interest directly to <strong class="text-white">${property.ownerName}</strong> with your custom offer price and start direct negotiations!
              </p>

              <button 
                onclick="openSendBuyRequestModal('${property.id}')"
                class="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <i data-lucide="send" class="w-4 h-4"></i>
                <span>Send Buy Request</span>
              </button>
            </div>

            <!-- Owner Contact Card -->
            <div class="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div class="flex items-center gap-3.5 cursor-pointer group" onclick="openOwnerProfile('${property.ownerName}')" title="View Seller Profile">
                <img src="${property.ownerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}" class="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 group-hover:scale-105 transition-transform" />
                <div>
                  <div class="flex items-center gap-1.5">
                    <h4 class="font-extrabold text-white text-base group-hover:text-indigo-400 transition-colors">${property.ownerName}</h4>
                    <i data-lucide="badge-check" class="w-4 h-4 text-indigo-400"></i>
                  </div>
                  <p class="text-xs text-slate-400">Direct Verified Seller</p>
                  ${isUnlocked ? `
                    <p class="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
                      <i data-lucide="phone" class="w-3.5 h-3.5"></i> ${property.ownerPhone}
                    </p>
                  ` : `
                    <p class="text-xs text-amber-400 mt-1 flex items-center gap-1">
                      <i data-lucide="lock" class="w-3 h-3"></i> Phone locked • 10 Coins
                    </p>
                  `}
                </div>
              </div>

              <div class="space-y-2 pt-2 border-t border-slate-800">
                ${isUnlocked ? `
                  <a href="tel:${property.ownerPhone}" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                    <i data-lucide="phone-call" class="w-4 h-4"></i> Call Owner Now
                  </a>
                  <a href="https://wa.me/${property.ownerPhone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(property.ownerName)},%20I%20am%20interested%20in%20your%20property%20${encodeURIComponent(property.title)}" target="_blank" class="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                    <i data-lucide="message-circle" class="w-4 h-4"></i> WhatsApp Direct
                  </a>
                ` : `
                  <button onclick="unlockContact('${property.id}')" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                    <i data-lucide="unlock" class="w-4 h-4"></i> Unlock Owner Phone (10 🪙)
                  </button>
                `}

                <button onclick="startChatWithProperty('${property.id}')" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                  <i data-lucide="message-square" class="w-4 h-4"></i> Start In-App Chat
                </button>
              </div>
            </div>
          `}
        </div>

          <!-- Shareable Link Card -->
          <div class="p-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl space-y-2">
            <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Shareable Web Link</h5>
            <div class="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 font-mono text-[11px] text-indigo-300 truncate">
              https://housebook.com/property/${property.id}
            </div>
            <button onclick="shareProperty('${property.id}')" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy Share Link
            </button>
          </div>

        </div>
      </div>

    </div>
  `;

  openModal('property-detail-modal');
  refreshIcons();
}

function closePropertyDetailModal() {
  closeModal('property-detail-modal');
  if (window.location.hash.startsWith('#property-')) {
    history.pushState("", document.title, window.location.pathname + window.location.search);
  }
}

// Open Buy Request Modal
function openSendBuyRequestModal(propertyId) {
  const property = state.properties.find(p => p.id === propertyId);
  if (!property) return;

  const idInput = document.getElementById('buy-request-property-id');
  const titleEl = document.getElementById('buy-request-property-title');
  const priceInput = document.getElementById('buy-request-price');
  const phoneInput = document.getElementById('buy-request-phone');
  const msgInput = document.getElementById('buy-request-message');

  if (idInput) idInput.value = property.id;
  if (titleEl) titleEl.textContent = `${property.title} • ${property.bedrooms} BHK (${property.locality}, ${property.city})`;
  if (priceInput) priceInput.value = property.price;
  if (phoneInput) phoneInput.value = state.user.phone || '+91 98765 43210';
  if (msgInput) msgInput.value = `Hi ${property.ownerName}, I am very interested in buying your property "${property.title}". My offered price is ${formatPrice(property.price, property.listingType)}. Please let me know when we can schedule a site visit.`;

  openModal('send-buy-request-modal');
  refreshIcons();
}

// Submit Buy Request Offer
function submitBuyRequest(event) {
  event.preventDefault();
  const propertyId = document.getElementById('buy-request-property-id').value;
  const offeredPrice = parseFloat(document.getElementById('buy-request-price').value) || 0;
  const buyerPhone = document.getElementById('buy-request-phone').value;
  const customMsg = document.getElementById('buy-request-message').value;

  const property = state.properties.find(p => p.id === propertyId);
  if (!property) return;

  const formattedOffer = formatPrice(offeredPrice, property.listingType);
  const offerText = `🏷️ BUY REQUEST OFFER:
My Purchase Offer: ${formattedOffer}
Contact Phone: ${buyerPhone}
Message: ${customMsg}`;

  let existing = state.chats.find(c => c.propertyId === propertyId);
  if (!existing) {
    existing = {
      id: `chat-${Date.now()}`,
      propertyId: property.id,
      sellerName: property.ownerName,
      sellerAvatar: property.ownerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      propertyTitle: property.title,
      propertyPrice: formatPrice(property.price, property.listingType),
      messages: []
    };
    state.chats.unshift(existing);
  }

  existing.messages.push({
    sender: 'user',
    text: offerText,
    time: 'Just now'
  });

  setTimeout(() => {
    existing.messages.push({
      sender: 'seller',
      text: `Thank you for your Buy Request offer of ${formattedOffer}! I have received your request and phone details. I will review and call you shortly.`,
      time: 'Just now'
    });
    saveChatToFirestore(existing);
    if (state.activeTab === 'chats') renderChats();
  }, 1200);

  saveChatToFirestore(existing);

  if (window.confetti) {
    window.confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
  }

  showToast('Buy request sent to owner! 🎉', 'success');

  closeModal('send-buy-request-modal');
  closeModal('property-detail-modal');

  state.activeChatId = existing.id;
  switchTab('chats');
  renderChats();
}

// Start Chat With Property
function startChatWithProperty(propertyId) {
  closeModal('property-detail-modal');
  const property = state.properties.find(p => p.id === propertyId);
  if (!property) return;

  let existing = state.chats.find(c => c.propertyId === propertyId);
  if (!existing) {
    existing = {
      id: `chat-${Date.now()}`,
      propertyId: property.id,
      sellerName: property.ownerName,
      sellerAvatar: property.ownerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      propertyTitle: property.title,
      propertyPrice: formatPrice(property.price, property.listingType),
      messages: [
        { sender: 'seller', text: `Hello! Thanks for your interest in "${property.title}". How can I assist you today?`, time: 'Just now' }
      ]
    };
    state.chats.unshift(existing);
  }

  state.activeChatId = existing.id;
  switchTab('chats');
  renderChats();
}

// Toggle Favorite / Saved Property
function toggleFavorite(propertyId) {
  const index = state.user.savedProperties.indexOf(propertyId);
  if (index >= 0) {
    state.user.savedProperties.splice(index, 1);
    showToast('Removed from Shortlist', 'info');
  } else {
    state.user.savedProperties.push(propertyId);
    showToast('Saved to Shortlist! ❤️', 'success');
  }

  saveUserData();
  updateUserStatsUI();
  renderProperties();
  renderShortlist();
}

// Unlock Contact Phone Number
function unlockContact(propertyId) {
  if (state.user.isVip) {
    state.user.unlockedProperties.push(propertyId);
    showToast('VIP Perk: Contact unlocked free!', 'success');
    saveUserData();
    renderProperties();
    if (state.selectedProperty && state.selectedProperty.id === propertyId) {
      openPropertyDetail(propertyId);
    }
    return;
  }

  if (state.user.coins < 10) {
    showToast('Insufficient Coins! Claim daily reward to unlock.', 'error');
    openModal('coins-modal');
    return;
  }

  state.user.coins -= 10;
  state.user.unlockedProperties.push(propertyId);
  saveUserData();
  updateUserStatsUI();

  // Trigger celebration
  if (window.confetti) {
    window.confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
  }

  showToast('Phone number unlocked! (-10 Coins)', 'gold');
  renderProperties();

  if (state.selectedProperty && state.selectedProperty.id === propertyId) {
    openPropertyDetail(propertyId);
  }
}

// Claim Daily Coins
function claimDailyCoins() {
  state.user.coins += 50;
  saveUserData();
  updateUserStatsUI();

  if (window.confetti) {
    window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  }

  showToast('🎉 Claimed 50 Daily Coins!', 'gold');
  closeModal('coins-modal');
}

// Watch Simulated Ad for Coins
function watchAdReward() {
  const btn = document.getElementById('watch-ad-btn');
  const bar = document.getElementById('ad-progress-bar');
  const status = document.getElementById('ad-status-text');

  if (btn) btn.disabled = true;
  if (status) status.textContent = 'Watching sponsor preview... (5s)';
  if (bar) {
    bar.style.width = '0%';
    bar.style.transition = 'width 5s linear';
    setTimeout(() => { bar.style.width = '100%'; }, 50);
  }

  setTimeout(() => {
    state.user.coins += 20;
    saveUserData();
    updateUserStatsUI();

    if (window.confetti) {
      window.confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }

    showToast('🪙 +20 Coins earned from sponsor!', 'gold');
    if (status) status.textContent = 'Reward claimed successfully!';
    if (btn) btn.disabled = false;
    setTimeout(() => closeModal('coins-modal'), 800);
  }, 5200);
}

// Post New Property Form Submission
function handlePostProperty(event) {
  event.preventDefault();
  const form = event.target;

  const title = form.title.value.trim();
  const listingType = form.listingType.value;
  const propertyType = form.propertyType.value;
  const price = parseFloat(form.price.value) || 0;
  const bedrooms = parseInt(form.bedrooms.value, 10) || 1;
  const bathrooms = parseInt(form.bathrooms.value, 10) || 1;
  const areaSqFt = parseInt(form.areaSqFt.value, 10) || 800;
  const city = form.city.value.trim() || 'Mumbai';
  const locality = form.locality.value.trim() || 'Central';
  const address = form.address.value.trim() || `${locality}, ${city}`;
  const furnishing = form.furnishing.value || 'furnished';
  const imageUrl = form.imageUrl ? form.imageUrl.value.trim() : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';

  const finalImages = postPropertyImageFiles.length > 0 ? [...postPropertyImageFiles] : [imageUrl];

  const newProperty = {
    id: `custom-${Date.now()}`,
    title,
    description: `Spectacular brand new ${bedrooms} BHK ${propertyType} located at prime ${locality}, ${city}. Includes modern amenities, premium fittings, and clear title documentation.`,
    price,
    listingType,
    propertyType,
    bedrooms,
    bathrooms,
    areaSqFt,
    furnishing,
    city,
    locality,
    address,
    images: finalImages,
    amenities: ['24/7 Security', 'Covered Parking', 'High Speed WiFi', 'Power Backup', 'Water Supply'],
    ownerId: state.user.uid || 'user-me',
    ownerName: state.user.isLoggedIn ? state.user.name : 'Verified Owner',
    ownerPhone: state.user.isLoggedIn ? state.user.phone : '+91 98220 11223',
    ownerEmail: state.user.isLoggedIn ? state.user.email : 'owner@housebook.com',
    ownerAvatar: state.user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    isUserPosted: true,
    isFeatured: true,
    isVerified: true,
    views: 1,
    createdAt: Date.now(),
    status: 'available'
  };

  // Add to state and persistence
  state.properties.unshift(newProperty);
  try {
    const existing = JSON.parse(localStorage.getItem('housebook_custom_properties') || '[]');
    existing.unshift(newProperty);
    localStorage.setItem('housebook_custom_properties', JSON.stringify(existing));
  } catch {}

  // Sync to Firestore
  savePropertyToFirestore(newProperty);

  // Clear uploaded file state
  postPropertyImageFiles = [];
  renderPropertyImageFilePreviews();

  // Celebrate
  if (window.confetti) {
    window.confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
  }

  showToast('🎉 Property Listed Successfully!', 'success');
  form.reset();
  closeModal('add-property-modal');

  // Switch to explore tab and re-render
  switchTab('explore');
  renderProperties();
}

// Generate Sample Digital Rental Agreement
function generateRentalAgreement(e) {
  e.preventDefault();
  const form = e.target;
  const owner = form.ownerName.value.trim() || 'Rajesh Sharma';
  const tenant = form.tenantName.value.trim() || state.user.name;
  const rent = form.rentAmount.value.trim() || '45,000';
  const deposit = form.depositAmount.value.trim() || '1,50,000';
  const address = form.propAddress.value.trim() || 'Flat 402, Skyline Residency, Bandra West, Mumbai';
  const duration = form.leaseMonths.value || '11';

  const output = document.getElementById('agreement-preview-text');
  if (output) {
    output.textContent = `
RESIDENTIAL LEASE AGREEMENT (DRAFT)

This Tenancy Agreement is executed on this ${new Date().toLocaleDateString('en-IN')} between:

LESSOR / OWNER: ${owner}
AND
LESSEE / TENANT: ${tenant}

SUBJECT PROPERTY:
${address}

TERMS & CONDITIONS:
1. LEASE TERM: The tenancy shall be valid for a fixed duration of ${duration} months commencing from today.
2. MONTHLY RENT: The Lessee agrees to pay a monthly rent of ₹${rent}/- payable on or before the 5th day of every calendar month.
3. SECURITY DEPOSIT: The Lessee has deposited an interest-free refundable security deposit of ₹${deposit}/- with the Lessor.
4. PERMITTED USE: The demised premises shall be utilized exclusively for private residential living.
5. MAINTENANCE & UTILITIES: Electricity, water, and society maintenance charges shall be defrayed by the occupant as per meter consumption.

Signed & Digitally Witnessed by HouseBook Legal Verification Desk.
    `.trim();

    document.getElementById('agreement-result-box').classList.remove('hidden');
    showToast('Legal Draft Generated Successfully!', 'success');
  }
}

// Verify KYC Simulation
function verifyKyc() {
  const num = document.getElementById('kyc-number-input').value.trim();
  if (!num) {
    showToast('Please enter your document ID number', 'error');
    return;
  }

  const badge = document.getElementById('kyc-status-badge');
  if (badge) {
    badge.innerHTML = `
      <span class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-sm border border-emerald-300">
        <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
        Document Verified (${num})
      </span>
    `;
    refreshIcons();
    showToast('Government ID Verified Successfully!', 'success');
  }
}

// VIP Upgrade Handler
function upgradeVip(tier) {
  state.user.isVip = true;
  saveUserData();
  updateUserStatsUI();

  if (window.confetti) {
    window.confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
  }

  showToast(`👑 Upgraded to ${tier.toUpperCase()} Member! Enjoy zero coin contact reveals!`, 'gold');
  closeModal('vip-modal');
  renderProperties();
}

// Switch Navigation Tab
function switchTab(tabName) {
  state.activeTab = tabName;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Views
  const views = ['explore', 'recommendations', 'filters', 'requests', 'analytics', 'shortlist', 'chats', 'legal', 'profile'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === tabName) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  if (tabName === 'recommendations') renderAiRecommendations();
  if (tabName === 'requests') renderPropertyRequests();
  if (tabName === 'analytics') renderOwnerAnalytics();
  if (tabName === 'chats') {
    renderChats();
  }
  if (tabName === 'profile') {
    updateUserStatsUI();
    switchProfileTab('account');
    openModal('profile-modal');
    refreshIcons();
  }

  // Tab Buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('bg-indigo-600', 'text-white', 'shadow-md');
      btn.classList.remove('text-slate-600', 'hover:bg-slate-100');
    } else {
      btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-md');
      btn.classList.add('text-slate-600', 'hover:bg-slate-100');
    }
  });

  // Mobile nav buttons
  document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('text-indigo-600', 'font-bold');
      btn.classList.remove('text-slate-400', 'font-medium');
    } else {
      btn.classList.remove('text-indigo-600', 'font-bold');
      btn.classList.add('text-slate-400', 'font-medium');
    }
  });

  refreshIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Currency Selector
function setCurrency(code) {
  state.currency = code;
  const select = document.getElementById('currency-select');
  if (select) select.value = code;

  renderProperties();
  renderShortlist();
  showToast(`Currency set to ${code}`, 'info');
}

// Reset All Filters
function resetAllFilters() {
  state.activeFilterListingType = 'all';
  state.activeCity = 'all';
  state.activeBhk = 'all';
  state.activeType = 'all';
  state.activeBudget = 'all';
  state.searchQuery = '';

  const searchInput = document.getElementById('nav-search-input');
  if (searchInput) searchInput.value = '';

  const dedicatedSearch = document.getElementById('dedicated-search-input');
  if (dedicatedSearch) dedicatedSearch.value = '';

  const citySelect = document.getElementById('filter-city');
  if (citySelect) citySelect.value = 'all';

  const bhkSelect = document.getElementById('filter-bhk');
  if (bhkSelect) bhkSelect.value = 'all';

  const typeSelect = document.getElementById('filter-type');
  if (typeSelect) typeSelect.value = 'all';

  const budgetSelect = document.getElementById('filter-budget');
  if (budgetSelect) budgetSelect.value = 'all';

  document.querySelectorAll('.filter-pill-type').forEach(p => {
    if (p.dataset.type === 'all') {
      p.classList.add('bg-indigo-600', 'text-white');
      p.classList.remove('bg-slate-100', 'text-slate-700');
    } else {
      p.classList.remove('bg-indigo-600', 'text-white');
      p.classList.add('bg-slate-100', 'text-slate-700');
    }
  });

  renderProperties();
  showToast('Filters Reset', 'info');
}

// Share Property Link
function shareProperty(propertyId) {
  const prop = state.properties.find(p => p.id === propertyId);
  const shareUrl = `https://housebook.com/property/${propertyId}`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl)
      .then(() => showToast(`Link copied: ${shareUrl} 📋`, 'success'))
      .catch(() => showToast(`Share link: ${shareUrl}`, 'info'));
  } else {
    showToast(`Share link: ${shareUrl}`, 'info');
  }
}

// Modal Open / Close Helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    refreshIcons();
  }
  if (modalId === 'profile-modal') {
    updateUserStatsUI();
    switchProfileTab('account');
    refreshIcons();
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
      if (btn.dataset.tab === 'profile') {
        btn.classList.add('text-indigo-600', 'font-bold');
        btn.classList.remove('text-slate-400', 'font-medium');
      } else {
        btn.classList.remove('text-indigo-600', 'font-bold');
        btn.classList.add('text-slate-400', 'font-medium');
      }
    });
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  if (modalId === 'profile-modal') {
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
      if (btn.dataset.tab === state.activeTab) {
        btn.classList.add('text-indigo-600', 'font-bold');
        btn.classList.remove('text-slate-400', 'font-medium');
      } else {
        btn.classList.remove('text-indigo-600', 'font-bold');
        btn.classList.add('text-slate-400', 'font-medium');
      }
    });
  }
}

// Full-Screen Profile Modal Handler
function openProfileModal() {
  openModal('profile-modal');
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  let badgeClass = 'bg-slate-900/90 text-white border-slate-700';
  if (type === 'success') badgeClass = 'bg-emerald-950/90 text-emerald-200 border-emerald-600';
  if (type === 'error') badgeClass = 'bg-rose-950/90 text-rose-200 border-rose-600';
  if (type === 'gold') badgeClass = 'bg-amber-950/90 text-amber-200 border-amber-500';

  toast.className = `px-4 py-3 rounded-2xl text-xs font-black shadow-2xl border backdrop-blur-md flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 ${badgeClass}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Refresh Lucide Vector Icons
function refreshIcons() {
  try {
    createIcons({ icons });
  } catch (err) {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }
}

// Save User Profile to LocalStorage
function saveUserData() {
  try {
    localStorage.setItem('housebook_user_data', JSON.stringify(state.user));
  } catch {}
}

// Profile Sub-Tab Switching
function switchProfileTab(tabName) {
  const tabs = ['account', 'rewards', 'listings', 'settings'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const panel = document.getElementById(`profile-panel-${t}`);
    if (btn) {
      if (t === tabName) {
        btn.className = 'px-5 py-3 text-xs sm:text-sm font-black rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-700 whitespace-nowrap flex items-center gap-2.5 transition-all active:scale-95';
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'w-4 h-4 text-white';
      } else {
        btn.className = 'px-5 py-3 text-xs sm:text-sm font-bold rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 whitespace-nowrap flex items-center gap-2.5 transition-all active:scale-95 shadow-sm';
        const icon = btn.querySelector('i');
        if (icon) {
          const colorMap = { account: 'text-indigo-600', rewards: 'text-amber-500', listings: 'text-emerald-600', settings: 'text-cyan-600' };
          icon.className = `w-4 h-4 ${colorMap[t] || 'text-slate-600'}`;
        }
      }
    }
    if (panel) {
      if (t === tabName) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    }
  });

  if (tabName === 'listings') {
    renderUserListingsInProfile();
  }
  refreshIcons();
}

// Render User Listings in Profile
function renderUserListingsInProfile() {
  const container = document.getElementById('profile-user-listings-container');
  if (!container) return;

  const userProperties = state.properties.filter(p => p.postedBy?.name === state.user.name || p.ownerName === state.user.name || p.isUserPosted);
  
  if (userProperties.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6">
        <i data-lucide="building" class="w-10 h-10 text-slate-400 mx-auto mb-3"></i>
        <h5 class="text-sm font-extrabold text-slate-900 mb-1">No Listings Posted Yet</h5>
        <p class="text-xs text-slate-500 mb-5 max-w-sm mx-auto font-medium">Post your flat, villa, or commercial space to receive direct inquiries from verified buyers and tenants.</p>
        <button onclick="closeModal('profile-modal'); openModal('post-modal');" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95">
          Post First Listing (+50 Coins)
        </button>
      </div>
    `;
  } else {
    container.innerHTML = userProperties.map(p => {
      const img = (p.images && p.images.length > 0) ? p.images[0] : (p.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80');
      const loc = p.locality ? `${p.locality}, ${p.city}` : (p.city || p.location || 'Prime Sector');
      return `
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4 hover:bg-slate-100 transition-colors cursor-pointer" onclick="closeModal('profile-modal'); openPropertyDetail('${p.id}')">
          <div class="flex items-center gap-3.5 min-w-0 flex-1">
            <img src="${img}" class="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0" alt="${p.title}" />
            <div class="min-w-0 flex-1">
              <h5 class="font-extrabold text-xs text-slate-900 truncate">${p.title}</h5>
              <p class="text-[11px] text-slate-500 font-medium truncate mt-0.5">${loc} • <span class="font-black text-indigo-600">${formatPrice(p.price, p.listingType)}</span></p>
            </div>
          </div>
          <span class="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold rounded-full flex-shrink-0">Active</span>
        </div>
      `;
    }).join('');
  }
  refreshIcons();
}

// Save Profile Changes
function saveProfileChanges() {
  const nameInput = document.getElementById('profile-input-name');
  const emailInput = document.getElementById('profile-input-email');
  const phoneInput = document.getElementById('profile-input-phone');
  const roleInput = document.getElementById('profile-input-role');
  const bioInput = document.getElementById('profile-input-bio');

  if (nameInput && nameInput.value.trim()) state.user.name = nameInput.value.trim();
  if (emailInput && emailInput.value.trim()) state.user.email = emailInput.value.trim();
  if (phoneInput) state.user.phone = phoneInput.value.trim();
  if (roleInput) state.user.role = roleInput.value;
  if (bioInput) state.user.bio = bioInput.value.trim();

  saveUserData();
  updateUserStatsUI();

  if (auth && auth.currentUser) {
    updateProfile(auth.currentUser, {
      displayName: state.user.name
    }).catch(() => {});
  }

  showToast('Profile updated successfully! 🎉');
}

// Claim Daily Reward Coins
function claimDailyReward() {
  const lastClaimKey = 'housebook_last_claim_date';
  const today = new Date().toDateString();
  const lastClaim = localStorage.getItem(lastClaimKey);

  if (lastClaim === today) {
    showToast('You already claimed your daily 20 Coins bonus today! Come back tomorrow. 🪙');
    return;
  }

  localStorage.setItem(lastClaimKey, today);
  state.user.coins += 20;
  saveUserData();
  updateUserStatsUI();

  if (typeof confetti === 'function') {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  }

  showToast('Claimed +20 Daily HouseBook Coins! 🎉');
}

// Select Preset Avatar
function selectPresetAvatar(url) {
  state.user.photoURL = url;
  saveUserData();
  updateUserStatsUI();
  
  if (auth && auth.currentUser) {
    updateProfile(auth.currentUser, {
      photoURL: url
    }).catch(() => {});
  }

  closeModal('avatar-modal');
  showToast('Profile avatar updated! 📸');
}

// Save Custom Avatar URL
function saveCustomAvatarUrl() {
  const input = document.getElementById('input-custom-avatar');
  if (!input || !input.value.trim()) return;
  selectPresetAvatar(input.value.trim());
}

// Update User Stats on UI
function updateUserStatsUI() {
  const coinsDisplay = document.getElementById('user-coins-display');
  const modalCoins = document.getElementById('modal-coins-balance');
  const profileStatCoins = document.getElementById('profile-stat-coins');
  const rewardsPanelCoins = document.getElementById('rewards-panel-coins');

  const shortlistBadge = document.getElementById('shortlist-count-badge');
  const profileStatShortlist = document.getElementById('profile-stat-shortlist');

  const profileStatUnlocked = document.getElementById('profile-stat-unlocked');
  const profileStatListings = document.getElementById('profile-stat-listings');

  const profileName = document.getElementById('profile-name-display');
  const profileModalTitle = document.getElementById('profile-modal-title');
  const profileModalSubtitle = document.getElementById('profile-modal-subtitle');
  const profilePageTitle = document.getElementById('profile-page-title');
  const profilePageSubtitle = document.getElementById('profile-page-subtitle');
  const profileRoleTag = document.getElementById('profile-role-tag');

  const profileModalAvatar = document.getElementById('profile-modal-avatar');
  const profilePageAvatar = document.getElementById('profile-page-avatar');
  const headerAvatar = document.getElementById('header-user-avatar');

  const profileInputName = document.getElementById('profile-input-name');
  const profileInputEmail = document.getElementById('profile-input-email');
  const profileInputPhone = document.getElementById('profile-input-phone');
  const profileInputRole = document.getElementById('profile-input-role');
  const profileInputBio = document.getElementById('profile-input-bio');

  const userListingsCount = state.properties.filter(p => p.postedBy?.name === state.user.name || p.ownerName === state.user.name || p.isUserPosted).length;

  if (coinsDisplay) coinsDisplay.textContent = state.user.coins;
  if (modalCoins) modalCoins.textContent = state.user.coins;
  if (profileStatCoins) profileStatCoins.textContent = state.user.coins;
  if (rewardsPanelCoins) rewardsPanelCoins.textContent = state.user.coins;

  if (shortlistBadge) shortlistBadge.textContent = state.user.savedProperties.length;
  if (profileStatShortlist) profileStatShortlist.textContent = state.user.savedProperties.length;

  if (profileStatUnlocked) profileStatUnlocked.textContent = state.user.unlockedProperties ? state.user.unlockedProperties.length : 0;
  if (profileStatListings) profileStatListings.textContent = userListingsCount;

  const isUserLoggedIn = state.user.isLoggedIn;
  const displayName = isUserLoggedIn ? state.user.name : 'Guest User';
  if (profileName) profileName.textContent = displayName;
  if (profileModalTitle) profileModalTitle.textContent = displayName;
  if (profilePageTitle) profilePageTitle.textContent = displayName;

  const verificationBadgeEl = document.getElementById('profile-verification-badge');
  if (verificationBadgeEl) {
    if (isUserLoggedIn) {
      verificationBadgeEl.classList.remove('hidden');
      verificationBadgeEl.innerHTML = `<i data-lucide="badge-check" class="w-3.5 h-3.5 text-emerald-600"></i> Verified`;
    } else {
      verificationBadgeEl.classList.add('hidden');
    }
  }

  if (profileModalSubtitle) {
    profileModalSubtitle.textContent = isUserLoggedIn && state.user.email 
      ? `${state.user.email} • Verified Member` 
      : 'Not Logged In • Guest Account';
  }
  if (profilePageSubtitle) {
    profilePageSubtitle.textContent = isUserLoggedIn && state.user.email 
      ? `${state.user.email} • Verified Member` 
      : 'Not Logged In • Guest Account';
  }

  if (profileRoleTag) {
    profileRoleTag.textContent = `${state.user.role || 'Buyer'} Profile`;
  }

  const avatarUrl = state.user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
  if (profileModalAvatar) profileModalAvatar.src = avatarUrl;
  if (headerAvatar) headerAvatar.src = avatarUrl;

  if (profileInputName && document.activeElement !== profileInputName) profileInputName.value = state.user.isLoggedIn ? state.user.name : 'Guest User';
  if (profileInputEmail && document.activeElement !== profileInputEmail) profileInputEmail.value = state.user.isLoggedIn ? state.user.email : '';
  if (profileInputPhone && document.activeElement !== profileInputPhone) profileInputPhone.value = state.user.phone || '';
  if (profileInputRole) profileInputRole.value = state.user.role || 'Buyer';
  if (profileInputBio && document.activeElement !== profileInputBio) profileInputBio.value = state.user.bio || '';
}

// Setup Event Listeners
function setupEventListeners() {
  // Navigation Search & Dedicated Search Sync
  const navSearch = document.getElementById('nav-search-input');
  const navSearchMobile = document.getElementById('nav-search-input-mobile');
  const heroSearch = document.getElementById('hero-search-input');
  const dedicatedSearch = document.getElementById('dedicated-search-input');

  if (navSearch) {
    navSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      if (navSearchMobile) navSearchMobile.value = e.target.value;
      if (heroSearch) heroSearch.value = e.target.value;
      if (dedicatedSearch) dedicatedSearch.value = e.target.value;
      renderProperties();
    });
  }

  if (navSearchMobile) {
    navSearchMobile.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      if (navSearch) navSearch.value = e.target.value;
      if (heroSearch) heroSearch.value = e.target.value;
      if (dedicatedSearch) dedicatedSearch.value = e.target.value;
      renderProperties();
    });
  }

  if (heroSearch) {
    heroSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      if (navSearch) navSearch.value = e.target.value;
      if (navSearchMobile) navSearchMobile.value = e.target.value;
      if (dedicatedSearch) dedicatedSearch.value = e.target.value;
      renderProperties();
    });
  }

  if (dedicatedSearch) {
    dedicatedSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      if (navSearch) navSearch.value = e.target.value;
      if (navSearchMobile) navSearchMobile.value = e.target.value;
      if (heroSearch) heroSearch.value = e.target.value;
      renderProperties();
    });
  }

  // Filter Pills (All / Buy / Rent / Commercial / Luxury)
  document.querySelectorAll('.filter-pill-type').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill-type').forEach(p => {
        p.classList.remove('bg-indigo-600', 'text-white');
        p.classList.add('bg-slate-100', 'text-slate-700');
      });
      pill.classList.add('bg-indigo-600', 'text-white');
      pill.classList.remove('bg-slate-100', 'text-slate-700');

      state.activeFilterListingType = pill.dataset.type;
      renderProperties();
    });
  });

  // Hero Dropdowns
  const citySelect = document.getElementById('filter-city');
  if (citySelect) {
    citySelect.addEventListener('change', (e) => {
      state.activeCity = e.target.value;
      renderProperties();
    });
  }

  const bhkSelect = document.getElementById('filter-bhk');
  if (bhkSelect) {
    bhkSelect.addEventListener('change', (e) => {
      state.activeBhk = e.target.value;
      renderProperties();
    });
  }

  const typeSelect = document.getElementById('filter-type');
  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      state.activeType = e.target.value;
      renderProperties();
    });
  }

  const budgetSelect = document.getElementById('filter-budget');
  if (budgetSelect) {
    budgetSelect.addEventListener('change', (e) => {
      state.activeBudget = e.target.value;
      renderProperties();
    });
  }

  // Currency select
  const currencySelect = document.getElementById('currency-select');
  if (currencySelect) {
    currencySelect.addEventListener('change', (e) => {
      setCurrency(e.target.value);
    });
  }

  // Post Property Form
  const postForm = document.getElementById('add-property-form');
  if (postForm) {
    postForm.addEventListener('submit', handlePostProperty);
  }

  // Post Property Requirement Form
  const reqForm = document.getElementById('add-request-form');
  if (reqForm) {
    reqForm.addEventListener('submit', handlePostRequirement);
  }

  // Legal Agreement Form
  const agreementForm = document.getElementById('agreement-generator-form');
  if (agreementForm) {
    agreementForm.addEventListener('submit', generateRentalAgreement);
  }

  // Send Buy Request Form
  const buyReqForm = document.getElementById('send-buy-request-form');
  if (buyReqForm) {
    buyReqForm.addEventListener('submit', submitBuyRequest);
  }

  // Dedicated Filter Tab Controls
  ['tab-filter-city', 'tab-filter-bhk', 'tab-filter-type', 'tab-filter-budget'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        const cityVal = document.getElementById('tab-filter-city')?.value || 'all';
        const bhkVal = document.getElementById('tab-filter-bhk')?.value || 'all';
        const typeVal = document.getElementById('tab-filter-type')?.value || 'all';
        const budgetVal = document.getElementById('tab-filter-budget')?.value || 'all';

        state.activeCity = cityVal;
        state.activeBhk = bhkVal;
        state.activeType = typeVal;
        state.activeBudget = budgetVal;

        // Sync with hero inputs if they exist
        if (citySelect) citySelect.value = cityVal;
        if (bhkSelect) bhkSelect.value = bhkVal;
        if (typeSelect) typeSelect.value = typeVal;
        if (budgetSelect) budgetSelect.value = budgetVal;

        renderProperties();
      });
    }
  });

  // Modal backdrop click to dismiss
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // ESC key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(m => {
        m.classList.remove('active');
      });
      document.body.style.overflow = '';
    }
  });
}

// Handle Post Requirement Form Submission
function handlePostRequirement(event) {
  event.preventDefault();
  const form = event.target;

  const title = form.reqTitle.value.trim();
  const listingType = form.reqListingType.value;
  const propertyType = form.reqPropertyType.value;
  const city = form.reqCity.value.trim() || 'Mumbai';
  const locality = form.reqLocality.value.trim() || 'Central';
  const bedrooms = parseInt(form.reqBedrooms.value, 10) || 1;
  const budget = form.reqBudget.value.trim() || '₹50,000/mo';
  const possession = form.reqPossession.value || 'Immediate';
  const notes = form.reqNotes.value.trim() || 'No specific notes.';

  const newReq = {
    id: `req-${Date.now()}`,
    title,
    buyerName: state.user.isLoggedIn ? state.user.name : 'Verified Buyer',
    buyerPhone: state.user.isLoggedIn ? state.user.phone : '+91 98220 11223',
    city,
    locality,
    bedrooms,
    propertyType,
    listingType,
    budget,
    possession,
    notes,
    postedAt: 'Just now',
    status: 'active'
  };

  state.propertyRequests.unshift(newReq);
  form.reset();
  closeModal('add-request-modal');
  switchTab('requests');
  renderPropertyRequests();
}

// Render Property Requests Grid
function renderPropertyRequests() {
  const grid = document.getElementById('property-requests-grid');
  if (!grid) return;

  if (state.propertyRequests.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
        <p class="text-slate-500 font-medium">No buyer requirements posted yet.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = state.propertyRequests.map(req => `
    <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 font-extrabold rounded-lg text-[10px] uppercase tracking-wider">
            ${req.listingType === 'rent' ? 'Rent Requirement' : 'Buy Requirement'}
          </span>
          <span class="text-[11px] text-slate-400 font-medium">${req.postedAt}</span>
        </div>

        <h4 class="font-extrabold text-slate-900 text-base mb-2 font-heading leading-snug">${req.title}</h4>

        <div class="space-y-1.5 text-xs text-slate-600 mb-4">
          <div class="flex items-center gap-2">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-indigo-600"></i>
            <span>${req.locality}, ${req.city}</span>
          </div>
          <div class="flex items-center gap-2">
            <i data-lucide="indian-rupee" class="w-3.5 h-3.5 text-emerald-600"></i>
            <span class="font-bold text-slate-800">Budget: ${req.budget}</span>
          </div>
          <div class="flex items-center gap-2">
            <i data-lucide="home" class="w-3.5 h-3.5 text-blue-600"></i>
            <span>${req.bedrooms > 0 ? req.bedrooms + ' BHK ' : ''}${req.propertyType} • Move-in: ${req.possession}</span>
          </div>
        </div>

        <p class="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 italic">
          "${req.notes}"
        </p>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
            ${req.buyerName.charAt(0)}
          </div>
          <div>
            <span class="text-xs font-bold text-slate-800 block">${req.buyerName}</span>
            <span class="text-[10px] text-emerald-600 font-semibold">Verified Buyer</span>
          </div>
        </div>

        <button onclick="startChatWithBuyer('${req.buyerName}', '${req.title}')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5">
          <i data-lucide="message-square" class="w-3.5 h-3.5"></i> Fulfill Request
        </button>
      </div>
    </div>
  `).join('');

  refreshIcons();
}

// Start Chat with Buyer on Request
function startChatWithBuyer(buyerName, reqTitle) {
  const existing = state.chats.find(c => c.sellerName === buyerName);
  if (existing) {
    state.activeChatId = existing.id;
  } else {
    const newChat = {
      id: `chat-req-${Date.now()}`,
      propertyId: 'custom-req',
      sellerName: buyerName,
      sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      propertyTitle: reqTitle,
      propertyPrice: 'Buyer Requirement Match',
      messages: [
        { sender: 'seller', text: `Hello! I saw your requirement "${reqTitle}". I have matching property options available. Let's connect!`, time: 'Just now' }
      ]
    };
    state.chats.unshift(newChat);
    state.activeChatId = newChat.id;
  }

  switchTab('chats');
  renderChats();
}

// Render Owner Analytics Dashboard
function renderOwnerAnalytics() {
  const tableEl = document.getElementById('analytics-properties-table');
  const leadsEl = document.getElementById('analytics-leads-list');
  const listingsCount = document.getElementById('analytics-total-listings');
  const totalViews = document.getElementById('analytics-total-views');
  const totalUnlocks = document.getElementById('analytics-total-unlocks');

  if (listingsCount) listingsCount.textContent = state.properties.length;
  
  let viewsSum = 0;
  state.properties.forEach(p => { viewsSum += (p.views || 350); });
  if (totalViews) totalViews.textContent = viewsSum.toLocaleString();

  if (tableEl) {
    tableEl.innerHTML = state.properties.map(p => {
      const views = p.views || Math.floor(Math.random() * 400) + 200;
      const unlocks = Math.floor(views * 0.08);
      return `
        <div class="p-4 bg-slate-50 hover:bg-indigo-50/30 rounded-2xl border border-slate-200 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <img src="${p.images[0]}" class="w-16 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0" />
            <div>
              <h5 class="font-extrabold text-slate-900 text-xs sm:text-sm font-heading leading-tight">${p.title}</h5>
              <p class="text-[11px] text-slate-500">${p.locality}, ${p.city} • ${formatPrice(p.price, p.listingType)}</p>
            </div>
          </div>

          <div class="flex items-center gap-6 text-xs">
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-bold block">Buyer Views</span>
              <span class="font-black text-slate-800 text-sm">${views}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-bold block">Phone Unlocks</span>
              <span class="font-black text-emerald-600 text-sm">${unlocks}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">
                Active
              </span>
            </div>
            <button onclick="openPropertyDetail('${p.id}')" class="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 text-indigo-600 rounded-xl text-xs font-bold transition-all shadow-sm">
              View Analytics
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  if (leadsEl) {
    const leads = [
      { name: 'Rohan Deshmukh', phone: '+91 98220 33441', time: '10 mins ago', propTitle: state.properties[0]?.title || 'Skyline Azure Penthouse', msg: 'Interested in site visit tomorrow at 4 PM.' },
      { name: 'Ananya Verma', phone: '+91 98991 77220', time: '1 hour ago', propTitle: state.properties[1]?.title || 'Emerald Palms Villa', msg: 'Unlocked phone number via 10 Coins.' },
      { name: 'Vikramaditya Roy', phone: '+91 97110 88299', time: '3 hours ago', propTitle: state.properties[2]?.title || 'Urban Heights 2BHK', msg: 'Inquired about home loan tie-up availability.' }
    ];

    leadsEl.innerHTML = leads.map(l => `
      <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-xs">
            ${l.name.charAt(0)}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900">${l.name}</span>
              <span class="text-[10px] text-slate-400 font-medium">${l.time}</span>
            </div>
            <p class="text-[11px] text-slate-600 font-medium">${l.msg} (<span class="text-indigo-600 font-semibold">${l.propTitle}</span>)</p>
          </div>
        </div>
        <button onclick="startChatWithBuyer('${l.name}', '${l.propTitle}')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex-shrink-0 transition-colors">
          Chat Lead
        </button>
      </div>
    `).join('');
  }

  refreshIcons();
}

// Open Owner Profile Modal
function openOwnerProfile(ownerName) {
  const property = state.properties.find(p => p.ownerName === ownerName) || state.properties[0];
  if (!property) return;

  const ownerListings = state.properties.filter(p => p.ownerName === ownerName);
  const body = document.getElementById('owner-profile-modal-body');
  if (!body) return;

  body.innerHTML = `
    <div class="p-6">
      <div class="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div class="flex items-center gap-3">
          <img src="${property.ownerAvatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'}" class="w-16 h-16 rounded-full object-cover border-2 border-indigo-600 shadow-md" />
          <div>
            <div class="flex items-center gap-1.5">
              <h3 class="text-xl font-bold text-slate-900 font-heading">${property.ownerName}</h3>
              <i data-lucide="badge-check" class="w-5 h-5 text-indigo-600"></i>
            </div>
            <p class="text-xs text-slate-500">Verified HouseBook Partner • 4.9 ⭐ (128 Reviews)</p>
          </div>
        </div>
        <button onclick="closeModal('owner-profile-modal')" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="space-y-4 mb-6">
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-700">
          <span class="font-bold block mb-1 text-slate-900">About Owner / Agent</span>
          Professional real estate consultant specializing in prime residential penthouses, luxury villas, and commercial spaces with over 8 years of verified track record.
        </div>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <span class="text-slate-400 block font-medium">Direct Phone</span>
            <span class="font-bold text-slate-800">${property.ownerPhone}</span>
          </div>
          <div class="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <span class="text-slate-400 block font-medium">Email Address</span>
            <span class="font-bold text-slate-800">${property.ownerEmail}</span>
          </div>
        </div>
      </div>

      <div>
        <h4 class="font-bold text-slate-900 text-base mb-3 font-heading">Listings Posted by ${property.ownerName} (${ownerListings.length})</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
          ${ownerListings.map(p => `
            <div class="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-indigo-50/50 transition-colors" onclick="closeModal('owner-profile-modal'); closeModal('property-detail-modal'); openPropertyDetail('${p.id}')">
              <img src="${p.images[0]}" class="w-14 h-14 rounded-lg object-cover" />
              <div class="min-w-0 flex-1">
                <h5 class="font-bold text-slate-800 text-xs truncate">${p.title}</h5>
                <span class="text-xs font-extrabold text-indigo-600">${formatPrice(p.price, p.listingType)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  openModal('owner-profile-modal');
  refreshIcons();
}

// Toggle Dark/Light Theme Mode (Forced to Light)
function toggleDarkMode() {
  document.body.classList.remove('dark-theme');
  document.body.style.backgroundColor = '#f8fafc';
  document.body.style.color = '#0f172a';
  localStorage.setItem('housebook_dark_mode', 'false');
  showToast('Light Mode Active ☀️', 'info');
}

// Infinite Scroll - Load More Random Properties
let isLoadingMore = false;
function loadMoreRandomProperties() {
  if (isLoadingMore) return;
  isLoadingMore = true;

  showToast('Loading more properties... 🏠', 'info');

  setTimeout(() => {
    const cities = ['Mumbai', 'Bangalore', 'Pune', 'Delhi NCR', 'Gurgaon', 'Hyderabad'];
    const types = ['apartment', 'villa', 'penthouse', 'studio', 'commercial', 'duplex'];
    const listingTypes = ['sale', 'rent'];
    const titles = [
      'Skyline Oasis Luxury Suite',
      'Grand Parkview Residency',
      'Serene Valley 3BHK Apartment',
      'Prestige Crown Villa',
      'Horizon Heights Studio Loft',
      'Royal Palms 2BHK Flat',
      'Urban Eco Haven Duplex',
      'Verdant Greens Penthouse',
      'Palm Groves Independent Villa',
      'Metro Edge Commercial Suite'
    ];
    const localities = ['Indiranagar', 'Koramangala', 'Bandra East', 'Hiranandani', 'Viman Nagar', 'Cyber City', 'Gachibowli', 'Jubilee Hills', 'Powai', 'Worli'];
    const owners = ['Amit Patel', 'Sneha Sharma', 'Rohan Verma', 'Kavita Reddy', 'Deepak Gupta', 'Manish Kapoor', 'Anjali Saxena', 'Karan Johar'];
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'
    ];
    const propertyImages = [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
    ];

    const newProps = [];
    for (let i = 0; i < 3; i++) {
      const lType = listingTypes[Math.floor(Math.random() * listingTypes.length)];
      const pType = types[Math.floor(Math.random() * types.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const price = lType === 'rent' ? (22000 + Math.floor(Math.random() * 78000)) : (4500000 + Math.floor(Math.random() * 45000000));
      const owner = owners[Math.floor(Math.random() * owners.length)];
      const loc = localities[Math.floor(Math.random() * localities.length)];

      newProps.push({
        id: 'prop-rnd-' + Date.now() + '-' + i,
        title: `${title} in ${city}`,
        description: 'Exclusive newly listed space offering luxurious finishings, open architectural layout, and world-class residential amenities.',
        price: price,
        listingType: lType,
        propertyType: pType,
        bedrooms: Math.floor(Math.random() * 4) + 1,
        bathrooms: Math.floor(Math.random() * 3) + 1,
        areaSqFt: 650 + Math.floor(Math.random() * 2200),
        furnishing: ['furnished', 'semi_furnished', 'unfurnished'][Math.floor(Math.random() * 3)],
        city: city,
        locality: loc,
        address: `${loc}, ${city}`,
        images: [propertyImages[Math.floor(Math.random() * propertyImages.length)], propertyImages[Math.floor(Math.random() * propertyImages.length)]],
        amenities: ['24/7 Security', 'Covered Parking', 'Gym', 'Power Backup', 'Balcony'],
        ownerId: 'owner-' + Math.floor(Math.random() * 100),
        ownerName: owner,
        ownerPhone: '+91 9' + Math.floor(100000000 + Math.random() * 900000000),
        ownerEmail: owner.toLowerCase().replace(/\s+/g, '.') + '@realty.com',
        ownerAvatar: avatars[Math.floor(Math.random() * avatars.length)],
        isFeatured: Math.random() > 0.4,
        isVerified: true,
        views: Math.floor(Math.random() * 600) + 100,
        createdAt: Date.now(),
        status: 'available',
        floor: 'Middle Floor',
        facing: 'East'
      });
    }

    state.properties.push(...newProps);
    renderProperties();
    isLoadingMore = false;
  }, 400);
}

// Add window scroll listener for Infinite Load on Scroll
window.addEventListener('scroll', () => {
  if (state.activeTab !== 'explore') return;
  if (isLoadingMore) return;

  const scrollPos = window.innerHeight + window.scrollY;
  const threshold = document.documentElement.scrollHeight - 400;

  if (scrollPos >= threshold) {
    loadMoreRandomProperties();
  }
});

let authMode = 'login'; // 'login' or 'signup'

let unsubscribeProperties = null;
let unsubscribeChats = null;

function subscribePropertiesUpdates() {
  try {
    if (!db || unsubscribeProperties) return;

    unsubscribeProperties = onSnapshot(collection(db, 'properties'), (snapshot) => {
      if (snapshot && !snapshot.empty) {
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          const rp = { id: docSnap.id, ...data };
          const idx = state.properties.findIndex(p => p.id === rp.id);
          if (idx >= 0) {
            state.properties[idx] = rp;
          } else {
            state.properties.unshift(rp);
          }
        });
        renderProperties();
      }
    }, err => {
      console.warn('Properties snapshot notice:', err);
    });
  } catch (e) {
    console.warn('Firestore properties subscription notice:', e);
  }
}

function subscribeUserChats(userId) {
  try {
    if (!db || !userId) return;
    if (unsubscribeChats) {
      unsubscribeChats();
      unsubscribeChats = null;
    }

    unsubscribeChats = onSnapshot(collection(db, 'chats'), (snapshot) => {
      if (snapshot && !snapshot.empty) {
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          const rc = { id: docSnap.id, ...data };
          const idx = state.chats.findIndex(c => c.id === rc.id);
          if (idx >= 0) {
            state.chats[idx] = rc;
          } else {
            state.chats.unshift(rc);
          }
        });
        renderChats();
      }
    }, err => {
      console.warn('Chats snapshot notice:', err);
    });
  } catch (e) {
    console.warn('Firestore chats subscription notice:', e);
  }
}

function initFirebaseAuth() {
  subscribePropertiesUpdates();

  onAuthStateChanged(auth, (authUser) => {
    if (authUser) {
      const displayName = authUser.displayName || (authUser.isAnonymous ? 'Guest User' : authUser.email?.split('@')[0] || 'Member');
      const email = authUser.email || (authUser.isAnonymous ? 'guest@housebook.com' : 'user@housebook.com');
      const photo = authUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';

      state.user.name = displayName;
      state.user.email = email;
      state.user.phone = authUser.phoneNumber || '';
      state.user.uid = authUser.uid;
      state.user.photoURL = photo;
      state.user.isLoggedIn = true;

      updateAuthUI(true, authUser);
      subscribeUserChats(authUser.uid);
    } else {
      state.user.name = 'Guest User';
      state.user.email = '';
      state.user.phone = '';
      state.user.uid = null;
      state.user.isLoggedIn = false;
      updateAuthUI(false, null);

      if (unsubscribeChats) {
        unsubscribeChats();
        unsubscribeChats = null;
      }
    }
    updateUserStatsUI();
  });
}

function updateAuthUI(isLoggedIn, authUser) {
  const loginBtn = document.getElementById('nav-login-btn');
  const profileBtn = document.getElementById('nav-profile-btn');
  const profileName = document.getElementById('profile-name-display');
  const headerAvatar = document.getElementById('header-user-avatar');
  const guestNotice = document.getElementById('profile-guest-notice');

  const modalTitle = document.getElementById('profile-modal-title');
  const modalSubtitle = document.getElementById('profile-modal-subtitle');
  const modalAvatar = document.getElementById('profile-modal-avatar');

  const isRealUser = isLoggedIn && authUser && !authUser.isAnonymous;

  if (isRealUser) {
    if (loginBtn) loginBtn.classList.add('hidden');
    if (profileBtn) profileBtn.classList.remove('hidden');
    if (guestNotice) guestNotice.classList.add('hidden');

    const displayName = authUser.displayName || authUser.email?.split('@')[0] || 'Member';
    if (profileName) profileName.textContent = displayName;
    if (headerAvatar && authUser.photoURL) headerAvatar.src = authUser.photoURL;

    if (modalTitle) modalTitle.textContent = displayName;
    if (modalSubtitle) modalSubtitle.textContent = authUser.email ? `${authUser.email} • Verified Member` : 'Verified Member';
    if (modalAvatar && authUser.photoURL) modalAvatar.src = authUser.photoURL;
  } else {
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (guestNotice) guestNotice.classList.remove('hidden');

    if (modalTitle) modalTitle.textContent = 'Guest User';
    if (modalSubtitle) modalSubtitle.textContent = 'Not Logged In • Guest Account';
    if (modalAvatar) modalAvatar.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
  }
  refreshIcons();
}

function toggleAuthMode() {
  authMode = authMode === 'login' ? 'signup' : 'login';
  const nameField = document.getElementById('auth-name-field');
  const submitLabel = document.getElementById('auth-submit-label');
  const toggleBtn = document.getElementById('auth-toggle-mode-btn');
  const title = document.getElementById('auth-modal-title');
  const subtitle = document.getElementById('auth-modal-subtitle');
  const feedback = document.getElementById('auth-feedback-box');

  if (feedback) feedback.classList.add('hidden');

  if (authMode === 'signup') {
    if (nameField) nameField.classList.remove('hidden');
    if (submitLabel) submitLabel.textContent = 'Create Free Account';
    if (toggleBtn) toggleBtn.textContent = 'Already have an account? Sign In';
    if (title) title.textContent = 'Create HouseBook Account';
    if (subtitle) subtitle.textContent = 'Join thousands of homebuyers, renters, and verified owners.';
  } else {
    if (nameField) nameField.classList.add('hidden');
    if (submitLabel) submitLabel.textContent = 'Sign In to Account';
    if (toggleBtn) toggleBtn.textContent = "Don't have an account? Sign Up";
    if (title) title.textContent = 'Welcome Back';
    if (subtitle) subtitle.textContent = 'Sign in to save properties, post listings, and chat with owners.';
  }
}

async function handleEmailAuth(event) {
  event.preventDefault();
  const feedback = document.getElementById('auth-feedback-box');
  const submitBtn = document.getElementById('auth-submit-btn');

  const email = document.getElementById('auth-input-email')?.value.trim();
  const password = document.getElementById('auth-input-password')?.value.trim();
  const name = document.getElementById('auth-input-name')?.value.trim();

  if (!email || !password) return;

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-70');
    }

    if (feedback) {
      feedback.className = 'p-3 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 block mb-4';
      feedback.textContent = authMode === 'signup' ? 'Creating your account with Firebase...' : 'Signing in with Firebase Auth...';
    }

    if (authMode === 'signup') {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      if (name && userCred.user) {
        await updateProfile(userCred.user, { displayName: name });
      }
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }

    if (feedback) {
      feedback.className = 'p-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 block mb-4';
      feedback.textContent = '✅ Success! Authenticated via Firebase.';
    }

    setTimeout(() => {
      closeModal('auth-modal');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-70');
      }
    }, 600);

  } catch (err) {
    if (feedback) {
      feedback.className = 'p-3 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 block mb-4';
      feedback.textContent = `❌ ${err.message || 'Authentication failed'}`;
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-70');
    }
  }
}

async function handleGoogleAuth() {
  const feedback = document.getElementById('auth-feedback-box');
  try {
    if (feedback) {
      feedback.className = 'p-3 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 block mb-4';
      feedback.textContent = 'Connecting with Google Authentication...';
    }

    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);

    if (feedback) {
      feedback.className = 'p-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 block mb-4';
      feedback.textContent = '✅ Google Sign-In Successful!';
    }

    setTimeout(() => closeModal('auth-modal'), 600);
  } catch (err) {
    if (feedback) {
      feedback.className = 'p-3 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 block mb-4';
      feedback.textContent = `❌ ${err.message || 'Google Auth failed'}`;
    }
  }
}

async function handleGuestAuth() {
  const feedback = document.getElementById('auth-feedback-box');
  try {
    if (feedback) {
      feedback.className = 'p-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 block mb-4';
      feedback.textContent = 'Logging in anonymously via Firebase...';
    }

    await signInAnonymously(auth);

    if (feedback) {
      feedback.className = 'p-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 block mb-4';
      feedback.textContent = '✅ Signed in as Anonymous Guest!';
    }

    setTimeout(() => closeModal('auth-modal'), 600);
  } catch (err) {
    if (feedback) {
      feedback.className = 'p-3 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 block mb-4';
      feedback.textContent = `❌ ${err.message || 'Guest Auth failed'}`;
    }
  }
}

async function handleSignOut() {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn("Sign out notice:", err);
  }
  state.user = {
    name: 'Guest User',
    email: '',
    phone: '',
    role: 'Buyer',
    coins: 100,
    isVip: false,
    savedProperties: [],
    unlockedProperties: [],
    isLoggedIn: false
  };
  localStorage.removeItem('housebook_user_data');
  updateUserStatsUI();
  renderProperties();
  switchTab('explore');
  closeModal('profile-modal');
  showToast('Signed out successfully! 👋');
}

// Expose all interactive functions to global window for universal browser & inline handler compatibility
Object.assign(window, {
  state,
  formatPrice,
  renderProperties,
  renderShortlist,
  renderChats,
  filterChatsList,
  selectChat,
  backToChatList,
  sendChatMessage,
  toggleMessageHeartReaction,
  handleChatImagePick,
  sendVoiceNoteMessage,
  sendQuickHeart,
  triggerSellerAutoReply,
  triggerSimulatedCall,
  openPropertyDetail,
  closePropertyDetailModal,
  openSendBuyRequestModal,
  submitBuyRequest,
  startChatWithProperty,
  startChatWithBuyer,
  toggleFavorite,
  unlockContact,
  claimDailyCoins,
  watchAdReward,
  handlePostProperty,
  generateRentalAgreement,
  verifyKyc,
  upgradeVip,
  switchTab,
  setCurrency,
  resetAllFilters,
  shareProperty,
  openModal,
  closeModal,
  openProfileModal,
  showToast,
  refreshIcons,
  openOwnerProfile,
  toggleDarkMode,
  initFirebaseAuth,
  toggleAuthMode,
  handleEmailAuth,
  handleGoogleAuth,
  handleGuestAuth,
  handleSignOut,
  switchProfileTab,
  saveProfileChanges,
  claimDailyReward,
  selectPresetAvatar,
  saveCustomAvatarUrl,
  renderUserListingsInProfile,
  renderPropertyRequests,
  renderOwnerAnalytics,
  loadMoreRandomProperties,
  savePropertyToFirestore,
  saveChatToFirestore,
  renderAiRecommendations,
  setAiCategoryFilter,
  executeAiRecommendationSearch
});

// Start when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
