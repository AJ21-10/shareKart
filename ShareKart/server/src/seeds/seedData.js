import db from '../config/db.js';
import bcrypt from 'bcryptjs';

console.log('Seeding Sharekart database...');

// Clean existing data
db.exec(`
  DELETE FROM messages;
  DELETE FROM reviews;
  DELETE FROM rentals;
  DELETE FROM products;
  DELETE FROM categories;
  DELETE FROM users;
`);

// Password hash for all demo users is: password123
const passwordHash = bcrypt.hashSync('password123', 10);

// 1. Insert Users
const insertUser = db.prepare(`
  INSERT INTO users (id, name, email, password_hash, phone, location, city, pincode, avatar_url, is_aadhaar_verified, aadhaar_hash, aadhaar_number, member_since, rating, reviews_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertUser.run(
  1,
  'Aarav Patel',
  'aarav@sharekart.in',
  passwordHash,
  '+91 98765 43210',
  'Gandhinagar, Sector 7',
  'Gandhinagar',
  '382010',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB545f6ceGmox7wT32Fww8WeepCos-Gc28aQMjSouhaEb6Ww_eJ3i1rjONcK0h9q-ZuPcSGTO4lnll9Ty3EbYhBUn8TjVVJ2U9dLolJIrafUZySH4QPEuh7vqZRVc-Fdfv6TEH45cHms9CiVRYXZVzfQlO0NQJ0WMJZcUMHxsW39Yho2r4T_wh2WGmHew8paWqYAXiHti3Nukk9p66xn7eOVR-1K76oPa-86XoDwC_xOa28FqIuPdS8og',
  1,
  '#OK-82914',
  'XXXX-XXXX-4819',
  'Aug 2023',
  4.9,
  36
);

insertUser.run(
  2,
  'Vikram Joshi',
  'vikram@sharekart.in',
  passwordHash,
  '+91 98234 56789',
  'Infocity, Gandhinagar',
  'Gandhinagar',
  '382007',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCvwX0VWpSJeuED4-rB81VPbPA27lNTThgp81lY-ZFyVuVBRwPxI0IFrki4JcG94IeY39-P9xmSiL6G69D5zNkU7w1PPH-QW9cOR-gwQmGnUUhfrc_JkvgLDcsbrmrzoC4MQQN8mo9tSRi8luvZ0d0CHIHD7afE8KkKE18VbU8iwj_RJrYZxHfwxX1t_ZmtMoJMwBL3dP8MvzxQ70ueO-bq5X5qAtYR3Q8zsFZYGLKWMPsefnfoFiu6IQ',
  1,
  '#OK-77192',
  'XXXX-XXXX-9921',
  'Aug 2023',
  4.9,
  42
);

insertUser.run(
  3,
  'Kavya Patel',
  'kavya@sharekart.in',
  passwordHash,
  '+91 99123 45678',
  'Kudasan, Gandhinagar',
  'Gandhinagar',
  '382421',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  1,
  '#OK-61203',
  'XXXX-XXXX-3312',
  'Jan 2024',
  5.0,
  18
);

insertUser.run(
  4,
  'Ramesh Kumar',
  'ramesh@sharekart.in',
  passwordHash,
  '+91 97234 11223',
  'Sector 21, Gandhinagar',
  'Gandhinagar',
  '382021',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  1,
  '#OK-54219',
  'XXXX-XXXX-7142',
  'Mar 2024',
  4.8,
  12
);

// 2. Insert Categories
const insertCategory = db.prepare(`
  INSERT INTO categories (id, name, icon, item_count)
  VALUES (?, ?, ?, ?)
`);

const categories = [
  ['laptops-mobiles', 'Electronics & Laptops', 'laptop_mac', 1240],
  ['home-furniture', 'Furniture & Decor', 'chair', 890],
  ['power-tools-machinery', 'Power Tools & Equip.', 'home_repair_service', 530],
  ['cameras-audio', 'Cameras & Audio', 'photo_camera', 420],
  ['bikes-cycles', 'Bikes & Cycles', 'pedal_bike', 310],
  ['home-appliances', 'Home Appliances', 'kitchen', 680],
  ['books-sports', 'Books & Sports', 'sports_tennis', 450],
];

categories.forEach(([id, name, icon, count]) => insertCategory.run(id, name, icon, count));

// 3. Insert Products
const insertProduct = db.prepare(`
  INSERT INTO products (
    id, seller_id, title, category_id, subcategory, description,
    condition_tag, condition_score, inspection_score, inspection_tested_date,
    serial_number, transaction_type, rent_price_daily, rent_price_weekly,
    security_deposit, sale_price, original_mrp, images, specs, kit_items,
    pickup_locations, location_name, distance_km, is_instant_pickup, status
  ) VALUES (
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?
  )
`);

// Product 1: Sony Alpha A6400 (From product details page)
insertProduct.run(
  1,
  2, // Vikram Joshi
  'Sony Alpha A6400 24.2MP 4K Mirrorless Camera',
  'cameras-audio',
  'Mirrorless & DSLRs',
  'Sony Alpha A6400 compact mirrorless camera mounted with 16-50mm power zoom lens placed on a clean minimalist studio table in natural daylight, crisp optical detail, high definition photograph with accurate mechanical textures and premium matte finish. Perfect for travel photography, campus projects at DA-IICT / NIFT Gandhinagar, corporate events at Mahatma Mandir, wedding reels, and cinematic YouTube creation with zero recording limit.',
  'Used - Excellent',
  '9 / 10',
  98,
  '18 Mar 2025',
  'S/N: 4729188-IN',
  'both',
  850,
  5100,
  3500,
  48000,
  74990,
  JSON.stringify([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB9l8s94eHGoE5SEWQdGdOGHhgKajHzqfX_gDrZlbFQNbWjaZgx4xlDfSjspD46yrrdmCSUPfZ_b0-kUjK2lVvM03JSrkH96mVUZmeokyrAPAUgOQIRVkn8OxFOlfiUL88oykuWH83dT8_k4sF-ahnhoTsXXoK-WBlOOj1gaKZE2Jhpllbe2ivrt1F1tMAdWsNpWGgqzb_d-18Br2X5TwKxJUMTJCUcqaJYgvNWemO5f4JSkoxFYThGGg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCMLeqN9cH0qVqTt_2S353oLSbO5EjEfTbrftYmK-LCGCCaAPNqAFg0S5gIjE92t4wBx8_5OI83T2Xg3aAjREihjlMzldIk9mvpzk48-TIH1Q9Opz9oWnDeDXWAfPQBT_8T4N26eP6rHCHJdNGOf2PY349CTple8NBoY-agyE8Gx3FcVtVs67Gei8NvsAzNmvytBwGiWYYm1ncvtjBkvjH9eDZonWTe6OYyKtvRWDzcZ7PdjOTnYELGXA',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAZlXHSYxSc9BcauXtFk2sjOdHdn4ewLwTlb02aaTjhg9GPL1ZFUjMCK14_hGdqEqpufyBmHTp71GtsVpYEqa9ptYBIkYFXZiXORhV-humUpzlH-9pXmLkb9HBnrhOSExSD-z7seex-QlTYBnC-m2HYY5ZmcuhqUxjpZZUMSmTZNJafD2nDtbvIiuiWJoZ-0sYOfQoVsjDIYr37uy4f0VwZCDoe8MmWU3NU8KMJVLuxg5Qhr046hHEquQ',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBHVz2as9CwQtv73gP5hHSPWQzf8eZa7Bgmrb_BxmBbdIHTY9K-eGy-lMpjlmupKMnBjdk7zyugojI_MQnDPlL_zr604xl1Cn3yIPGcW-g48xfKjv7dSNw5bEo9Xq4ck27R0ZNFuAmeHNJKMUWdmsMdRjUnzJts_BGDHXXpOiLX50g7I96iRm-sbW1fTQBtUmxldiphFIXbDkRSz0pCVeFpsjGc2Wlw_ESPnI-0Ei8zkUr5RqMB0mFmpw',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuByV3kP5gXsk3pqjUdyAbFlL4p9FuwL_1qkdOnIsXT8aTdk0rlp-zWUTNj0ysoap4dppdbR_swgerHlJDUA1z2FfEX3mKnSidrMo0p8nmKpCmIwAed3OQXUAm6lIjR6yQbNcaQn0OIVbIn6uncuvHfjNjryjN-u4l_d7bFGkWv6xX96OA2fdLzhBNMmJRIulC-uyMbteU7ME5igI3Hma23BiSm6QaGBuQ9v8-8kgvIU-Jmyszl39HSDMw'
  ]),
  JSON.stringify({
    'Sensor': '24.2 MP APS-C Exmor CMOS',
    'Autofocus': '425 Phase-detection AF Points',
    'Video Capability': '4K HDR (3840x2160) at 30fps',
    'Screen': '180° Tiltable Touch LCD',
    'Weight': '403 g (Body only)',
    'Profiles': 'S-Log2, S-Log3, HLG 4K',
    'Shutter Count': '4,820 (2.4% of life)',
    'Battery Health': '95% Peak (2x NP-FW50)'
  }),
  JSON.stringify([
    'Sony A6400 Mirrorless Camera Body (Black)',
    'E PZ 16-50mm f/3.5-5.6 OSS Power Zoom Lens',
    '2x Original Sony NP-FW50 Rechargeable Packs',
    'Dual USB Rapid Battery Charger + Micro Cable',
    'SanDisk Extreme Pro 64GB 170MB/s 4K SDXC Card',
    'Padded Shockproof Shoulder Bag + Neck Strap'
  ]),
  JSON.stringify([
    'Infocity Club & Resort Main Gate (Primary Point)',
    'TCS Garima Park Gate 1 (Kudasan - Evening 6-9 PM)'
  ]),
  'Infocity, Gandhinagar',
  2.5,
  1,
  'active'
);

// Product 2: Bosch Professional Hammer Drill 800W
insertProduct.run(
  2,
  1, // Aarav Patel
  'Bosch Professional Hammer Drill 800W (Heavy Duty SDS Plus)',
  'power-tools-machinery',
  'Drills & Drivers',
  'Industrial Bosch professional heavy duty rotary hammer drill in dark blue and red casing resting on a clean wooden table in natural light. Comes with SDS Plus chuck, auxiliary handle, depth stop and 5-piece drill bit set.',
  'Used - Excellent',
  '9.2 / 10',
  96,
  '12 Feb 2025',
  'S/N: 882190-IN',
  'rent',
  350,
  2100,
  1500,
  0,
  6800,
  JSON.stringify([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDBFDSQ5IBN7WBs2FdMYV60uVkfVwA90SyISdGPuvYQnJmaThMfwT_UEq7DmQNAv1BjMEfpS6fBZez8gqaZ-hIsHX8b0CWkSWoivb-fEDJUOT05DuN8BF54Hmk-jWiJ9W4aGx3txOOh2eenRpDj3Bzs8Eqvnt_wjFATaZvyvlnbig0gY9Ue1tmmkiTE3Jl3g3EZur6Ct4RjYCuOQu9EPgtNw7BEBJb2Ecc-EJj3h2ZIeKusEHoOVSZKww',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC235uczLsUujE1_TSs3euS_pFUx5NLMc7L2iIsDT1YuXRhv6pN4FOSoJRddxYx4C_mbrorGRPzXBRh_tYLRKnBNLZPFT9E-2o2G93fQFyDu2wNxfSH_Zi5U0I3r4ms9N4StBbyPrBwdvDJuu2tslhqJtKdY0nn3-oxZO8Ohr0XTdvY29d8kZnG93dpQZt-b_9YzYgEi69n-796ZczQTwNUc6vePLkV9_gXQUXuk2vf3GhjIecYZO_5Bg'
  ]),
  JSON.stringify({
    'Power Input': '800 W',
    'Impact Rate': '0 - 4000 bpm',
    'Chuck Type': 'SDS Plus',
    'Max Drilling': '26 mm (Concrete)'
  }),
  JSON.stringify([
    'Bosch Hammer Drill 800W Body',
    'Heavy-Duty Plastic Carry Case',
    'Depth Gauge Rod',
    '5x Masonry Drill Bits'
  ]),
  JSON.stringify([
    'Sector 21 Main Market, Gandhinagar'
  ]),
  'Sector 21, Gandhinagar',
  1.8,
  1,
  'active'
);

// Product 3: Dell Latitude Slim Business Laptop
insertProduct.run(
  3,
  1, // Aarav Patel
  'Dell Latitude Slim Business Laptop (Core i7, 16GB RAM, 512GB NVMe)',
  'laptops-mobiles',
  'Laptops & Desktops',
  'Clean Dell Latitude metallic silver laptop open with crisp matte FHD display, backlit keyboard, ultra quiet cooling, and 6-hour verified battery life. Includes original 65W fast charger.',
  'Used - Like New',
  '9.5 / 10',
  99,
  '10 Mar 2025',
  'S/N: DL-99201-LAT',
  'both',
  450,
  2700,
  4000,
  32000,
  65000,
  JSON.stringify([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAb_45Azl_P8Ld1cbqTUESCMNkxu3pfri1mXDYkAUv29tu81p5wJXYu16YVPsHcVH_Aw6909WfINu2CTFVINj8hnStblrdR7M3dk7iju94OAyDMM5NeK7DQm_SnFp-ekJJzS8YSRlLvd1anjN-fZQACRnH_1To4APRS4IuYPGBgtpKcd6XeJ9bFCY6ogjTTlBGSO3e7ROkZNcnA-BHPXyYQqefiDnqLye8ks_0K084JQUEaOtXXu6Y0JQ',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB5IU55n33IaHMF5O8ZTJNWKxbM6_3m5A6rzWPmvHX_DONTqW5Iw5v10G_AgSS8yaQT9mcmpc6TxXadjCUQcwtEJIGzMmGqRDM45cv01_Ip3WE9NVyZv6lfzqhFFzxVWoLK3Z_DEKGV5_SPFk_NsYUICsd7WL-YH_qFzWNPHqepYSiP2E_97PtY0WE7xugmuV-FCJ_ndDOGmlTUcAlbV-GZ4eU0qpmIkEhlHY_1ba7s3pmiK5eIlBskA'
  ]),
  JSON.stringify({
    'Processor': 'Intel Core i7 11th Gen',
    'Memory': '16GB DDR4 3200MHz',
    'Storage': '512GB PCIe M.2 SSD',
    'Display': '14-inch Full HD Anti-Glare',
    'OS': 'Windows 11 Pro Genuine'
  }),
  JSON.stringify([
    'Dell Latitude Laptop',
    'Original Dell 65W Type-C Charger',
    'Neoprene Laptop Sleeve'
  ]),
  JSON.stringify([
    'Infocity Gate 2, Gandhinagar'
  ]),
  'Infocity, Gandhinagar',
  3.1,
  1,
  'active'
);

// Product 4: Hero Sprint Mountain Bicycle
insertProduct.run(
  4,
  1, // Aarav Patel
  'Hero Sprint Mountain Bicycle 21-Speed Shimano (Dual Disc Brakes)',
  'bikes-cycles',
  'Mountain & Geared Bikes',
  'Matte black and red Hero Sprint mountain bicycle parked outdoors on city paving, clean chain and gears, bright day sunlight, clear geometry. Equipped with front suspension fork and 21-speed Shimano Tourney gears.',
  'Used - Very Good',
  '8.8 / 10',
  94,
  '01 Mar 2025',
  'S/N: HS-CYCLE-441',
  'rent',
  199,
  1199,
  1000,
  0,
  12500,
  JSON.stringify([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBqzBu10D6LxzKH-wtlXTZUofhi4rnIWu7BgtgoO3qKx3tzCsFz1vAK1svbmuKB2D7x4sSN9mItFl4pZ_ICPPYPxWXK0drBPht4VzAAJiYhufALNmPLHNuYs9UWvtJiKmA-QWZxQYjC1rwy9Nwj2cBERYMTnXSXZZbDEYIOJky68l8bJCeKVmfh3CdaZl3irgoBzQXXbnOATLnidKUT7yQByelTw7V87JafovztcSKSJLpIzSHG9gkq4w',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBCKhWinYdBS_a6ZWlWh_4eZQqXNuTD8cW-7UJFtVCK7SoMSJ5wdfFA9vg_Zug3AXPsJ9_cCHoJ9-rKh4ASd5NfkPaRB99Kye9aNUh5OWWYSRsDr9nFr07UIwnbCTXLw9Jiz4ot19mePps_koKIvDgh6A2SuWT7HbVR8LBBNAVqiTqT2iqpNwfRbgRLUAfJCDWWQcWaVengG2IFnaoMOnpOM2XsyEnAUpGbFkZU8Tht1XwuJRK6IbDI4w'
  ]),
  JSON.stringify({
    'Gears': '21-Speed Shimano Tourney',
    'Brakes': 'Front & Rear Mechanical Disc',
    'Frame': 'Alloy 27.5 Inch Hardtail',
    'Tires': 'All-Terrain 27.5 x 2.10'
  }),
  JSON.stringify([
    'Hero Sprint 21-Speed Cycle',
    'Cable Combination Lock',
    'LED Night Headlamp + Taillight'
  ]),
  JSON.stringify([
    'Sector 7 Community Ground, Gandhinagar'
  ]),
  'Sector 7, Gandhinagar',
  0.9,
  1,
  'active'
);

// Product 5: Kärcher High Pressure Washer K2 Compact
insertProduct.run(
  5,
  2, // Vikram Joshi
  'Kärcher High Pressure Washer K2 Compact (110 Bar, Car & Patio Kit)',
  'home-appliances',
  'Cleaning & Washers',
  'Yellow Kärcher high pressure washer with hose spray lance coiled neatly beside a washed car courtyard, clean Indian domestic home setting. Produces 110 bar water pressure with detergent suction hose for deep cleaning.',
  'Used - Excellent',
  '9.0 / 10',
  95,
  '20 Feb 2025',
  'S/N: KC-WASH-1029',
  'rent',
  299,
  1799,
  1200,
  0,
  9800,
  JSON.stringify([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC49zElAwds347b_e-5dlH3DXuasL8i8RLvTTMJXPDffqHupGqu6bVKqVDMktYNprSX3pB53d97NDrlE0SIAyabH4i7qn4io_efI2dvc1bMJ-RirKgblUSxIdpDdvh6VihfGK2eouUVMumtwd_x3H42quaM96G6TX9pf-MrDhf5GFnVB80Tf8dURhqvvt55MAt9INKXizrXjdgPhlVPLJj94hZfThPCXOs9HVFH7rzYqvvo2vDvG-DGyw'
  ]),
  JSON.stringify({
    'Pressure': '110 Bar Max',
    'Flow Rate': '360 L/h',
    'Power': '1400 W',
    'Hose Length': '4 Metres High Pressure'
  }),
  JSON.stringify([
    'Kärcher K2 Washer Unit',
    'Vario Power Jet Lance',
    'Dirt Blaster Spray Lance',
    '4m High-Pressure Hose'
  ]),
  JSON.stringify([
    'Kudasan Swagat Gate, Gandhinagar'
  ]),
  'Kudasan, Gandhinagar',
  4.2,
  1,
  'active'
);

// Product 6: Philips Smart LED Projector 1080p
insertProduct.run(
  6,
  1, // Aarav Patel
  'Philips Smart LED Projector 1080p Full HD (Android TV Built-in)',
  'laptops-mobiles',
  'Electronics & Projectors',
  'Compact modern white Philips video projector on low living room coffee table projecting movie on clean wall, warm ambient evening interior lighting. Native 1080p Full HD with auto-keystone correction and built-in stereo speakers.',
  'Used - Like New',
  '9.6 / 10',
  97,
  '15 Mar 2025',
  'S/N: PH-PROJ-3301',
  'rent',
  550,
  3300,
  2500,
  0,
  29900,
  JSON.stringify([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCxpskwUnvSbWBjXQ6PKfbgp4ucnFQxmq3_76JMiVrbNAzt7oYuKno35OwNnGOsxbxRaXsvn5hlEF7nN0z1oxpTkdZWVR6ACQbcB6pynqnc2rbEsrkctn4TNxYMMsOVhwkO5U919g3zRtZRNtmipjUXh2TzpinSFOvMvrhlqvwhdqSiw3Vt5yEg-jpt36f7ZSLrxOB8RMpNSmAWmqmKGrhH3Q-yl9enyBZIfWaKyWmK-bN6N2SfOtNYRw'
  ]),
  JSON.stringify({
    'Resolution': 'Native 1920x1080 Full HD',
    'Brightness': '650 ANSI Lumens',
    'Projection Size': 'Up to 120 Inches',
    'Connectivity': 'HDMI, Dual Band WiFi, Bluetooth 5.0'
  }),
  JSON.stringify([
    'Philips Projector',
    'Bluetooth Voice Remote with Batteries',
    'High Speed 4K HDMI Cable',
    'Power Brick & Carry Pouch'
  ]),
  JSON.stringify([
    'Sector 11 Shopping Center, Gandhinagar'
  ]),
  'Sector 11, Gandhinagar',
  2.8,
  1,
  'active'
);

// Product 7: Ergonomic High-Back Mesh Office Chair
insertProduct.run(
  7,
  2, // Vikram Joshi
  'Ergonomic High-Back Mesh Office Desk Chair (Adjustable Lumbar)',
  'home-furniture',
  'Chairs & Desks',
  'Black ergonomic high-back mesh office desk chair with lumbar support and chrome base, neutral room corner, tidy clean presentation. Pneumatic height adjustment, 2D armrests, and 135° recline lock.',
  'Used - Excellent',
  '8.9 / 10',
  93,
  '05 Feb 2025',
  'S/N: ERGO-CHAIR-819',
  'buy',
  0,
  0,
  0,
  3400,
  7500,
  JSON.stringify([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB37VnuLZVN29oMPR0BjB6Iw36pkPS60j0tj0l06AGpaC4Yr1ktwSt9XtKfOe1XcxJulVJ9SwnhWnWfjfLlYJRgmxg2xADil-ol4csfGvA5uSTWsO08rxvOTntnBIAlwctq8vo-UQNn6D2nedmSYQeUeHLUZCSyHKgoOyJkOcwZ6UZNiIWvykinyBoD5E5r4bx7-HOGkZT4MO9pqzGbMphSYChtlBy0oUN4l2aZYMaOKmfXZOWfWuPfw'
  ]),
  JSON.stringify({
    'Material': 'Breathable Korean Mesh & Chrome',
    'Weight Capacity': '120 kg',
    'Recline': '90° to 135° Multi-Lock',
    'Armrests': '2D Height Adjustable'
  }),
  JSON.stringify([
    'Complete Ergonomic Office Chair'
  ]),
  JSON.stringify([
    'Vavol Township, Gandhinagar'
  ]),
  'Vavol, Gandhinagar',
  3.5,
  1,
  'active'
);

// Product 8: DJI Osmo Action 4 Camera 4K 120fps
insertProduct.run(
  8,
  2, // Vikram Joshi
  'DJI Osmo Action 4 Camera 4K 120fps (Dual Touchscreens & Extra Battery)',
  'cameras-audio',
  'Action Cameras',
  'DJI Osmo Action 4 camera standing upright with dual screens visible, floating hand grip and extra battery pack on gray textured tabletop, crisp photography. 1/1.3-inch sensor, 10-bit D-Log M color, 18m waterproof without housing.',
  'Used - Like New',
  '9.7 / 10',
  99,
  '14 Mar 2025',
  'S/N: DJI-ACT4-998',
  'both',
  650,
  3900,
  3000,
  24500,
  34990,
  JSON.stringify([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC8B7u4uzNVWF3uNDry5gMdN6dTi8mOvbbOZfOy-cthujnrNoCt6zGGxC8goFqJhQCooH5wwE9kDMuj2r8yY-OYwjjYAusTr0VZHvwFMfmZ9exGtpCOSFXM8WFjLTCPzoC4rOXUtCpDrayK2yq3jqKmY7qiYhRF2Px2KdQv4ID23M6U3jAq3Vy5wFaXwieHMpwsykwb6m_MogZNuESi8NuqbhXa1eRjlmoMrqcPDsELirJsNSDxiXwDXA'
  ]),
  JSON.stringify({
    'Sensor': '1/1.3-inch CMOS Sensor',
    'Max Video': '4K (3840×2160) @ 120fps',
    'Stabilization': 'RockSteady 3.0+ & HorizonSteady',
    'Waterproof': '18 m without Case'
  }),
  JSON.stringify([
    'DJI Osmo Action 4 Camera',
    '2x Extreme Batteries + Dual Hub',
    'Magnetic Quick-Release Mount',
    'Floating Hand Grip',
    'Lens Protective Rubber Cover'
  ]),
  JSON.stringify([
    'Sector 6 Police Line, Gandhinagar'
  ]),
  'Sector 6, Gandhinagar',
  1.5,
  1,
  'active'
);

// 4. Insert Reviews for Sony Alpha A6400 (From product details UI)
const insertReview = db.prepare(`
  INSERT INTO reviews (product_id, user_name, user_avatar, rating, comment, rental_context, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

insertReview.run(
  1,
  'Kavya Patel',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  5,
  'Super smooth experience! Vikram met me at Infocity food court on time. Camera was charged 100% and optical glass was spotless. Security deposit was reversed back via Razorpay within 20 mins of return.',
  'Rented for 4 Days · PDPU Campus Fest',
  '2025-03-15 14:30:00'
);

insertReview.run(
  1,
  'Rahul Mehta',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  5,
  'Shot 4K 24fps log footage for our architectural documentary. The autofocus tracking on moving subjects was mind-blowing. Kit bag and extra batteries were lifesavers.',
  'Rented for Weekend · Modhera Sun Temple Shoot',
  '2025-03-10 18:20:00'
);

// 5. Insert Active Rentals / Pending Requests (From seller dashboard UI)
const insertRental = db.prepare(`
  INSERT INTO rentals (
    id, user_id, product_id, order_type, start_date, end_date, total_days,
    rent_fee, deposit_fee, platform_fee, gst_fee, delivery_fee, total_amount,
    delivery_type, delivery_address, payment_method, payment_status, escrow_status,
    escrow_pin, status, created_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?
  )
`);

// Request 1: Ramesh Kumar renting Bosch Hammer Drill (Pending Approval)
insertRental.run(
  'SK-REQ-90124',
  4, // Ramesh Kumar
  2, // Bosch Hammer Drill
  'rent',
  '2025-10-25',
  '2025-10-28',
  3,
  1050,
  1500,
  99,
  18,
  0,
  2667,
  'pickup',
  'Self Pickup at Sector 21',
  'upi',
  'completed',
  'held_in_escrow',
  'PIN-4819',
  'pending_approval',
  '2025-10-24 10:15:00'
);

// Request 2: Kavya Patel renting Dell Latitude (Pending Approval)
insertRental.run(
  'SK-REQ-90125',
  3, // Kavya Patel
  3, // Dell Laptop
  'rent',
  '2025-10-26',
  '2025-10-29',
  3,
  1350,
  4000,
  99,
  18,
  150,
  5617,
  'delivery',
  'PDPU Campus Hostel Block B, Kudasan, Gandhinagar',
  'upi',
  'completed',
  'held_in_escrow',
  'PIN-8201',
  'pending_approval',
  '2025-10-24 11:45:00'
);

// Active Ongoing Rental 3: Sony A6400 rented to Kavya Patel (Active in Escrow)
insertRental.run(
  'SK-ORD-88204',
  3, // Kavya Patel
  1, // Sony A6400
  'rent',
  '2025-10-24',
  '2025-10-27',
  3,
  2550,
  3500,
  99,
  18,
  0,
  6167,
  'pickup',
  'Infocity Gate 2 Pickup',
  'upi',
  'completed',
  'held_in_escrow',
  'PIN-9923',
  'active',
  '2025-10-23 16:30:00'
);

// Completed Order 4: Hero Sprint Cycle
insertRental.run(
  'SK-ORD-77180',
  4, // Ramesh Kumar
  4, // Hero Sprint
  'rent',
  '2025-10-18',
  '2025-10-20',
  2,
  398,
  1000,
  99,
  18,
  0,
  1515,
  'pickup',
  'Sector 7 Ground',
  'upi',
  'completed',
  'deposit_refunded',
  'PIN-1104',
  'completed',
  '2025-10-18 09:00:00'
);

// 6. Insert Sample Messages
const insertMessage = db.prepare(`
  INSERT INTO messages (sender_id, receiver_id, product_id, content, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

insertMessage.run(
  3, // Kavya
  2, // Vikram
  1, // Sony A6400
  'Hi Vikram, does this kit include the lens hood and extra battery?',
  '2025-10-23 14:10:00'
);

insertMessage.run(
  2, // Vikram
  3, // Kavya
  1, // Sony A6400
  'Yes Kavya! It includes 2x original Sony NP-FW50 batteries and the lens hood, plus a fast dual USB charger.',
  '2025-10-23 14:14:00'
);

console.log('Database successfully seeded with realistic Sharekart items, users, and contracts!');
