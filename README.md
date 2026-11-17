# 🛒 ShareKart

> **Hyperlocal Peer-to-Peer Sharing & Rental Marketplace**

ShareKart is a community-driven full-stack marketplace connecting people who want to share, rent, or sell pre-owned and unused items with nearby neighbors. It makes high-value products more accessible, encourages sustainable reuse, and simplifies local exchange through a trust-first platform backed by Aadhaar e-KYC identity verification, digital escrow, and cloud-hosted media storage.

---

## 📑 Table of Contents

- [About the Project](#about-the-project)
- [Team Members](#team-members)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Architecture & Directory Structure](#project-architecture--directory-structure)
- [Quick Start Guide (Fast Track)](#quick-start-guide-fast-track)
- [Detailed Setup & Execution](#detailed-setup--execution)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. 1-Click Environment Setup](#3-1-click-environment-setup-env)
  - [4. Database & Image Sync](#4-database--image-sync)
  - [5. Run Backend & Frontend](#5-run-backend--frontend)
- [Cloud Storage & Media Handling](#cloud-storage--media-handling)
- [Default Demo User Logins](#default-demo-user-logins)
- [REST API Reference](#rest-api-reference)
- [Current Scope & Limitations](#current-scope--limitations)
- [License](#license)

---

## About the Project

Many households own expensive items that sit idle for months (power drills, DSLR cameras, laptops, camping gear, air fryers), while nearby students and families struggle to afford them. ShareKart bridges this gap by enabling hyperlocal rental and purchase transactions.

### Target Personas:
- **Renters & Borrowers** — College students, freelancers, and families who need tools or electronics temporarily without paying full retail prices.
- **Owners & Sellers** — Neighbors who want to monetize idle assets safely through verified rental agreements and refundable security deposits.
- **Buyers** — Budget-conscious buyers looking for quality-inspected, pre-owned products within their neighborhood.

---

## Team Members

| S. No. | Team Member Name | Roll Number | Role |
| :---: | :--- | :---: | :--- |
| 1 | **Anurag Panda** (TL) | `20251651026` | Team Lead & Full-Stack Development |
| 2 | **Pushpender** | `20251651074` | Full-Stack & System Integration |
| 3 | **Dinesh** | `20251651035` | Backend & Database Architecture |
| 4 | **Rohit** | `20251651079` | Frontend & UI/UX |
| 5 | **Taj Ansari** | `20251651095` | Testing & Cloud Infrastructure |

---

## Key Features

### 🔐 1. Authentication & Trust Ecosystem
- Email & password authentication with secure bcrypt password hashing.
- Phone.Email OTP-based verification for instant phone sign-in.
- JWT-based stateless session management with automated header interception.
- **UIDAI Aadhaar e-KYC verification** with cryptographic XML document validation — mandatory for creating listings and initiating handovers.

### 📦 2. Hyperlocal Marketplace
- Real-time catalog powered by **Supabase PostgreSQL** cloud database.
- Offline fallback catalog (`initialData.js`) ensuring seamless UI operation even without backend connectivity.
- Geo-distance calculation with radius filtering (GPS browser location, Nominatim reverse geocoding, and IP fallback).
- Multi-criteria search and filter by category, transaction type (`rent`, `buy`, `both`), condition, and price.

### 🤝 3. Rental Workflow & Escrow Safety
- **Quick Rent modal** for 1-click booking from cards.
- Multi-day rental duration calculator with dynamic security deposit handling.
- **Digital Handover Pass** for identity verification during in-person pickup.
- **Return Handover Page** with physical condition checklist and automated UPI security deposit refund flow.
- Built-in transaction dispute resolution with claim mediation.

### ☁️ 4. Cloud Media & Image Storage
- Integrated **Supabase Cloud Storage** (`product-images` bucket).
- Images uploaded by any host on any device receive universal public CDN URLs.
- Seamless automatic fallback: if an image is missing, the UI gracefully renders a clean "No Photo" state instead of arbitrary stock images.

### 💬 5. Communication & Dashboard
- In-app buyer-owner chat scoped per product listing.
- Host dashboard with live inventory, active rental contracts, pending handover requests, and UPI payout tracking.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Material Symbols (Google Icons) |
| **Backend** | Node.js (v18 / v20 LTS), Express 4 |
| **Database** | PostgreSQL, Supabase Cloud Database (`pg` pooler) |
| **Cloud Storage** | Supabase Storage (`product-images` public bucket) |
| **Authentication** | JWT (`jsonwebtoken`), bcrypt (`bcryptjs`), Phone.Email OTP SDK |
| **Identity / KYC** | Aadhaar XML parser (`fast-xml-parser`, `xml-crypto`, `@xmldom/xmldom`) |
| **Tooling & Scripts** | `setupEnv.js` (1-click .env builder), `syncImagesToSupabase.js` |

---

## Project Architecture & Directory Structure

```text
shareKart/
├── HOW_TO_RUN.md               # OS-specific installation & setup guide
├── README.md                   # Project overview and reference
├── schema.sql                  # Database schema definition
├── schema.png / .pdf           # Entity-Relationship diagram
├── services.png / .pdf         # System architecture diagram
└── ShareKart/
    ├── package.json            # Root workspace scripts
    ├── scripts/
    │   └── setupEnv.js         # Automated 1-click .env file generator
    ├── client/                 # React 18 + Vite Frontend (Port 3000)
    │   ├── vite.config.js      # Dev server with /api & /uploads proxy to :5000
    │   ├── tailwind.config.js  # Design system & token configuration
    │   ├── public/
    │   │   └── uploads/        # Local media symlink
    │   └── src/
    │       ├── App.jsx         # Client router & navigation state
    │       ├── components/     # Navbar, ProductCard, Modals, Footers
    │       ├── context/        # Auth, Cart, and Marketplace contexts
    │       ├── pages/          # 15+ comprehensive full-stack pages
    │       ├── services/       # api.js, locationService.js
    │       └── data/
    │           └── initialData.js  # Built-in offline catalog
    └── server/                 # Express REST API (Port 5000)
        ├── src/
        │   ├── index.js        # Server bootstrapper & middleware
        │   ├── config/db.js    # PostgreSQL connection pool
        │   ├── routes/         # Modular API route controllers
        │   ├── controllers/    # Business logic & request handlers
        │   ├── services/
        │   │   ├── storageService.js  # Supabase cloud storage & CDN resolver
        │   │   └── identity/          # Aadhaar eKYC verification
        │   └── utils/
        │       └── syncImagesToSupabase.js  # Cloud storage bulk sync script
        ├── database/           # schema.sql & seed.sql
        └── uploads/            # Local product images folder
```

---

## Quick Start Guide (Fast Track)

For experienced developers who already have **Node.js (v18+)** and **Git** installed:

```bash
# 1. Clone repository
git clone https://github.com/AJ21-10/shareKart.git
cd shareKart/ShareKart

# 2. Install dependencies across all workspaces
npm install
(cd client && npm install)
(cd server && npm install)

# 3. 1-Click Environment Setup (Generates both .env files)
npm run setup:env

# 4. Start Backend Server (Terminal 1 - Port 5000)
npm run dev:server

# 5. Start Frontend Client (Terminal 2 - Port 3000)
npm run dev:client
```
👉 Open **http://localhost:3000** in your web browser.

---

## Detailed Setup & Execution

For detailed platform-specific prerequisites (Windows, macOS, and Linux setup for Node.js, npm, and troubleshooting), please refer to the dedicated guide:  
📖 **[HOW_TO_RUN.md](HOW_TO_RUN.md)**.

### 1. Clone Repository
```bash
git clone https://github.com/AJ21-10/shareKart.git
cd shareKart/ShareKart
```

### 2. Install Dependencies
```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 3. 1-Click Environment Setup (.env)
You do **not** need to manually copy credentials or download files from external drives. From `ShareKart/`:
```bash
npm run setup:env
```
This automatically produces:
- `ShareKart/server/.env` (Database pooler, JWT secret, Phone.Email credentials, Supabase URL & Service Role keys)
- `ShareKart/client/.env` (Vite dev proxies & Supabase public anon keys)

### 4. Database & Image Sync
To synchronize pre-existing uploaded product media with the Supabase Cloud Storage bucket:
```bash
cd server && npm run sync:images && cd ..
```
*(Optional: Run `npm run seed` if setting up a fresh database).*

### 5. Run Backend & Frontend

Open **two terminal windows**:

**Terminal 1 — Backend API Server:**
```bash
npm run dev:server
```
Expected output:
```text
ShareKart server running on port 5000
[Database] ✅ PostgreSQL Connected: "postgres"
```

**Terminal 2 — Frontend Application:**
```bash
npm run dev:client
```
Expected output:
```text
  VITE v5.4.11  ready in ~240 ms
  ➜  Local:   http://localhost:3000/
```

---

## Cloud Storage & Media Handling

ShareKart uses **Supabase Cloud Storage** for production-grade media persistence:
- When a host lists an item on their device, the photo is uploaded directly to the `product-images` bucket on Supabase Cloud.
- A permanent public HTTPS CDN link is generated and saved in PostgreSQL.
- **Universal Visibility**: Any user on any computer or mobile device can view the photo without needing local folder transfers.
- **Clean UI Guarantee**: If an item does not have an uploaded photo, the app displays a clean, dedicated "No Photo" badge rather than substituting arbitrary or irrelevant stock imagery.

---

## Default Demo User Logins

Pre-seeded test accounts for evaluating identity, rental workflows, and dashboards:

| Name | Email | Password | Role / Account Type |
| :--- | :--- | :--- | :--- |
| **Aarav Patel** | `aarav@sharekart.in` | `password123` | Aadhaar Verified Host (Laptops, MacBooks) |
| **Vikram Joshi** | `vikram@sharekart.in` | `password123` | Aadhaar Verified Host (Air Fryers, Drones) |
| **Kavya Patel** | `kavya@sharekart.in` | `password123` | Verified Renter (Hostel Student) |
| **Ramesh Kumar** | `ramesh@sharekart.in` | `password123` | Verified Citizen (Power Tools) |

---

## REST API Reference

The backend REST API is hosted at `http://localhost:5000/api`.

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Health check and server status |
| `/api/auth/register` | `POST` | Create a new user account |
| `/api/auth/login` | `POST` | Authenticate with email/password and obtain JWT |
| `/api/auth/me` | `GET` | Get current authenticated user profile |
| `/api/products` | `GET` | Filter, search, and list products by distance & price |
| `/api/products` | `POST` | Publish a new product listing (Aadhaar KYC required) |
| `/api/products/:id` | `GET` | Fetch comprehensive product details and reviews |
| `/api/categories` | `GET` | Retrieve list of active marketplace categories |
| `/api/rentals/checkout` | `POST` | Reserve an item and create escrow transaction |
| `/api/dashboard/stats` | `GET` | Retrieve owner metrics, inventory, and payouts |
| `/api/messages` | `GET / POST` | Retrieve and send peer-to-peer messages |
| `/api/disputes` | `POST` | File a transaction dispute |

---

## Current Scope & Limitations

- **Payment Gateway Simulation**: Order checkout simulates card, UPI, and net-banking transactions; actual payment processing gateways (Razorpay/Stripe) are not attached.
- **Aadhaar e-KYC**: Real UIDAI OTP verification requires government-licensed ASA/KUA infrastructure. The platform provides a complete cryptographic XML document verification workflow with offline demo support.
- **Polling Messaging**: Communication utilizes REST polling intervals.

---

## License

This project is licensed under the **ISC License** as declared in [`ShareKart/package.json`](ShareKart/package.json).
