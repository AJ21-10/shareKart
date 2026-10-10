-- =============================================================================
-- ShareKart PostgreSQL Demo Seed Data
-- File: seed.sql
-- Description: Realistic initial data for ShareKart platform
-- =============================================================================

-- Clear existing data
TRUNCATE TABLE disputes, messages, reviews, rentals, products, categories, users RESTART IDENTITY CASCADE;

-- -----------------------------------------------------------------------------
-- 1. USERS (Password for all demo accounts: 'password123')
-- -----------------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, phone, location, city, pincode, avatar_url, is_aadhaar_verified, aadhaar_hash, aadhaar_number, member_since, rating, reviews_count)
VALUES
(
  1,
  'Aarav Patel',
  'aarav@sharekart.in',
  '$2a$10$Vpk/TlUbqtIjyVqduWyk0eDsURfetdOhq85qXPk7YPslR6voKkUKa',
  '+91 98765 43210',
  'Gandhinagar, Sector 7',
  'Gandhinagar',
  '382010',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB545f6ceGmox7wT32Fww8WeepCos-Gc28aQMjSouhaEb6Ww_eJ3i1rjONcK0h9q-ZuPcSGTO4lnll9Ty3EbYhBUn8TjVVJ2U9dLolJIrafUZySH4QPEuh7vqZRVc-Fdfv6TEH45cHms9CiVRYXZVzfQlO0NQJ0WMJZcUMHxsW39Yho2r4T_wh2WGmHew8paWqYAXiHti3Nukk9p66xn7eOVR-1K76oPa-86XoDwC_xOa28FqIuPdS8og',
  TRUE,
  '#OK-82914',
  'XXXX-XXXX-4819',
  'Aug 2023',
  4.90,
  36
),
(
  2,
  'Vikram Joshi',
  'vikram@sharekart.in',
  '$2a$10$Vpk/TlUbqtIjyVqduWyk0eDsURfetdOhq85qXPk7YPslR6voKkUKa',
  '+91 98234 56789',
  'Infocity, Gandhinagar',
  'Gandhinagar',
  '382007',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCvwX0VWpSJeuED4-rB81VPbPA27lNTThgp81lY-ZFyVuVBRwPxI0IFrki4JcG94IeY39-P9xmSiL6G69D5zNkU7w1PPH-QW9cOR-gwQmGnUUhfrc_JkvgLDcsbrmrzoC4MQQN8mo9tSRi8luvZ0d0CHIHD7afE8KkKE18VbU8iwj_RJrYZxHfwxX1t_ZmtMoJMwBL3dP8MvzxQ70ueO-bq5X5qAtYR3Q8zsFZYGLKWMPsefnfoFiu6IQ',
  TRUE,
  '#OK-77192',
  'XXXX-XXXX-9921',
  'Aug 2023',
  4.90,
  42
),
(
  3,
  'Kavya Patel',
  'kavya@sharekart.in',
  '$2a$10$Vpk/TlUbqtIjyVqduWyk0eDsURfetdOhq85qXPk7YPslR6voKkUKa',
  '+91 99123 45678',
  'Kudasan, Gandhinagar',
  'Gandhinagar',
  '382421',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  TRUE,
  '#OK-61203',
  'XXXX-XXXX-3312',
  'Jan 2024',
  5.00,
  18
),
(
  4,
  'Ramesh Kumar',
  'ramesh@sharekart.in',
  '$2a$10$Vpk/TlUbqtIjyVqduWyk0eDsURfetdOhq85qXPk7YPslR6voKkUKa',
  '+91 97234 11223',
  'Sector 21, Gandhinagar',
  'Gandhinagar',
  '382021',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  TRUE,
  '#OK-54219',
  'XXXX-XXXX-7142',
  'Mar 2024',
  4.80,
  12
);

-- Sync users sequence with current max id
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- -----------------------------------------------------------------------------
-- 2. CATEGORIES
-- -----------------------------------------------------------------------------
INSERT INTO categories (id, name, icon, item_count)
VALUES
('laptops-mobiles', 'Electronics & Laptops', 'laptop_mac', 1240),
('home-furniture', 'Furniture & Decor', 'chair', 890),
('power-tools-machinery', 'Power Tools & Equip.', 'home_repair_service', 530),
('cameras-audio', 'Cameras & Audio', 'photo_camera', 420),
('bikes-cycles', 'Bikes & Cycles', 'pedal_bike', 310),
('home-appliances', 'Home Appliances', 'kitchen', 680),
('books-sports', 'Books & Sports', 'sports_tennis', 450);

-- -----------------------------------------------------------------------------
-- 3. PRODUCTS
-- -----------------------------------------------------------------------------
INSERT INTO products (
  id, seller_id, title, category_id, subcategory, description,
  condition_tag, condition_score, inspection_score, inspection_tested_date,
  serial_number, transaction_type, rent_price_daily, rent_price_weekly,
  security_deposit, sale_price, original_mrp, images, specs, kit_items,
  pickup_locations, location_name, distance_km, is_instant_pickup, status
) VALUES
(
  1,
  2,
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
  '[
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB9l8s94eHGoE5SEWQdGdOGHhgKajHzqfX_gDrZlbFQNbWjaZgx4xlDfSjspD46yrrdmCSUPfZ_b0-kUjK2lVvM03JSrkH96mVUZmeokyrAPAUgOQIRVkn8OxFOlfiUL88oykuWH83dT8_k4sF-ahnhoTsXXoK-WBlOOj1gaKZE2Jhpllbe2ivrt1F1tMAdWsNpWGgqzb_d-18Br2X5TwKxJUMTJCUcqaJYgvNWemO5f4JSkoxFYThGGg",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCMLeqN9cH0qVqTt_2S353oLSbO5EjEfTbrftYmK-LCGCCaAPNqAFg0S5gIjE92t4wBx8_5OI83T2Xg3aAjREihjlMzldIk9mvpzk48-TIH1Q9Opz9oWnDeDXWAfPQBT_8T4N26eP6rHCHJdNGOf2PY349CTple8NBoY-agyE8Gx3FcVtVs67Gei8NvsAzNmvytBwGiWYYm1ncvtjBkvjH9eDZonWTe6OYyKtvRWDzcZ7PdjOTnYELGXA"
  ]'::jsonb,
  '{
    "Sensor": "24.2 MP APS-C Exmor CMOS",
    "Autofocus": "425 Phase-detection AF Points",
    "Video Capability": "4K HDR (3840x2160) at 30fps",
    "Screen": "180° Tiltable Touch LCD",
    "Weight": "403 g (Body only)",
    "Profiles": "S-Log2, S-Log3, HLG 4K",
    "Shutter Count": "4,820 (2.4% of life)",
    "Battery Health": "95% Peak (2x NP-FW50)"
  }'::jsonb,
  '[
    "Sony A6400 Mirrorless Camera Body (Black)",
    "E PZ 16-50mm f/3.5-5.6 OSS Power Zoom Lens",
    "2x Original Sony NP-FW50 Rechargeable Packs",
    "Dual USB Rapid Battery Charger + Micro Cable",
    "SanDisk Extreme Pro 64GB 170MB/s 4K SDXC Card",
    "Padded Shockproof Shoulder Bag + Neck Strap"
  ]'::jsonb,
  '[
    "Infocity Club & Resort Main Gate (Primary Point)",
    "TCS Garima Park Gate 1 (Kudasan - Evening 6-9 PM)"
  ]'::jsonb,
  'Infocity, Gandhinagar',
  2.50,
  TRUE,
  'active'
),
(
  2,
  1,
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
  '[
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDBFDSQ5IBN7WBs2FdMYV60uVkfVwA90SyISdGPuvYQnJmaThMfwT_UEq7DmQNAv1BjMEfpS6fBZez8gqaZ-hIsHX8b0CWkSWoivb-fEDJUOT05DuN8BF54Hmk-jWiJ9W4aGx3txOOh2eenRpDj3Bzs8Eqvnt_wjFATaZvyvlnbig0gY9Ue1tmmkiTE3Jl3g3EZur6Ct4RjYCuOQu9EPgtNw7BEBJb2Ecc-EJj3h2ZIeKusEHoOVSZKww"
  ]'::jsonb,
  '{
    "Power Input": "800 W",
    "Impact Rate": "0 - 4000 bpm",
    "Chuck Type": "SDS Plus",
    "Max Drilling": "26 mm (Concrete)"
  }'::jsonb,
  '[
    "Bosch Hammer Drill 800W Body",
    "Heavy-Duty Plastic Carry Case",
    "Depth Gauge Rod",
    "5x Masonry Drill Bits"
  ]'::jsonb,
  '[
    "Sector 21 Main Market, Gandhinagar"
  ]'::jsonb,
  'Sector 21, Gandhinagar',
  1.80,
  TRUE,
  'active'
),
(
  3,
  1,
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
  '[
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAb_45Azl_P8Ld1cbqTUESCMNkxu3pfri1mXDYkAUv29tu81p5wJXYu16YVPsHcVH_Aw6909WfINu2CTFVINj8hnStblrdR7M3dk7iju94OAyDMM5NeK7DQm_SnFp-ekJJzS8YSRlLvd1anjN-fZQACRnH_1To4APRS4IuYPGBgtpKcd6XeJ9bFCY6ogjTTlBGSO3e7ROkZNcnA-BHPXyYQqefiDnqLye8ks_0K084JQUEaOtXXu6Y0JQ"
  ]'::jsonb,
  '{
    "Processor": "Intel Core i7 11th Gen",
    "Memory": "16GB DDR4 3200MHz",
    "Storage": "512GB PCIe M.2 SSD",
    "Display": "14-inch Full HD Anti-Glare",
    "OS": "Windows 11 Pro Genuine"
  }'::jsonb,
  '[
    "Dell Latitude Laptop",
    "Original Dell 65W Type-C Charger",
    "Neoprene Laptop Sleeve"
  ]'::jsonb,
  '[
    "Infocity Gate 2, Gandhinagar"
  ]'::jsonb,
  'Infocity, Gandhinagar',
  3.10,
  TRUE,
  'active'
),
(
  4,
  1,
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
  '[
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBqzBu10D6LxzKH-wtlXTZUofhi4rnIWu7BgtgoO3qKx3tzCsFz1vAK1svbmuKB2D7x4sSN9mItFl4pZ_ICPPYPxWXK0drBPht4VzAAJiYhufALNmPLHNuYs9UWvtJiKmA-QWZxQYjC1rwy9Nwj2cBERYMTnXSXZZbDEYIOJky68l8bJCeKVmfh3CdaZl3irgoBzQXXbnOATLnidKUT7yQByelTw7V87JafovztcSKSJLpIzSHG9gkq4w"
  ]'::jsonb,
  '{
    "Gears": "21-Speed Shimano Tourney",
    "Brakes": "Front & Rear Mechanical Disc",
    "Frame": "Alloy 27.5 Inch Hardtail"
  }'::jsonb,
  '[
    "Hero Sprint 21-Speed Cycle",
    "Cable Combination Lock",
    "LED Night Headlamp + Taillight"
  ]'::jsonb,
  '[
    "Sector 7 Community Ground, Gandhinagar"
  ]'::jsonb,
  'Sector 7, Gandhinagar',
  0.90,
  TRUE,
  'active'
);

-- Sync products sequence
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- -----------------------------------------------------------------------------
-- 4. RENTALS (Escrow Orders)
-- -----------------------------------------------------------------------------
INSERT INTO rentals (
  id, user_id, product_id, order_type, start_date, end_date, total_days,
  rent_fee, deposit_fee, platform_fee, gst_fee, delivery_fee, total_amount,
  delivery_type, delivery_address, payment_method, payment_status, escrow_status,
  escrow_pin, status, created_at
) VALUES
(
  'SK-REQ-90124',
  4,
  2,
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
  '2025-10-24 10:15:00+05:30'
),
(
  'SK-REQ-90125',
  3,
  3,
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
  '2025-10-24 11:45:00+05:30'
),
(
  'SK-ORD-88204',
  3,
  1,
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
  '2025-10-23 16:30:00+05:30'
);

-- -----------------------------------------------------------------------------
-- 5. REVIEWS
-- -----------------------------------------------------------------------------
INSERT INTO reviews (product_id, user_name, user_avatar, rating, comment, rental_context, created_at)
VALUES
(
  1,
  'Kavya Patel',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  5,
  'Super smooth experience! Vikram met me at Infocity food court on time. Camera was charged 100% and optical glass was spotless. Security deposit was reversed back via Razorpay within 20 mins of return.',
  'Rented for 4 Days · PDPU Campus Fest',
  '2025-03-15 14:30:00+05:30'
),
(
  1,
  'Rahul Mehta',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  5,
  'Shot 4K 24fps log footage for our architectural documentary. The autofocus tracking on moving subjects was mind-blowing. Kit bag and extra batteries were lifesavers.',
  'Rented for Weekend · Modhera Sun Temple Shoot',
  '2025-03-10 18:20:00+05:30'
);

SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews));

-- -----------------------------------------------------------------------------
-- 6. MESSAGES
-- -----------------------------------------------------------------------------
INSERT INTO messages (sender_id, receiver_id, product_id, content, created_at)
VALUES
(
  3,
  2,
  1,
  'Hi Vikram, does this kit include the lens hood and extra battery?',
  '2025-10-23 14:10:00+05:30'
),
(
  2,
  3,
  1,
  'Yes Kavya! It includes 2x original Sony NP-FW50 batteries and the lens hood, plus a fast dual USB charger.',
  '2025-10-23 14:14:00+05:30'
);

SELECT setval('messages_id_seq', (SELECT MAX(id) FROM messages));

-- -----------------------------------------------------------------------------
-- 7. DISPUTES
-- -----------------------------------------------------------------------------
INSERT INTO disputes (id, rental_id, product_title, item_category, complainant_name, respondent_name, claim_amount, deposit_amount, issue_type, tag_label, description, pre_photo, post_photo, sla_hours, status)
VALUES
(
  'DSP-8924',
  'SK-ORD-88204',
  'DJI Mini 3 Pro Drone',
  'Cameras & Audio',
  'Vikram Joshi (Lender)',
  'Aarav Mehta (Borrower)',
  2500,
  8000,
  'damage',
  'Gimbal & Blade Scuff',
  'Front right rotor arm has noticeable scrape mark and gimbal motor jittered upon power-on. Return inspection recorded discrepancy vs dispatch logs.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCJuVk0Mn9nqPYFFxnpzjkRcI4YyPZj5gKTHyZWs9SyKECUDzXQnUHHtpIdD-zWTQKZogYKBVmSWL-GKl8UbLgijQzxPKuIcoJoQDV0_mZtHO-At7TNYwLqQEMw2pUQhGb8BvU_RiMLhvuoYUlJDBiE_RKlIuXp2nO2rXWb9avP9kHs1Nf24F0CxtifMEzfUqbIzUOt_ixhrYKApO7FDfBQhSnNE4WcmGWlWTVwg2WxaRlNsoD7D-wA9w',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA0o1wRu8b1ZCCeHxHdRz5zq7CqayMAXYVKJmyz8zfHIrG_zai1vEVoGfjzIbFdytTovBIUYdRtGRRO_dM4zoUVXuEMA2gwmZDAm2xKln_p9qrJWUnbU_1XkUGBEbJtnLNHP7JLA2jWmXqLoN7erZGk0uKXH8AI7lYpBo2djHB4o9xi31rKYrmCW1WQHdg97lsGiRhE8IJO4eCT_a220-4TJSknKeMSqsP204eXiGhP40bus-2MnCN-Cg',
  4.2,
  'active'
),
(
  'DSP-8919',
  NULL,
  'Sony Alpha A7 IV + 24-70mm GM',
  'Cameras & Audio',
  'Rajesh Kumar (Lender)',
  'Rohan Sharma (Borrower)',
  1800,
  6000,
  'damage',
  'Sensor Dust Dispute',
  'High f-stop photos show severe sensor oil spots not present at pre-handover test.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD1NY762LcAFK3cmlqkQ6H67rh-Q9lQCzZUxrOfzinNAxW4P-kHbpkJfIeqWILYZyRJmLRWOoPMX58TovSftmxXiYlhfjBrhypVWiogbIpihrup-lPsJpczf73PC0uYUpcrGo4o8SqlUgjUXxSrad3JpizDK7xABYyeYIJneJbuncxe19uOGgg_d8yVKp-VaO3vNS5Qoa_czBoIdzkxmRN1xTZMqPIrORV4ek8dLjbhyRe9NF6OWV852Q',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCJuVk0Mn9nqPYFFxnpzjkRcI4YyPZj5gKTHyZWs9SyKECUDzXQnUHHtpIdD-zWTQKZogYKBVmSWL-GKl8UbLgijQzxPKuIcoJoQDV0_mZtHO-At7TNYwLqQEMw2pUQhGb8BvU_RiMLhvuoYUlJDBiE_RKlIuXp2nO2rXWb9avP9kHs1Nf24F0CxtifMEzfUqbIzUOt_ixhrYKApO7FDfBQhSnNE4WcmGWlWTVwg2WxaRlNsoD7D-wA9w',
  5.5,
  'active'
),
(
  'DSP-8912',
  NULL,
  'Bosch GSB 550 Impact Drill Kit',
  'Power Tools',
  'Karan Shah (Lender)',
  'Amit Trivedi (Borrower)',
  400,
  4400,
  'delay',
  'Missing Chuck Key',
  'Accessory chuck key missing during return; borrower agreed to pay replacement fee from deposit.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCTYkzG_fhXxa1ectNg--7DcFBPwSVegjuzbVZklQXP2z8Jdt1dJsMSMojQG3gjro-OkCx9m8_OFRfkAFG2vE5oa-wmpTsYkJjy7cP1sYdvg7slWRON4L45als-_qM26_x6UEDu4GzPn_VDJshPNNMxfkKIkaprE3lRVkAUlNleXIc71MhsoWT_Gk2W4Prsh6IlpyB90VMhtf1HAMOfSzHsMc8fZ59dn0K5TCqyPOqEhIRaBwnkEaedGw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCTYkzG_fhXxa1ectNg--7DcFBPwSVegjuzbVZklQXP2z8Jdt1dJsMSMojQG3gjro-OkCx9m8_OFRfkAFG2vE5oa-wmpTsYkJjy7cP1sYdvg7slWRON4L45als-_qM26_x6UEDu4GzPn_VDJshPNNMxfkKIkaprE3lRVkAUlNleXIc71MhsoWT_Gk2W4Prsh6IlpyB90VMhtf1HAMOfSzHsMc8fZ59dn0K5TCqyPOqEhIRaBwnkEaedGw',
  2.1,
  'active'
);
