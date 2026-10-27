/**
 * Central Marketplace Data Store for Sharekart
 * -------------------------------------------------------------
 * Edit, add, or delete items in this file to update the data
 * across the entire application (HomePage, SearchPage, Navbar,
 * Footer, LocationModal, etc.).
 */

export const INITIAL_CATEGORIES = [
  {
    id: "laptops-mobiles",
    label: "Laptops & Mobiles",
    name: "Laptops & Mobiles",
    icon: "laptop_mac",
    itemCount: 1240,
    description: "MacBooks, Dell, ThinkPads, iPad Pros, and smartphones for work or campus"
  },
  {
    id: "home-furniture",
    label: "Home Furniture",
    name: "Home Furniture",
    icon: "chair",
    itemCount: 890,
    description: "Ergonomic work chairs, solid wood tables, sofa sets, and study desks"
  },
  {
    id: "power-tools-machinery",
    label: "Power Tools",
    name: "Power Tools & Machinery",
    icon: "home_repair_service",
    itemCount: 530,
    description: "Bosch rotary drills, Dewalt angle grinders, high-pressure washers, toolkits"
  },
  {
    id: "cameras-audio",
    label: "Cameras & Audio",
    name: "Cameras & Audio Gear",
    icon: "photo_camera",
    itemCount: 420,
    description: "Sony 4K mirrorless cameras, DJI drones, studio mics, cinema lenses, gimbals"
  },
  {
    id: "bikes-cycles",
    label: "Bikes & Cycles",
    name: "Bikes & Cycles",
    icon: "pedal_bike",
    itemCount: 310,
    description: "Geared road bikes, mountain MTBs, hybrid commuter cycles, and EV scooters"
  },
  {
    id: "home-appliances",
    label: "Home Appliances",
    name: "Home Appliances",
    icon: "kitchen",
    itemCount: 680,
    description: "Air fryers, microwaves, Dyson vacuum cleaners, water purifiers, induction cooktops"
  },
  {
    id: "books-sports",
    label: "Books & Sports",
    name: "Books & Sports Equipment",
    icon: "sports_tennis",
    itemCount: 450,
    description: "Tennis kits, cricket bats, badmintons, camping tents, trekking rucksacks"
  }
];

export const MARKETPLACE_HUBS = [
  {
    name: "Infocity, Kudasan",
    pincode: "382007",
    distance: "1.2 km away",
    hub: "Primary Tech & Rental Hub",
    lat: 23.1895,
    lng: 72.6322
  },
  {
    name: "Gandhinagar, Sector 7",
    pincode: "382010",
    distance: "0.8 km away",
    hub: "Central Residential Area",
    lat: 23.2167,
    lng: 72.6833
  },
  {
    name: "Sector 21 Main Market",
    pincode: "382021",
    distance: "2.1 km away",
    hub: "Tools & Electronics Market",
    lat: 23.2415,
    lng: 72.6510
  },
  {
    name: "DA-IICT & NIFT Campus",
    pincode: "382007",
    distance: "1.8 km away",
    hub: "Student Tech Hub",
    lat: 23.1884,
    lng: 72.6288
  },
  {
    name: "PDPU Road, Raisan",
    pincode: "382421",
    distance: "3.5 km away",
    hub: "University Hub",
    lat: 23.1558,
    lng: 72.6668
  },
  {
    name: "GIFT City SEZ",
    pincode: "382355",
    distance: "5.2 km away",
    hub: "Financial & Corporate Center",
    lat: 23.1594,
    lng: 72.6844
  },
  {
    name: "Vavol Township",
    pincode: "382016",
    distance: "3.1 km away",
    hub: "Residential Suburb",
    lat: 23.2100,
    lng: 72.6200
  },
  {
    name: "Sargasan Cross Roads",
    pincode: "382421",
    distance: "4.0 km away",
    hub: "Commercial Highway Hub",
    lat: 23.1800,
    lng: 72.6100
  },
  {
    name: "Koba Circle, Airport Highway",
    pincode: "382007",
    distance: "6.5 km away",
    hub: "Transit Junction",
    lat: 23.1400,
    lng: 72.6300
  },
  {
    name: "Chandkheda & Motera (Ahmedabad Border)",
    pincode: "380005",
    distance: "9.8 km away",
    hub: "Metro Station Area",
    lat: 23.1100,
    lng: 72.5800
  },
  {
    name: "Vastrapur / SG Highway (Ahmedabad)",
    pincode: "380015",
    distance: "18.0 km away",
    hub: "Commercial Tech Hub",
    lat: 23.0350,
    lng: 72.5250
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 1,
    title: "Sony Alpha A6400 24.2MP 4K Mirrorless Camera",
    category_id: "cameras-audio",
    category_name: "Cameras & Audio",
    subcategory: "Mirrorless & DSLRs",
    description: "Sony Alpha A6400 compact mirrorless camera mounted with 16-50mm power zoom lens. Crisp optical detail, high definition 4K HDR recording with zero recording limit. Perfect for campus reels, events, travel and YouTube creation.",
    condition_tag: "Used - Excellent",
    condition_score: "9 / 10",
    inspection_score: 98,
    inspection_tested_date: "18 Mar 2025",
    serial_number: "S/N: 4729188-IN",
    transaction_type: "both",
    rent_price_daily: 850,
    rent_price_weekly: 5100,
    security_deposit: 3500,
    sale_price: 48000,
    original_mrp: 74990,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBSucvfcJQNo_qFWB5oHI7pEXJMtslQMPqBEZt3-9nS3_2NI10UswRHV5oamAM_pZx6TVWfumSWs9aPgaqN7YslIuosS14OQ5lxsrEpu_11IvZaAAo5_MTdJOsgXbAOImZzcrGP9th6z8zNv3y9N_KSd1Tg95deb7Ih-pjW-GyusiZBFBjxQgSvmagmR6tcaH1O2Ji2hzLgcqohKSxdxM1bUOvx3iT7BVJtMMUCDmttbFfianb7lJPKPQ",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB9l8s94eHGoE5SEWQdGdOGHhgKajHzqfX_gDrZlbFQNbWjaZgx4xlDfSjspD46yrrdmCSUPfZ_b0-kUjK2lVvM03JSrkH96mVUZmeokyrAPAUgOQIRVkn8OxFOlfiUL88oykuWH83dT8_k4sF-ahnhoTsXXoK-WBlOOj1gaKZE2Jhpllbe2ivrt1F1tMAdWsNpWGgqzb_d-18Br2X5TwKxJUMTJCUcqaJYgvNWemO5f4JSkoxFYThGGg"
    ],
    specs: {
      "Sensor": "24.2 MP APS-C Exmor CMOS",
      "Autofocus": "425 Phase-detection AF Points",
      "Video Capability": "4K HDR (3840x2160) at 30fps",
      "Screen": "180° Tiltable Touch LCD",
      "Shutter Count": "4,820 (2.4% of life)"
    },
    kit_items: [
      "Sony A6400 Camera Body",
      "16-50mm OSS Power Zoom Lens",
      "2x Original Rechargeable Battery Packs",
      "Dual Fast USB Charger",
      "SanDisk Extreme Pro 64GB 170MB/s SDXC Card",
      "Padded Shockproof Shoulder Bag"
    ],
    pickup_locations: [
      "Infocity Club Main Gate",
      "TCS Garima Park Gate 1 (Kudasan)"
    ],
    location_name: "Infocity, Gandhinagar",
    distance_km: 1.2,
    is_instant_pickup: true,
    status: "active",
    seller_id: 2,
    seller_name: "Vikram Joshi",
    seller_avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Vikram&backgroundColor=ffd5dc",
    seller_is_verified: true,
    seller_rating: 4.9,
    seller_reviews_count: 42,
    badge: "For Rent",
    badgeColor: "bg-secondary text-on-secondary",
    bottomChip: {
      type: "rating",
      text: "5.0 (14 rentals)",
      icon: "star",
      classes: "bg-surface-container text-on-surface"
    }
  },
  {
    id: 2,
    title: "Bosch Professional Hammer Drill 800W (Heavy Duty SDS Plus)",
    category_id: "power-tools-machinery",
    category_name: "Power Tools",
    subcategory: "Drills & Drivers",
    description: "Industrial Bosch professional heavy duty rotary hammer drill in dark blue casing. Comes with SDS Plus chuck, auxiliary handle, depth stop and 5-piece drill bit set. Great for home renovation, masonry, wall drilling, and fixture installation.",
    condition_tag: "Used - Excellent",
    condition_score: "9.2 / 10",
    inspection_score: 96,
    inspection_tested_date: "12 Feb 2025",
    serial_number: "S/N: 882190-IN",
    transaction_type: "rent",
    rent_price_daily: 350,
    rent_price_weekly: 2100,
    security_deposit: 1500,
    sale_price: 0,
    original_mrp: 6800,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBg_5mbBAxo6BN1Y7YZtd6It1ZtWEgV2pP0eGANqiO9dJp99IdyV_JPxiSpDAX8leCDSFPXgkNyrx-FCGPHvw55uqZ15bqZ7ffBcbh4QpEv_ifF84kv9ivkXRJR7lZrRfGMJPb_sBeXiDFWaXJHc5Z873O6bKcbtkJj1ZRGU_PUpgr7XXIcP4CUxCfmlWWMm48SyP2L3BqnBoNhs75luUWDqc6raResHrsBtpg5v_Da-JpU2-Ix03jlnw",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDBFDSQ5IBN7WBs2FdMYV60uVkfVwA90SyISdGPuvYQnJmaThMfwT_UEq7DmQNAv1BjMEfpS6fBZez8gqaZ-hIsHX8b0CWkSWoivb-fEDJUOT05DuN8BF54Hmk-jWiJ9W4aGx3txOOh2eenRpDj3Bzs8Eqvnt_wjFATaZvyvlnbig0gY9Ue1tmmkiTE3Jl3g3EZur6Ct4RjYCuOQu9EPgtNw7BEBJb2Ecc-EJj3h2ZIeKusEHoOVSZKww"
    ],
    specs: {
      "Power Input": "800 W",
      "Impact Rate": "0 - 4000 bpm",
      "Chuck Type": "SDS Plus",
      "Max Drilling": "26 mm (Concrete)"
    },
    kit_items: [
      "Bosch Hammer Drill 800W Body",
      "Heavy-Duty Carry Case",
      "Depth Gauge Rod",
      "5x Masonry Drill Bits"
    ],
    pickup_locations: ["Sector 21 Main Market, Gandhinagar"],
    location_name: "Sector 21, Gandhinagar",
    distance_km: 2.1,
    is_instant_pickup: true,
    status: "active",
    seller_id: 1,
    seller_name: "Aarav Patel",
    seller_avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aarav&backgroundColor=b6e3f4",
    seller_is_verified: true,
    seller_rating: 4.9,
    seller_reviews_count: 36,
    badge: "For Rent",
    badgeColor: "bg-secondary text-on-secondary",
    bottomChip: {
      type: "aadhaar",
      text: "Aadhaar Verified",
      icon: "verified",
      classes: "bg-secondary-container/30 text-on-secondary-container"
    }
  },
  {
    id: 3,
    title: "Dell Latitude Slim Business Laptop (Core i7, 16GB RAM, 512GB SSD)",
    category_id: "laptops-mobiles",
    category_name: "Laptops & Mobiles",
    subcategory: "Laptops & Desktops",
    description: "Metallic silver Dell Latitude with bright matte FHD display, backlit keyboard, ultra quiet cooling, and 6-hour verified battery health. Ideal for software engineering, video editing, presentations, and daily business use.",
    condition_tag: "Used - Like New",
    condition_score: "9.5 / 10",
    inspection_score: 99,
    inspection_tested_date: "10 Mar 2025",
    serial_number: "S/N: DL-99201-LAT",
    transaction_type: "both",
    rent_price_daily: 450,
    rent_price_weekly: 2700,
    security_deposit: 4000,
    sale_price: 32000,
    original_mrp: 65000,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBY1-PEG8IEwaBye7YINtDGuzCLhCZQh1hfg55-R1WFWJhYBYhU7S_pn31J9DALQhXly2kXh2i7vrPVM2hQyy4mgzxr9TgM2ETg5KyGHXBsg2nUisSusG_Sf1vz7hhzZ9ub3h6-ban-s6a_eqxpURNfEmBL7A-UW0epmoJDatDo_awjvZDqk0pqyKwZiMZlJ_BB0o5n0FgtVGysmFVuugTLV-gJNEarFqZlsX51hldHL1yFTh3INbTOcQ",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAb_45Azl_P8Ld1cbqTUESCMNkxu3pfri1mXDYkAUv29tu81p5wJXYu16YVPsHcVH_Aw6909WfINu2CTFVINj8hnStblrdR7M3dk7iju94OAyDMM5NeK7DQm_SnFp-ekJJzS8YSRlLvd1anjN-fZQACRnH_1To4APRS4IuYPGBgtpKcd6XeJ9bFCY6ogjTTlBGSO3e7ROkZNcnA-BHPXyYQqefiDnqLye8ks_0K084JQUEaOtXXu6Y0JQ"
    ],
    specs: {
      "Processor": "Intel Core i7 11th Gen",
      "Memory": "16GB DDR4 3200MHz",
      "Storage": "512GB PCIe M.2 SSD",
      "Display": "14-inch Full HD Anti-Glare",
      "OS": "Windows 11 Pro Genuine"
    },
    kit_items: [
      "Dell Latitude Laptop",
      "Original 65W Fast Type-C Charger",
      "Neoprene Padded Sleeve"
    ],
    pickup_locations: ["Infocity Gate 2, Gandhinagar"],
    location_name: "Infocity, Gandhinagar",
    distance_km: 1.5,
    is_instant_pickup: true,
    status: "active",
    seller_id: 1,
    seller_name: "Aarav Patel",
    seller_avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aarav&backgroundColor=b6e3f4",
    seller_is_verified: true,
    seller_rating: 4.9,
    seller_reviews_count: 36,
    badge: "Buy or Rent",
    badgeColor: "bg-primary text-on-primary",
    bottomChip: {
      type: "aadhaar",
      text: "Aadhaar Verified",
      icon: "verified",
      classes: "bg-secondary-container/30 text-on-secondary-container"
    }
  },
  {
    id: 4,
    title: "Hero Sprint Mountain Bicycle 21-Speed (Dual Mechanical Disc Brakes)",
    category_id: "bikes-cycles",
    category_name: "Bikes & Cycles",
    subcategory: "Mountain & Geared Bikes",
    description: "Matte black and red Hero Sprint mountain bicycle. Clean chain and smooth 21-speed Shimano Tourney gears. Equipped with front suspension fork, night safety reflectors, and sturdy dual disc brakes.",
    condition_tag: "Used - Very Good",
    condition_score: "8.8 / 10",
    inspection_score: 94,
    inspection_tested_date: "01 Mar 2025",
    serial_number: "S/N: HS-CYCLE-441",
    transaction_type: "both",
    rent_price_daily: 199,
    rent_price_weekly: 1199,
    security_deposit: 1000,
    sale_price: 4500,
    original_mrp: 12500,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCaOqraxOhKr04WK54jy3aJntK7q24DXHLpf0Fvdw5wWxxO2F7EZdsPcS2lHfehmqkv8VgPFQHAalSc-gPKpQgP3UKguR4cEnRSaVm3gACMSFiZ2Ouq2ucNDZsVgrB3O1ylmbcYEAHeKQpRAKPN_w0R8U2NvMiTvPh5pIZzNIL38oU0mWT3uuKEfkRc_9O_RakandwfpXlrmJINPUp6q3cvpzMgTBl9fVRE2F1pVpdPWzW-DCgeMIGRtg",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBqzBu10D6LxzKH-wtlXTZUofhi4rnIWu7BgtgoO3qKx3tzCsFz1vAK1svbmuKB2D7x4sSN9mItFl4pZ_ICPPYPxWXK0drBPht4VzAAJiYhufALNmPLHNuYs9UWvtJiKmA-QWZxQYjC1rwy9Nwj2cBERYMTnXSXZZbDEYIOJky68l8bJCeKVmfh3CdaZl3irgoBzQXXbnOATLnidKUT7yQByelTw7V87JafovztcSKSJLpIzSHG9gkq4w"
    ],
    specs: {
      "Gears": "21-Speed Shimano Tourney",
      "Brakes": "Dual Mechanical Disc",
      "Frame": "Alloy 27.5 Inch Hardtail",
      "Suspension": "Front Hydraulic Fork"
    },
    kit_items: [
      "Hero Sprint 21-Speed Cycle",
      "Combination Number Lock",
      "LED Headlamp + Red Taillight"
    ],
    pickup_locations: ["Sector 7 Community Ground, Gandhinagar"],
    location_name: "Sector 7, Gandhinagar",
    distance_km: 0.8,
    is_instant_pickup: true,
    status: "active",
    seller_id: 1,
    seller_name: "Aarav Patel",
    seller_avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aarav&backgroundColor=b6e3f4",
    seller_is_verified: true,
    seller_rating: 4.9,
    seller_reviews_count: 36,
    badge: "Buy or Rent",
    badgeColor: "bg-primary-container text-on-primary",
    bottomChip: {
      type: "aadhaar",
      text: "Aadhaar Verified",
      icon: "verified",
      classes: "bg-secondary-container/30 text-on-secondary-container"
    }
  },
  {
    id: 5,
    title: "Ergonomic High-Back Mesh Office Chair with Lumbar Support",
    category_id: "home-furniture",
    category_name: "Home Furniture",
    subcategory: "Chairs & Desks",
    description: "Breathable Korean mesh high-back chair with 2D adjustable headrest, multi-lock synchro-tilt mechanism, Class-4 heavy hydraulic piston, and smooth PU castor wheels. Zero squeaks and pristine clean fabric.",
    condition_tag: "Used - Like New",
    condition_score: "9.6 / 10",
    inspection_score: 97,
    inspection_tested_date: "14 Mar 2025",
    serial_number: "S/N: ERGO-CHAIR-812",
    transaction_type: "both",
    rent_price_daily: 120,
    rent_price_weekly: 750,
    security_deposit: 1200,
    sale_price: 6800,
    original_mrp: 14999,
    images: [
      "https://images.unsplash.com/photo-1580481077195-c266a2c91834?w=600&auto=format&fit=crop&q=80"
    ],
    specs: {
      "Material": "Reinforced Breathable Mesh",
      "Lumbar Support": "3D Dynamic Adjust",
      "Gas Lift": "Class-4 BIFMA Certified",
      "Base": "Heavy-Duty Chrome Steel"
    },
    kit_items: ["Ergonomic High-Back Chair", "Assembly Allen Key Set"],
    pickup_locations: ["Sector 7, Gandhinagar"],
    location_name: "Sector 7, Gandhinagar",
    distance_km: 0.9,
    is_instant_pickup: true,
    status: "active",
    seller_id: 3,
    seller_name: "Kavya Patel",
    seller_avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kavya&backgroundColor=c0aede",
    seller_is_verified: true,
    seller_rating: 4.95,
    seller_reviews_count: 28,
    badge: "Buy or Rent",
    badgeColor: "bg-primary text-on-primary",
    bottomChip: {
      type: "rating",
      text: "4.9 (8 rentals)",
      icon: "star",
      classes: "bg-surface-container text-on-surface"
    }
  },
  {
    id: 6,
    title: "Philips Digital Air Fryer XXL 1400W RapidAir Technology",
    category_id: "home-appliances",
    category_name: "Home Appliances",
    subcategory: "Kitchen & Cooking",
    description: "Philips 4.1L digital touchscreen air fryer with RapidAir swirl technology. 90% less oil cooking, 7 preset touch menus for fries, baking, tandoori paneer, and grilling. Non-stick basket thoroughly sanitized.",
    condition_tag: "Used - Excellent",
    condition_score: "9.3 / 10",
    inspection_score: 98,
    inspection_tested_date: "20 Mar 2025",
    serial_number: "S/N: PH-AF-9921",
    transaction_type: "both",
    rent_price_daily: 180,
    rent_price_weekly: 950,
    security_deposit: 1500,
    sale_price: 5200,
    original_mrp: 10995,
    images: [
      "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80"
    ],
    specs: {
      "Capacity": "4.1 Litres XXL",
      "Power": "1400 Watts",
      "Preset Modes": "7 One-touch programs",
      "Timer": "Up to 60 Minutes"
    },
    kit_items: ["Philips Air Fryer Unit", "Non-stick Crisper Tray", "Recipe Guide Booklet"],
    pickup_locations: ["Infocity, Kudasan"],
    location_name: "Infocity, Gandhinagar",
    distance_km: 1.4,
    is_instant_pickup: true,
    status: "active",
    seller_id: 2,
    seller_name: "Vikram Joshi",
    seller_avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Vikram&backgroundColor=ffd5dc",
    seller_is_verified: true,
    seller_rating: 4.9,
    seller_reviews_count: 42,
    badge: "For Rent",
    badgeColor: "bg-secondary text-on-secondary",
    bottomChip: {
      type: "aadhaar",
      text: "Aadhaar Verified",
      icon: "verified",
      classes: "bg-secondary-container/30 text-on-secondary-container"
    }
  },
  {
    id: 7,
    title: "DJI Mini 3 Pro Drone Kit with Fly More Plus & RC Smart Controller",
    category_id: "cameras-audio",
    category_name: "Cameras & Audio",
    subcategory: "Drones & Aerial",
    description: "Sub-249g lightweight 4K HDR drone with tri-directional obstacle sensing, true vertical shooting for Instagram/YouTube reels, 3x Intelligent Flight Batteries, 2-way charging hub, and DJI RC with built-in 5.5-inch FHD screen.",
    condition_tag: "Used - Like New",
    condition_score: "9.8 / 10",
    inspection_score: 99,
    inspection_tested_date: "25 Mar 2025",
    serial_number: "S/N: DJI-M3P-7182",
    transaction_type: "rent",
    rent_price_daily: 1400,
    rent_price_weekly: 7500,
    security_deposit: 8000,
    sale_price: 68000,
    original_mrp: 94000,
    images: [
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80"
    ],
    specs: {
      "Weight": "249 grams",
      "Camera": "4K/60fps HDR & 48MP RAW",
      "Flight Time": "Up to 47 mins per battery",
      "Transmission": "DJI O3 up to 12 km"
    },
    kit_items: [
      "DJI Mini 3 Pro Aircraft",
      "DJI RC Smart Controller",
      "3x Flight Batteries",
      "2-Way Charging Hub",
      "Set of ND Filters (ND16/64/256)",
      "Hard Travel Shoulder Case"
    ],
    pickup_locations: ["DA-IICT Campus Gate", "Infocity Main Gate"],
    location_name: "Infocity, Gandhinagar",
    distance_km: 1.8,
    is_instant_pickup: true,
    status: "active",
    seller_id: 2,
    seller_name: "Vikram Joshi",
    seller_avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Vikram&backgroundColor=ffd5dc",
    seller_is_verified: true,
    seller_rating: 4.9,
    seller_reviews_count: 42,
    badge: "For Rent",
    badgeColor: "bg-secondary text-on-secondary",
    bottomChip: {
      type: "rating",
      text: "5.0 (21 rentals)",
      icon: "star",
      classes: "bg-surface-container text-on-surface"
    }
  },
  {
    id: 8,
    title: "Apple MacBook Air M1 (8GB RAM, 256GB SSD, Space Grey)",
    category_id: "laptops-mobiles",
    category_name: "Laptops & Mobiles",
    subcategory: "Apple MacBooks",
    description: "Ultra-thin Apple MacBook Air powered by the revolutionary Apple M1 chip with 8-core CPU. Silent fanless design, Retina display with True Tone, battery health at 94% peak capacity. Includes genuine 30W USB-C brick & braided cable.",
    condition_tag: "Used - Excellent",
    condition_score: "9.4 / 10",
    inspection_score: 98,
    inspection_tested_date: "19 Mar 2025",
    serial_number: "S/N: C02G9912Q6L4",
    transaction_type: "both",
    rent_price_daily: 650,
    rent_price_weekly: 3900,
    security_deposit: 5000,
    sale_price: 49500,
    original_mrp: 84900,
    images: [
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80"
    ],
    specs: {
      "Chip": "Apple M1 with 8-core CPU & 7-core GPU",
      "Unified Memory": "8GB High-bandwidth RAM",
      "Storage": "256GB Ultra-fast SSD",
      "Display": "13.3-inch Retina Display (2560x1600)"
    },
    kit_items: ["MacBook Air M1 Space Grey", "Apple 30W Charger & Cable", "Felt Sleeve"],
    pickup_locations: ["Sector 21 Main Market", "Sector 7"],
    location_name: "Sector 21, Gandhinagar",
    distance_km: 2.2,
    is_instant_pickup: true,
    status: "active",
    seller_id: 1,
    seller_name: "Aarav Patel",
    seller_avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aarav&backgroundColor=b6e3f4",
    seller_is_verified: true,
    seller_rating: 4.9,
    seller_reviews_count: 36,
    badge: "Buy or Rent",
    badgeColor: "bg-primary text-on-primary",
    bottomChip: {
      type: "aadhaar",
      text: "Aadhaar Verified",
      icon: "verified",
      classes: "bg-secondary-container/30 text-on-secondary-container"
    }
  }
];

export const VALUE_PROPS = [
  { icon: "verified_user", label: "Verified Users" },
  { icon: "shield", label: "Secure Payments" },
  { icon: "near_me", label: "Local Products" },
  { icon: "star", label: "Ratings & Reviews", isRating: true }
];

export const FEATURE_PILLARS = [
  {
    type: "buy",
    badge: "BUY",
    badgeColor: "bg-primary text-on-primary",
    icon: "shopping_cart",
    title: "Buy",
    description: "Quality pre-owned goods verified and tested locally.",
    buttonText: "Shop Products →",
    action: "search"
  },
  {
    type: "rent",
    badge: "RENT",
    badgeColor: "bg-secondary text-on-secondary",
    icon: "event_repeat",
    title: "Rent",
    description: "Borrow tools, cameras, and gear by the day.",
    buttonText: "Browse Rentals →",
    action: "search"
  },
  {
    type: "sell",
    badge: "SELL",
    badgeColor: "bg-surface-container-high text-on-surface",
    icon: "storefront",
    title: "Sell & Earn",
    description: "List idle equipment and earn from neighbors.",
    buttonText: "List an Item →",
    action: "list-item"
  }
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "Step 01",
    icon: "search",
    iconColor: "text-primary",
    title: "Find Gear",
    description: "Browse verified items in your neighborhood."
  },
  {
    step: "Step 02",
    icon: "handshake",
    iconColor: "text-secondary",
    title: "Reserve",
    description: "Lock dates with secure UPI escrow and chat with host."
  },
  {
    step: "Step 03",
    icon: "sentiment_satisfied",
    iconColor: "text-on-tertiary-container",
    title: "Pickup & Use",
    description: "Meet nearby, inspect with OTP pass, and return with ease."
  }
];

export const TRUST_BADGES = [
  { icon: "check_circle", label: "Aadhaar & Phone Verified" },
  { icon: "star", label: "Transparent 5-Star Ratings", isRating: true },
  { icon: "lock", label: "Escrow-Protected Deposits" }
];
