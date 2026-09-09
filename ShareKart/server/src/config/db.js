import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'sharekart.sqlite');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for reliability
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT,
    location TEXT DEFAULT 'Gandhinagar, 382010',
    city TEXT DEFAULT 'Gandhinagar',
    pincode TEXT DEFAULT '382010',
    avatar_url TEXT,
    is_aadhaar_verified INTEGER DEFAULT 1,
    aadhaar_hash TEXT DEFAULT '#OK-82914',
    aadhaar_number TEXT DEFAULT 'XXXX-XXXX-4819',
    member_since TEXT DEFAULT 'Aug 2023',
    rating REAL DEFAULT 4.9,
    reviews_count INTEGER DEFAULT 24,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    item_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES categories(id),
    subcategory TEXT,
    description TEXT,
    condition_tag TEXT DEFAULT 'Used - Excellent',
    condition_score TEXT DEFAULT '9 / 10',
    inspection_score INTEGER DEFAULT 98,
    inspection_tested_date TEXT DEFAULT '18 Mar 2025',
    serial_number TEXT DEFAULT 'S/N: 4729188-IN',
    transaction_type TEXT NOT NULL, -- 'rent', 'buy', 'both'
    rent_price_daily INTEGER DEFAULT 0,
    rent_price_weekly INTEGER DEFAULT 0,
    security_deposit INTEGER DEFAULT 0,
    sale_price INTEGER DEFAULT 0,
    original_mrp INTEGER DEFAULT 0,
    images TEXT NOT NULL, -- JSON array
    specs TEXT, -- JSON object
    kit_items TEXT, -- JSON array
    pickup_locations TEXT, -- JSON array
    location_name TEXT DEFAULT 'Gandhinagar, Sector 7',
    distance_km REAL DEFAULT 2.5,
    is_instant_pickup INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active', -- 'active', 'rented', 'sold', 'paused'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rentals (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    order_type TEXT NOT NULL, -- 'rent' or 'buy'
    start_date TEXT,
    end_date TEXT,
    total_days INTEGER DEFAULT 1,
    rent_fee INTEGER DEFAULT 0,
    deposit_fee INTEGER DEFAULT 0,
    platform_fee INTEGER DEFAULT 99,
    gst_fee INTEGER DEFAULT 18,
    delivery_fee INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL,
    delivery_type TEXT DEFAULT 'pickup', -- 'pickup' or 'delivery'
    delivery_address TEXT,
    payment_method TEXT DEFAULT 'upi', -- 'upi', 'card', 'netbanking'
    payment_status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    escrow_status TEXT DEFAULT 'held_in_escrow', -- 'held_in_escrow', 'released_to_seller', 'deposit_refunded', 'disputed'
    escrow_pin TEXT,
    status TEXT DEFAULT 'pending_approval', -- 'pending_approval', 'active', 'completed', 'rejected', 'cancelled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id),
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    rating INTEGER DEFAULT 5,
    comment TEXT,
    rental_context TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    receiver_id INTEGER NOT NULL REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
