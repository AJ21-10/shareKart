-- ============================================================
-- ShareKart — Database Schema Sketch
-- One schema block per service. No table is shared across
-- services. Cross-service references (columns ending in _ref)
-- are plain UUID/id columns WITHOUT a DB-level foreign key,
-- because the referenced table lives in another service's
-- database — the reference is only enforced via the owning
-- service's contract (e.g. Order Service calls Item Service's
-- checkItem() to validate item_ref, it never joins the table).
-- ============================================================

-- ------------------------------------------------------------
-- USER SERVICE  (owns: users, aadhaar_verifications, sessions)
-- ------------------------------------------------------------
CREATE TABLE users (
    user_id        UUID PRIMARY KEY,
    name           VARCHAR(120)  NOT NULL,
    phone          VARCHAR(15)   NOT NULL UNIQUE,
    email          VARCHAR(150),
    aadhaar_hash   VARCHAR(256)  NOT NULL,   -- hashed, never stored raw
    kyc_status     VARCHAR(20)   NOT NULL DEFAULT 'PENDING', -- PENDING | VERIFIED | FAILED
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE aadhaar_verifications (
    verification_id UUID PRIMARY KEY,
    user_id          UUID NOT NULL REFERENCES users(user_id),
    aadhaar_ref_token VARCHAR(256) NOT NULL,  -- token from verification provider, not the number
    status           VARCHAR(20) NOT NULL,     -- PENDING | VERIFIED | REJECTED
    verified_at      TIMESTAMP
);

CREATE TABLE sessions (
    session_id  UUID PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(user_id),
    token       VARCHAR(256) NOT NULL,
    expires_at  TIMESTAMP NOT NULL
);

-- ------------------------------------------------------------
-- ITEM SERVICE  (owns: categories, items)
-- ------------------------------------------------------------
CREATE TABLE categories (
    category_id     SERIAL PRIMARY KEY,
    name             VARCHAR(50) NOT NULL,     -- UNDER_5K | OVER_5K | OVER_50K
    price_band_min   NUMERIC(12,2) NOT NULL,
    price_band_max   NUMERIC(12,2)             -- NULL = no upper bound
);

CREATE TABLE items (
    item_id      UUID PRIMARY KEY,
    owner_ref    UUID NOT NULL,               -- external: User Service user_id (no DB FK)
    title        VARCHAR(150) NOT NULL,
    description  TEXT,
    price        NUMERIC(12,2) NOT NULL,
    category_id  INT NOT NULL REFERENCES categories(category_id),
    mode         VARCHAR(10) NOT NULL,         -- RENT | SELL
    status       VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE | RESERVED | UNLISTED
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- ORDER SERVICE  (owns: orders, bonds)
-- ------------------------------------------------------------
CREATE TABLE orders (
    order_id        UUID PRIMARY KEY,
    user_ref        UUID NOT NULL,             -- external: User Service user_id
    item_ref        UUID NOT NULL,             -- external: Item Service item_id
    mode            VARCHAR(10) NOT NULL,       -- RENT | BUY
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION',
                    -- PENDING_VERIFICATION | AWAITING_DEPOSIT | AWAITING_BOND |
                    -- CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED
    rent_start      DATE,
    rent_end        DATE,
    total_amount    NUMERIC(12,2) NOT NULL,
    requires_token  BOOLEAN NOT NULL DEFAULT FALSE,
    requires_bond   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE bonds (
    bond_id           UUID PRIMARY KEY,
    order_id          UUID NOT NULL REFERENCES orders(order_id),
    bond_document_url VARCHAR(300) NOT NULL,
    signed_at         TIMESTAMP,
    status            VARCHAR(20) NOT NULL DEFAULT 'PENDING' -- PENDING | SIGNED | REJECTED
);

-- ------------------------------------------------------------
-- PAYMENT SERVICE  (owns: payments, deposits)
-- ------------------------------------------------------------
CREATE TABLE payments (
    payment_id  UUID PRIMARY KEY,
    order_ref   UUID NOT NULL,                -- external: Order Service order_id
    amount      NUMERIC(12,2) NOT NULL,
    type        VARCHAR(20) NOT NULL,          -- RENT_FEE | SALE_FEE | DEPOSIT | REFUND
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING | SUCCESS | FAILED
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE deposits (
    deposit_id    UUID PRIMARY KEY,
    order_ref     UUID NOT NULL,              -- external: Order Service order_id
    amount_held   NUMERIC(12,2) NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'HELD', -- HELD | RELEASED | DEDUCTED
    released_at   TIMESTAMP
);

-- ------------------------------------------------------------
-- MEDIA SERVICE  (owns: photo_sets, photos, damage_reports)
-- ------------------------------------------------------------
CREATE TABLE photo_sets (
    photo_set_id  UUID PRIMARY KEY,
    order_ref     UUID NOT NULL,              -- external: Order Service order_id
    stage         VARCHAR(10) NOT NULL,        -- BEFORE | AFTER
    uploaded_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE photos (
    photo_id      UUID PRIMARY KEY,
    photo_set_id  UUID NOT NULL REFERENCES photo_sets(photo_set_id),
    url           VARCHAR(300) NOT NULL,
    uploaded_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE damage_reports (
    damage_id      UUID PRIMARY KEY,
    order_ref      UUID NOT NULL,             -- external: Order Service order_id
    photo_set_id   UUID NOT NULL REFERENCES photo_sets(photo_set_id),
    damage_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes          TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);
