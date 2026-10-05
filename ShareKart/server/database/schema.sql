-- =============================================================================
-- ShareKart PostgreSQL Database Schema
-- File: schema.sql
-- Description: Complete DDL script for PostgreSQL with tables, constraints,
--              foreign keys, and performance indexes.
-- =============================================================================

-- Enable UUID extension if needed in future
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in reverse dependency order (safe for re-running)
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS rentals CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255) DEFAULT 'Gandhinagar, 382010',
    city VARCHAR(100) DEFAULT 'Gandhinagar',
    pincode VARCHAR(20) DEFAULT '382010',
    avatar_url TEXT,
    is_aadhaar_verified BOOLEAN DEFAULT TRUE,
    aadhaar_hash VARCHAR(100) DEFAULT '#OK-82914',
    aadhaar_number VARCHAR(100) DEFAULT 'XXXX-XXXX-4819',
    member_since VARCHAR(50) DEFAULT 'Aug 2023',
    rating NUMERIC(3, 2) DEFAULT 4.90,
    reviews_count INTEGER DEFAULT 24,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on email for faster authentication lookups
CREATE INDEX idx_users_email ON users(email);

-- -----------------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    item_count INTEGER DEFAULT 0
);

-- -----------------------------------------------------------------------------
-- 3. PRODUCTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category_id VARCHAR(100) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    subcategory VARCHAR(100),
    description TEXT,
    condition_tag VARCHAR(50) DEFAULT 'Used - Excellent',
    condition_score VARCHAR(50) DEFAULT '9 / 10',
    inspection_score INTEGER DEFAULT 98,
    inspection_tested_date VARCHAR(50) DEFAULT '18 Mar 2025',
    serial_number VARCHAR(100) DEFAULT 'S/N: 4729188-IN',
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('rent', 'buy', 'both')),
    rent_price_daily INTEGER DEFAULT 0,
    rent_price_weekly INTEGER DEFAULT 0,
    security_deposit INTEGER DEFAULT 0,
    sale_price INTEGER DEFAULT 0,
    original_mrp INTEGER DEFAULT 0,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    specs JSONB DEFAULT '{}'::jsonb,
    kit_items JSONB DEFAULT '[]'::jsonb,
    pickup_locations JSONB DEFAULT '[]'::jsonb,
    location_name VARCHAR(255) DEFAULT 'Gandhinagar, Sector 7',
    distance_km NUMERIC(5, 2) DEFAULT 2.50,
    is_instant_pickup BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'rented', 'sold', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product indexes for filtering & search performance
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_transaction_type ON products(transaction_type);

-- -----------------------------------------------------------------------------
-- 4. RENTALS & ORDERS TABLE (Escrow Contracts)
-- -----------------------------------------------------------------------------
CREATE TABLE rentals (
    id VARCHAR(100) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('rent', 'buy')),
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    total_days INTEGER DEFAULT 1,
    rent_fee INTEGER DEFAULT 0,
    deposit_fee INTEGER DEFAULT 0,
    platform_fee INTEGER DEFAULT 99,
    gst_fee INTEGER DEFAULT 18,
    delivery_fee INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL,
    delivery_type VARCHAR(50) DEFAULT 'pickup' CHECK (delivery_type IN ('pickup', 'delivery')),
    delivery_address TEXT,
    payment_method VARCHAR(50) DEFAULT 'upi' CHECK (payment_method IN ('upi', 'card', 'netbanking')),
    payment_status VARCHAR(50) DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    escrow_status VARCHAR(50) DEFAULT 'held_in_escrow' CHECK (escrow_status IN ('held_in_escrow', 'released_to_seller', 'deposit_refunded', 'disputed')),
    escrow_pin VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'active', 'completed', 'rejected', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rental indexes for dashboard and escrow queries
CREATE INDEX idx_rentals_user ON rentals(user_id);
CREATE INDEX idx_rentals_product ON rentals(product_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_escrow_status ON rentals(escrow_status);

-- -----------------------------------------------------------------------------
-- 5. REVIEWS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_avatar TEXT,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    rental_context VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_product ON reviews(product_id);

-- -----------------------------------------------------------------------------
-- 6. MESSAGES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_product ON messages(product_id);

-- -----------------------------------------------------------------------------
-- 7. DISPUTES TABLE (Mediation & Trust Portal)
-- -----------------------------------------------------------------------------
CREATE TABLE disputes (
    id VARCHAR(100) PRIMARY KEY,
    rental_id VARCHAR(100) REFERENCES rentals(id) ON DELETE SET NULL,
    product_title VARCHAR(255) NOT NULL,
    item_category VARCHAR(100) DEFAULT 'Electronics',
    complainant_name VARCHAR(255) NOT NULL,
    respondent_name VARCHAR(255) NOT NULL,
    claim_amount INTEGER NOT NULL,
    deposit_amount INTEGER NOT NULL,
    issue_type VARCHAR(50) NOT NULL CHECK (issue_type IN ('damage', 'delay', 'missing_item')),
    tag_label VARCHAR(100) NOT NULL,
    description TEXT,
    pre_photo TEXT,
    post_photo TEXT,
    sla_hours NUMERIC(4, 1) DEFAULT 6.0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated')),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_disputes_rental ON disputes(rental_id);
CREATE INDEX idx_disputes_status ON disputes(status);
