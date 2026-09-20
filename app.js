/**
 * HouseBook - Pure HTML, CSS, JavaScript Real Estate & Housing Portal
 * Standalone, zero-dependencies client-side application.
 */

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
    name: 'Rajesh Kumar',
    email: 'rajesh.k@gmail.com',
    phone: '+91 98765 43210',
    role: 'Buyer',
    coins: 150,
    isVip: false,
    savedProperties: ['prop-101'],
    unlockedProperties: []
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
        { sender: 'seller', text: 'Namaste Rajesh ji! Thank you for inquiring about Skyline Azure Penthouse in Bandra.', time: 'Yesterday 10:15 AM' },
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

  // Hide Splash Screen after brief load
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.style.opacity = '0';
      splash.style.transition = 'opacity 0.4s ease';
      setTimeout(() => splash.remove(), 400);
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

// Render Properties in Explore Grid
function renderProperties() {
  const grid = document.getElementById('properties-grid');
  const countBadge = document.getElementById('listing-count-display');
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
                    p.address.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} Properties`;
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
            ${property.isFeatured ? `
              <span class="badge-featured px-2.5 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1">
                <i data-lucide="sparkles" class="w-3 h-3"></i> Featured
              </span>
            ` : ''}
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

// Render Chats View
function renderChats() {
  const chatList = document.getElementById('chat-conversations-list');
  const chatHeader = document.getElementById('chat-active-header');
  const chatMessages = document.getElementById('chat-messages-container');
  if (!chatList || !chatMessages) return;

  // Render left conversation list
  chatList.innerHTML = state.chats.map(chat => {
    const isActive = chat.id === state.activeChatId;
    const lastMsg = chat.messages[chat.messages.length - 1] || { text: 'Started inquiry', time: '' };

    return `
      <div 
        onclick="selectChat('${chat.id}')"
        class="p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 ${isActive ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50 border border-transparent'}"
      >
        <img src="${chat.sellerAvatar}" class="w-11 h-11 rounded-full object-cover border border-slate-200 flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h5 class="font-bold text-slate-800 text-sm truncate">${chat.sellerName}</h5>
            <span class="text-[10px] text-slate-400">${lastMsg.time}</span>
          </div>
          <p class="text-xs text-indigo-600 font-medium truncate">${chat.propertyTitle}</p>
          <p class="text-xs text-slate-500 truncate mt-0.5">${lastMsg.text}</p>
        </div>
      </div>
    `;
  }).join('');

  // Render active chat
  const activeChat = state.chats.find(c => c.id === state.activeChatId) || state.chats[0];
  if (activeChat) {
    if (chatHeader) {
      chatHeader.innerHTML = `
        <div class="flex items-center gap-3">
          <img src="${activeChat.sellerAvatar}" class="w-10 h-10 rounded-full object-cover border border-slate-200" />
          <div>
            <h4 class="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              ${activeChat.sellerName}
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            </h4>
            <span class="text-xs text-slate-500">Online • Re: ${activeChat.propertyTitle} (${activeChat.propertyPrice})</span>
          </div>
        </div>

        <button onclick="openPropertyDetail('${activeChat.propertyId}')" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
          View Property
        </button>
      `;
    }

    chatMessages.innerHTML = activeChat.messages.map(m => {
      const isMe = m.sender === 'user';
      return `
        <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3">
          <div class="max-w-[80%] px-4 py-2.5 text-sm shadow-sm ${isMe ? 'chat-bubble-user' : 'chat-bubble-other'}">
            ${m.text}
          </div>
          <span class="text-[10px] text-slate-400 mt-1 px-1">${m.time}</span>
        </div>
      `;
    }).join('');

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  refreshIcons();
}

function selectChat(chatId) {
  state.activeChatId = chatId;
  renderChats();
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

  // Simulated seller auto-reply
  setTimeout(() => {
    const replies = [
      'Thanks for reaching out! The price is slightly negotiable for serious buyers.',
      'Yes, the legal title and OC are completely clear and verified.',
      'I can arrange a site visit tomorrow. What time works best for you?',
      'Let me share the exact layout floor plan and high-resolution video walkthrough.'
    ];
    const replyText = replies[Math.floor(Math.random() * replies.length)];
    activeChat.messages.push({
      sender: 'seller',
      text: replyText,
      time: 'Just now'
    });
    renderChats();
    showToast(`New message from ${activeChat.sellerName}`, 'info');
  }, 1200);
}

// Open Property Detail Modal
function openPropertyDetail(propertyId) {
  const property = state.properties.find(p => p.id === propertyId);
  if (!property) return;

  state.selectedProperty = property;
  const modal = document.getElementById('property-detail-modal');
  const body = document.getElementById('property-detail-body');
  if (!modal || !body) return;

  const isSaved = state.user.savedProperties.includes(property.id);
  const isUnlocked = state.user.unlockedProperties.includes(property.id) || state.user.isVip;

  body.innerHTML = `
    <!-- Top Bar -->
    <div class="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between z-20">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Property Details</span>
        <h2 class="text-xl font-extrabold text-slate-900 line-clamp-1">${property.title}</h2>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="toggleFavorite('${property.id}')" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
          <i data-lucide="heart" class="w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}"></i>
        </button>
        <button onclick="shareProperty('${property.id}')" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors" title="Share Property">
          <i data-lucide="share-2" class="w-5 h-5"></i>
        </button>
        <button onclick="closeModal('property-detail-modal')" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
    </div>

    <!-- Modal Content Grid -->
    <div class="p-6 space-y-6">
      <!-- Image Gallery -->
      <div>
        <div class="h-80 md:h-96 rounded-2xl overflow-hidden bg-slate-100 mb-3 shadow-inner">
          <img id="detail-main-img" src="${property.images[0]}" class="w-full h-full object-cover transition-all" />
        </div>
        <div class="flex gap-2 overflow-x-auto pb-2">
          ${property.images.map((img, idx) => `
            <img 
              src="${img}" 
              onclick="document.getElementById('detail-main-img').src='${img}'"
              class="w-20 h-16 rounded-xl object-cover border-2 border-transparent hover:border-indigo-600 cursor-pointer flex-shrink-0 transition-all" 
            />
          `).join('')}
        </div>
      </div>

      <!-- Price & Key Stats -->
      <div class="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <div>
          <span class="text-xs text-slate-500 font-semibold uppercase">Pricing</span>
          <div class="text-3xl font-black text-indigo-600">
            ${formatPrice(property.price, property.listingType)}
          </div>
          ${property.deposit ? `<span class="text-xs text-slate-500 font-medium">Security Deposit: ₹${property.deposit.toLocaleString()}</span>` : ''}
        </div>

        <div class="flex items-center gap-4 text-center">
          <div class="px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span class="block text-xs text-slate-400 font-semibold">Bedrooms</span>
            <span class="text-base font-bold text-slate-800">${property.bedrooms} BHK</span>
          </div>
          <div class="px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span class="block text-xs text-slate-400 font-semibold">Bathrooms</span>
            <span class="text-base font-bold text-slate-800">${property.bathrooms}</span>
          </div>
          <div class="px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span class="block text-xs text-slate-400 font-semibold">Super Built-up</span>
            <span class="text-base font-bold text-slate-800">${property.areaSqFt} sq.ft</span>
          </div>
        </div>
      </div>

      <!-- Overview & Description -->
      <div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">About This Property</h3>
        <p class="text-slate-600 text-sm leading-relaxed">${property.description}</p>
      </div>

      <!-- Specifications Grid -->
      <div>
        <h3 class="text-lg font-bold text-slate-900 mb-3">Property Specifications</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-xs text-slate-400 block font-medium">Floor</span>
            <span class="font-bold text-slate-800">${property.floor || 'Standard Floor'}</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-xs text-slate-400 block font-medium">Facing</span>
            <span class="font-bold text-slate-800">${property.facing || 'East'}</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-xs text-slate-400 block font-medium">Furnishing</span>
            <span class="font-bold text-slate-800 capitalize">${property.furnishing.replace('_', ' ')}</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-xs text-slate-400 block font-medium">Parking</span>
            <span class="font-bold text-slate-800">${property.parking || 'Covered'}</span>
          </div>
        </div>
      </div>

      <!-- Amenities -->
      <div>
        <h3 class="text-lg font-bold text-slate-900 mb-3">Amenities & Features</h3>
        <div class="flex flex-wrap gap-2">
          ${property.amenities.map(am => `
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
              <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600"></i> ${am}
            </span>
          `).join('')}
        </div>
      </div>

      <!-- Verified Owner / Agent Card -->
      <div class="p-5 bg-gradient-to-r from-indigo-50 via-white to-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3 cursor-pointer group" onclick="openOwnerProfile('${property.ownerName}')" title="View Owner Profile">
          <img src="${property.ownerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}" class="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform" />
          <div>
            <div class="flex items-center gap-1.5">
              <h4 class="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">${property.ownerName}</h4>
              <i data-lucide="badge-check" class="w-4 h-4 text-indigo-600"></i>
            </div>
            <p class="text-xs text-slate-500">Direct Verified Seller • Click to view profile</p>
            ${isUnlocked ? `
              <p class="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
                <i data-lucide="phone" class="w-3 h-3"></i> ${property.ownerPhone}
              </p>
            ` : `
              <p class="text-xs text-slate-400 mt-1">Phone protected • Unlock using 10 coins</p>
            `}
          </div>
        </div>

        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
          ${isUnlocked ? `
            <a href="tel:${property.ownerPhone}" class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md transition-colors">
              <i data-lucide="phone-call" class="w-4 h-4"></i> Call Now
            </a>
            <a href="https://wa.me/${property.ownerPhone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(property.ownerName)},%20I%20am%20interested%20in%20your%20property%20${encodeURIComponent(property.title)}" target="_blank" class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-xs shadow-md transition-colors">
              <i data-lucide="message-circle" class="w-4 h-4"></i> WhatsApp
            </a>
          ` : `
            <button onclick="unlockContact('${property.id}')" class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md transition-colors">
              <i data-lucide="unlock" class="w-4 h-4"></i> Unlock Contact (10 🪙)
            </button>
          `}
          <button onclick="startChatWithProperty('${property.id}')" class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs transition-colors">
            <i data-lucide="message-square" class="w-4 h-4"></i> Chat In-App
          </button>
        </div>
      </div>
    </div>
  `;

  openModal('property-detail-modal');
  refreshIcons();
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
  const imageUrl = form.imageUrl.value.trim() || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';

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
    images: [imageUrl],
    amenities: ['24/7 Security', 'Covered Parking', 'High Speed WiFi', 'Power Backup', 'Water Supply'],
    ownerId: 'user-me',
    ownerName: state.user.name,
    ownerPhone: state.user.phone,
    ownerEmail: state.user.email,
    ownerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
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

  // Hero section / filters only on explore
  const heroSection = document.getElementById('hero-section');
  if (heroSection) {
    if (tabName === 'explore') {
      heroSection.classList.remove('hidden');
    } else {
      heroSection.classList.add('hidden');
    }
  }

  // Views
  const views = ['explore', 'requests', 'analytics', 'shortlist', 'chats', 'legal'];
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

  if (tabName === 'requests') renderPropertyRequests();
  if (tabName === 'analytics') renderOwnerAnalytics();

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
      btn.classList.add('text-indigo-600');
      btn.classList.remove('text-slate-400');
    } else {
      btn.classList.remove('text-indigo-600');
      btn.classList.add('text-slate-400');
    }
  });

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
  const title = prop ? prop.title : 'HouseBook Property';
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({ title, text: `Check out ${title} on HouseBook!`, url })
      .catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url)
      .then(() => showToast('Link copied to clipboard! 📋', 'success'))
      .catch(() => showToast('Share link: ' + url, 'info'));
  } else {
    showToast('Share link: ' + url, 'info');
  }
}

// Modal Open / Close Helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Toast Notification Disabled per user request
function showToast(message, type = 'info') {
  return;
}

// Refresh Lucide Vector Icons
function refreshIcons() {
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
}

// Save User Profile to LocalStorage
function saveUserData() {
  try {
    localStorage.setItem('housebook_user_data', JSON.stringify(state.user));
  } catch {}
}

// Update User Stats on UI
function updateUserStatsUI() {
  const coinsDisplay = document.getElementById('user-coins-display');
  const modalCoins = document.getElementById('modal-coins-balance');
  const shortlistBadge = document.getElementById('shortlist-count-badge');
  const profileName = document.getElementById('profile-name-display');

  if (coinsDisplay) coinsDisplay.textContent = state.user.coins;
  if (modalCoins) modalCoins.textContent = state.user.coins;
  if (shortlistBadge) shortlistBadge.textContent = state.user.savedProperties.length;
  if (profileName) profileName.textContent = state.user.name;
}

// Setup Event Listeners
function setupEventListeners() {
  // Navigation Search & Hero Search Sync
  const navSearch = document.getElementById('nav-search-input');
  const heroSearch = document.getElementById('hero-search-input');

  if (navSearch) {
    navSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      if (heroSearch) heroSearch.value = e.target.value;
      renderProperties();
    });
  }

  if (heroSearch) {
    heroSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      if (navSearch) navSearch.value = e.target.value;
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
    buyerName: state.user.name,
    buyerPhone: state.user.phone,
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

// Toggle Dark/Light Theme Mode
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-theme');
  if (isDark) {
    document.body.style.backgroundColor = '#0f172a';
    document.body.style.color = '#f8fafc';
    showToast('Dark Mode Enabled 🌙', 'info');
  } else {
    document.body.style.backgroundColor = '#f8fafc';
    document.body.style.color = '#0f172a';
    showToast('Light Mode Enabled ☀️', 'info');
  }
  localStorage.setItem('housebook_dark_mode', isDark ? 'true' : 'false');
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

// Expose all interactive functions to global window for universal browser & inline handler compatibility
Object.assign(window, {
  state,
  formatPrice,
  renderProperties,
  renderShortlist,
  renderChats,
  selectChat,
  sendChatMessage,
  openPropertyDetail,
  startChatWithProperty,
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
  showToast,
  refreshIcons,
  openOwnerProfile,
  toggleDarkMode
});

// Start when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
