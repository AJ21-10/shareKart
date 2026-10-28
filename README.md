# ShareKart

> **Hyperlocal Peer-to-Peer Sharing & Rental Marketplace**

ShareKart is a community-based marketplace that connects people who want to share, rent, or sell pre-owned and unused items with people nearby. It makes useful products more affordable, encourages reuse, and simplifies local exchange through a trust-first platform backed by Aadhaar e-KYC identity verification.

---

## About the Project

Many households own items that sit unused for months, while nearby neighbours struggle to afford the same things. ShareKart bridges that gap by enabling people to list items for rent or sale locally and discover what others around them have available.

**Who uses ShareKart:**

- **Buyers** — People looking for affordable pre-owned products to purchase outright.
- **Renters / Borrowers** — People who need something temporarily (a drill, a camera, a laptop) and prefer renting over buying.
- **Owners / Sellers** — People who want to earn from unused items by renting them out or selling them.

---

## Team Members

| S. No. | Team Member Name | Roll Number |
| ------ | ---------------- | ----------- |
| 1      | Anurag Panda(TL) | 20251651026 |
| 2      | Pushpender       | 20251651074 |
| 3      | Dinesh           | 20251651035 |
| 4      | Rohit            | 20251651079 |
| 5      | Taj Ansari       | 20251651095 |

---

## Key Features

### Authentication & Identity

- User registration with email/password and OTP-based phone verification.
- Phone.Email "Sign in with Phone" integration.
- JWT-based session management stored in `localStorage`.
- **Aadhaar e-KYC verification** — cryptographically validated identity documents required before listing or transacting. Listing and checkout are gated behind verified status.

### Product Marketplace

- Browse a product catalog combining live backend listings and a built-in offline catalog (`initialData.js`). The frontend works even when the backend is unreachable.
- Search and filter products by category, transaction type (rent / buy / both), price, and location.
- Detailed product pages with pricing, availability, owner trust profile, and rental terms.
- List new items for rent or sale via a guided listing form (Aadhaar verification required).

### Rental & Purchase Workflow

- Quick Rent modal for initiating a rental request directly from a product card.
- Full checkout flow supporting rent (with date range) and buy orders.
- Rental cost calculator (daily rate × days, delivery fee if applicable).
- Payment method selection: UPI, card, or net banking (UI flow; actual payment gateway not integrated).
- Escrow status tracking: `held_in_escrow → released_to_seller / deposit_refunded / disputed`.

### Handover & Return

- **Rental Handover Pass** — a digital confirmation pass generated at item pickup.
- **Return Handover Page** — guides the return process, including a condition checklist and UPI-based security deposit refund flow.

### Messaging

- In-app chat between a buyer/renter and an owner, scoped per product.
- Full-page Chat inbox (`/chat`).

### Dispute Mediation

- Users can file a dispute against a transaction specifying an issue type (`damage`, `delay`, `missing_item`) and a claim amount.
- Disputes can be resolved by updating the escrow action (`release_escrow`, `settle_claim`).

### Dashboard (Owner View)

- Inventory tab: owner's active listings and their status.
- Contracts tab: active and past rental agreements.
- Payouts tab: earnings summary with UPI withdrawal request.
- Pending rental requests with approve / reject actions.

### Trust & Profiles

- Public Trust Profile page per user showing their verification badge, reviews, and listed items.
- Private profile page for editing name, location, bio, and password.

### Location

- Multi-tier location detection: browser GPS → OpenStreetMap Nominatim reverse geocoding → IP-based geolocation fallback (ipwho.is / ipapi.co).

---

## Technology Stack

| Layer                 | Technology                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------- |
| Frontend              | React 18, Vite 5                                                                            |
| Styling               | Tailwind CSS 3, Material Symbols (Google Icons)                                             |
| Backend               | Node.js, Express 4                                                                          |
| Database              | PostgreSQL (via `pg` driver); Supabase cloud option supported                               |
| Authentication        | JWT (`jsonwebtoken`), bcrypt (`bcryptjs`), Phone.Email OTP                                  |
| Identity Verification | Aadhaar e-KYC with XML document parsing (`fast-xml-parser`, `xml-crypto`, `@xmldom/xmldom`) |
| API                   | RESTful JSON API                                                                            |
| Dev tooling           | Vite dev server with API proxy, `node --watch` for backend hot-reload                       |

---

## Project Structure

```text
shareKart/
├── HOW_RUN.md              # Detailed OS-specific setup guide
├── schema.sql              # High-level database schema sketch
├── schema.png / .pdf       # Entity-relationship diagram
├── services.png / .pdf     # Microservice architecture diagram
└── ShareKart/              # Application source code
    ├── package.json        # Root scripts (dev:server, dev:client, seed, test)
    ├── client/             # React + Vite frontend
    │   ├── vite.config.js  # Dev server (port 3000) with /api proxy to :5000
    │   ├── tailwind.config.js
    │   ├── .env.example    # Frontend environment variable template
    │   └── src/
    │       ├── App.jsx             # Client-side router & global layout
    │       ├── pages/              # One file per page (15 pages)
    │       ├── components/         # Reusable UI components & modals
    │       ├── context/            # AuthContext, CartContext, MarketplaceContext
    │       ├── services/           # api.js (REST calls), locationService.js
    │       └── data/
    │           └── initialData.js  # Offline product catalog (fallback)
    └── server/             # Node.js + Express REST API
        ├── package.json
        ├── src/
        │   ├── index.js        # Server entry point (port 5000)
        │   ├── routes/         # authRoutes, productRoutes, rentalRoutes,
        │   │                   # categoryRoutes, dashboardRoutes,
        │   │                   # messageRoutes, disputeRoutes,
        │   │                   # identityVerificationRoutes
        │   ├── controllers/    # Business logic per route group
        │   ├── middleware/     # JWT auth, request validation, error handler
        │   ├── config/
        │   │   └── db.js       # PostgreSQL pool (DATABASE_URL or PGHOST/etc.)
        │   ├── services/       # Identity verification service
        │   └── seeds/          # Seed script (seedData.js)
        ├── database/
        │   ├── schema.sql      # Full PostgreSQL table definitions
        │   └── seed.sql        # Demo data (users, products, rentals)
        └── uploads/            # Uploaded product images (served statically)
```

---

## Prerequisites

- **Node.js** v18 or v20 LTS
- **npm** (bundled with Node.js)
- **PostgreSQL** — local instance **or** a Supabase project (connection string supported)
- **Git**

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/AJ21-10/shareKart.git
cd shareKart/ShareKart
```

### 2. Install dependencies

```bash
# From the ShareKart/ directory:
npm install              # root dev dependencies

cd client && npm install # frontend dependencies
cd ../server && npm install # backend dependencies
cd ..
```

### 3. Configure environment variables

The project requires `.env` files in both `client/` and `server/`. Download the pre-configured `.env` files from the shared Drive link in [`HOW_RUN.md`](HOW_RUN.md) and place them at:

- `ShareKart/client/.env`
- `ShareKart/server/.env`

See the [Environment Variables](#environment-variables) section below for required keys.

### 4. Set up the database

Run the seed script to create tables and load demo data into PostgreSQL:

```bash
# From ShareKart/ root:
npm run seed
```

### 5. Start the application

Open **two terminal windows** from the `ShareKart/` directory.

**Terminal 1 — Backend (port 5000):**

```bash
npm run dev:server
```

Expected output:

```
Sharekart Backend REST API running on http://localhost:5000
[Database] ✅ PostgreSQL Connected: "sharekart_db"
```

**Terminal 2 — Frontend (port 3000):**

```bash
npm run dev:client
```

Expected output:

```
  VITE v5.4.11  ready in ~240 ms

  ➜  Local:   http://localhost:3000/
```

### 6. Open the application

Visit **http://localhost:3000** in your browser.

> **Tip:** The frontend has an offline fallback catalog. If you only need to work on the UI, you can run `cd client && npm run dev` without starting the backend at all.

---

## Environment Variables

### Client — `ShareKart/client/.env`

| Variable                     | Purpose                                            | Example                    |
| ---------------------------- | -------------------------------------------------- | -------------------------- |
| `VITE_API_BASE_URL`          | Backend API base path (uses Vite proxy by default) | `/api`                     |
| `VITE_PHONE_EMAIL_CLIENT_ID` | Phone.Email client ID for OTP sign-in              | `your_client_id`           |
| `VITE_SUPABASE_URL`          | Supabase project URL (public)                      | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY`     | Supabase anonymous key (public)                    | `eyJ...`                   |

### Server — `ShareKart/server/.env`

| Variable       | Purpose                                                          | Example                          |
| -------------- | ---------------------------------------------------------------- | -------------------------------- |
| `PORT`         | Express server port                                              | `5000`                           |
| `DATABASE_URL` | Full PostgreSQL connection string (overrides individual PG vars) | `postgresql://user:pass@host/db` |
| `PGHOST`       | PostgreSQL host                                                  | `localhost`                      |
| `PGPORT`       | PostgreSQL port                                                  | `5432`                           |
| `PGDATABASE`   | Database name                                                    | `sharekart_db`                   |
| `PGUSER`       | PostgreSQL username                                              | `postgres`                       |
| `PGPASSWORD`   | PostgreSQL password                                              | _(keep secret)_                  |
| `PGSSL`        | Set to `true` to enable SSL (required for Supabase)              | `true`                           |
| `JWT_SECRET`   | Secret key for signing JWTs                                      | _(keep secret)_                  |

> ⚠️ Never commit `.env` files containing real credentials to version control.

---

## How to Use ShareKart

1. **Open** `http://localhost:3000` in your browser.
2. **Browse** the homepage to see available items for rent and sale.
3. **Search** for specific items by name, category, or transaction type.
4. **Register or log in.** You can use the demo accounts below for testing.
5. **Complete Aadhaar e-KYC** (required to list items or proceed to checkout).
6. **Rent or buy** an item — select dates, review the cost breakdown, and confirm the order.
7. **Manage your listings** from the Dashboard (inventory, contracts, payouts).
8. **Chat** with the item owner using the in-app messaging system.
9. **Handle handovers** using the digital Handover Pass and Return Handover pages.
10. **File a dispute** if there is an issue with a transaction.

### Demo Accounts (pre-seeded)

| Name         | Email                 | Password      | Role                                        |
| ------------ | --------------------- | ------------- | ------------------------------------------- |
| Aarav Patel  | `aarav@sharekart.in`  | `password123` | Aadhaar-verified owner (Laptops, MacBooks)  |
| Vikram Joshi | `vikram@sharekart.in` | `password123` | Aadhaar-verified owner (Air Fryers, Drones) |
| Kavya Patel  | `kavya@sharekart.in`  | `password123` | Verified renter (hostel student)            |
| Ramesh Kumar | `ramesh@sharekart.in` | `password123` | Verified citizen (Tools & Machinery)        |

---

## API Documentation

The backend exposes a RESTful JSON API at `http://localhost:5000/api`.

| Route prefix                 | Description                                         |
| ---------------------------- | --------------------------------------------------- |
| `GET /api/health`            | Server health check                                 |
| `/api/auth`                  | Register, login, OTP, Aadhaar verification, profile |
| `/api/products`              | List, search, create, and update product listings   |
| `/api/categories`            | Product categories                                  |
| `/api/rentals`               | Checkout, rental management, escrow, return         |
| `/api/dashboard`             | Owner stats, inventory, contracts, payouts          |
| `/api/messages`              | In-app messaging between users                      |
| `/api/disputes`              | File and resolve transaction disputes               |
| `/api/identity-verification` | Aadhaar e-KYC session management                    |

Protected routes require an `Authorization: Bearer <token>` header.

---

## Current Limitations

- **Payment gateway not integrated.** The checkout flow collects payment method selection (UPI, card, net banking), but no real payment processing occurs.
- **Aadhaar OTP verification** relies on a backend identity service that must be configured separately; the e-KYC flow is implemented but depends on external credential setup.
- **Real-time messaging** uses REST polling, not WebSockets. Messages are not pushed live without a page refresh.
- **No admin panel** is implemented in the current codebase.

---

## Contributing

1. Fork the repository and create a feature branch.
2. Keep commits focused and descriptive.
3. Run `npm test` (from `ShareKart/`) to execute the backend test suite before submitting.
4. Open a pull request with a clear description of your change.
5. Report bugs by opening a GitHub Issue at [github.com/AJ21-10/shareKart](https://github.com/AJ21-10/shareKart/issues).

---

## License

This project is licensed under the **ISC License** as declared in [`ShareKart/package.json`](ShareKart/package.json).
