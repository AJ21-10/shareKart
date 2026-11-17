# 🛒 ShareKart - Complete Setup & Installation Guide

A comprehensive, step-by-step guide to install prerequisites (Node.js, npm, Git), configure environment variables, and run **ShareKart** (Hyperlocal Peer-to-Peer Sharing & Rental Platform) on **Windows**, **macOS**, and **Linux**.

---

## 📑 Table of Contents

1. [Prerequisites Installation (Node.js, npm & Git)](#-prerequisites-installation)
   - [Windows Setup](#1-windows-setup)
   - [macOS Setup](#2-macos-setup)
   - [Linux Setup (Ubuntu / Debian / Fedora / Arch)](#3-linux-setup)
2. [Step 1: Clone the Repository](#step-1-clone-the-repository)
3. [Step 2: Project Structure Overview](#step-2-project-structure-overview)
4. [Step 3: Install Dependencies](#step-3-install-dependencies)
5. [Step 4: Automatic 1-Click Environment Setup (.env)](#step-4-automatic-1-click-environment-setup-env)
6. [Step 5: Database & Image Sync (Supabase)](#step-5-database--image-sync-supabase)
7. [Step 6: Running the Application](#step-6-running-the-application)
8. [Operating System Quick Cheatsheets](#-operating-system-quick-cheatsheets)
   - [Windows (PowerShell)](#windows-powershell-quick-start)
   - [macOS (Terminal)](#macos-terminal-quick-start)
   - [Linux (Bash)](#linux-bash-quick-start)
9. [Default Demo User Logins](#-default-demo-user-logins)
10. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 📦 Prerequisites Installation

Before running ShareKart, you need three core tools on your computer:
1. **Git** (to download and update the project)
2. **Node.js** (v18.x or **v20.x LTS** recommended)
3. **npm** (automatically bundled with Node.js)

---

### 1. Windows Setup

#### Step A: Install Git
1. Download Git installer from [git-scm.com/download/win](https://git-scm.com/download/win).
2. Run the `.exe` installer. Use the default recommended options and complete the installation.

#### Step B: Install Node.js & npm
You can choose either of these methods:

* **Method 1: Official Installer (Recommended)**
  1. Visit the official Node.js website: [nodejs.org](https://nodejs.org/).
  2. Click on the **LTS** version (e.g. `v20.x.x LTS`) to download the Windows `.msi` installer.
  3. Run the installer and check the box to *"Automatically install the necessary tools"* if prompted.
  4. Follow the setup wizard and click **Finish**.

* **Method 2: Via Windows Package Manager (`winget`)**
  Open PowerShell as Administrator and run:
  ```powershell
  winget install OpenJS.NodeJS.LTS
  ```

#### Step C: Verify Installation on Windows
Close any open terminal windows, open a **new** Command Prompt (`cmd`) or **PowerShell**, and run:
```powershell
git --version
node -v
npm -v
```
*(You should see output like `node: v20.x.x` and `npm: 10.x.x`)*.

---

### 2. macOS Setup

#### Step A: Install Homebrew (macOS Package Manager)
If you don't already have Homebrew, open the **Terminal** app and run:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Step B: Install Git and Node.js
Using Homebrew in Terminal:
```bash
brew install git node@20
brew link node@20 --force --overwrite
```
*(Alternative: You can also download the macOS `.pkg` installer directly from [nodejs.org](https://nodejs.org/)).*

#### Step C: Verify Installation on macOS
In your Terminal, run:
```bash
git --version
node -v
npm -v
```

---

### 3. Linux Setup

#### Ubuntu / Debian / Linux Mint:
Open your terminal and run:
```bash
# 1. Update system packages & install curl + git
sudo apt update
sudo apt install -y git curl build-essential

# 2. Add NodeSource Node.js v20 LTS repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 3. Install Node.js (npm is included automatically)
sudo apt install -y nodejs
```

#### Fedora / RHEL / CentOS Stream:
```bash
sudo dnf install -y git curl
sudo dnf module install -y nodejs:20/common
```

#### Arch Linux / Manjaro:
```bash
sudo pacman -Syu --noconfirm git nodejs npm
```

#### Verify Installation on Linux:
```bash
git --version
node -v
npm -v
```

---

## Step 1: Clone the Repository

Open your terminal or command prompt in your preferred working folder (e.g., `Documents` or `Projects`):

```bash
git clone https://github.com/AJ21-10/shareKart.git
cd shareKart
```

---

## Step 2: Project Structure Overview

```text
shareKart/
├── HOW_TO_RUN.md               <-- This setup documentation
├── README.md                   <-- Project overview & documentation
└── ShareKart/
    ├── package.json            <-- Root orchestration scripts (setup:env, dev:server, dev:client)
    ├── scripts/
    │   └── setupEnv.js         <-- 1-Click environment generator
    ├── client/                 <-- React 18 + Vite Frontend (Port 3000)
    │   ├── package.json
    │   ├── .env                <-- Frontend environment
    │   ├── public/
    │   │   └── uploads/        <-- Symlinked media folder
    │   └── src/
    │       ├── data/initialData.js  <-- Local fallback catalog
    │       └── pages/               <-- UI pages (Home, Search, Details, List)
    └── server/                 <-- Node.js / Express REST API (Port 5000)
        ├── package.json
        ├── .env                <-- Backend environment (Supabase & DB credentials)
        ├── uploads/            <-- Uploaded product images
        ├── database/           <-- schema.sql & seed.sql
        └── src/
            ├── services/storageService.js  <-- Supabase Cloud Storage engine
            └── utils/syncImagesToSupabase.js
```

Navigate into the application folder:
```bash
cd ShareKart
```

---

## Step 3: Install Dependencies

You need to install dependencies for the root, frontend client, and backend server.

### For Linux / macOS / Windows Git Bash:
```bash
# 1. Install root dependencies
npm install

# 2. Install client dependencies
cd client && npm install

# 3. Install server dependencies
cd ../server && npm install

# 4. Return to ShareKart directory
cd ..
```

### For Windows PowerShell:
```powershell
npm install
cd client; npm install; cd ..
cd server; npm install; cd ..
```

---

## Step 4: Automatic 1-Click Environment Setup (.env)

> 💡 **No Manual Copy-Pasting Required!**
> You do **not** need to manually download or copy keys from Google Drive or dashboard anymore.

From the `ShareKart/` root folder, run:

```bash
npm run setup:env
```

**What this does automatically:**
- Generates `ShareKart/server/.env` with the PostgreSQL / Supabase cloud database credentials, JWT secret, Phone Auth keys, and Cloud Storage bucket configuration.
- Generates `ShareKart/client/.env` with frontend API proxies and Supabase public client keys.

You will see:
```text
⚡ Setting up ShareKart Environment Files (.env)...
✅ Server .env generated at: .../ShareKart/server/.env
✅ Client .env generated at: .../ShareKart/client/.env
🎉 Done! Server and Client are now 100% configured with Supabase.
```

---

## Step 5: Database & Image Sync (Supabase)

ShareKart is connected to a live cloud Supabase database and storage bucket.

### 1. Database Schema & Mock Seed (Optional)
If you are connecting to a fresh database or want to re-seed demo data:
```bash
# From ShareKart/ folder:
npm run seed
```

### 2. Syncing Product Images to Cloud Storage
If you have local product images in `server/uploads/` and want to ensure they are synchronized with the Supabase Cloud Storage bucket (`product-images`):
```bash
cd server
npm run sync:images
cd ..
```

---

## Step 6: Running the Application

To run the complete application, you need **two terminal tabs/windows**:
- **Terminal 1**: Backend REST API (`http://localhost:5000`)
- **Terminal 2**: Frontend Client (`http://localhost:3000`)

---

### Terminal 1: Start Backend Server (Port 5000)

Navigate to `ShareKart/` and run:

```bash
npm run dev:server
```
*(Or navigate to `cd server && npm run dev`)*

You should see:
```text
ShareKart server running on port 5000
[Database] ✅ PostgreSQL Connected: "postgres"
```

---

### Terminal 2: Start Frontend Client (Port 3000)

Open a **second terminal tab/window**, navigate to `ShareKart/`, and run:

```bash
npm run dev:client
```
*(Or navigate to `cd client && npm run dev`)*

You should see:
```text
  VITE v5.4.11  ready in 240 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Now open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 💻 Operating System Quick Cheatsheets

### Windows (PowerShell) Quick Start

Copy and paste these commands into PowerShell:

```powershell
# 1. Clone & enter project
git clone https://github.com/AJ21-10/shareKart.git
cd shareKart/ShareKart

# 2. Install all dependencies
npm install
cd client; npm install; cd ..
cd server; npm install; cd ..

# 3. Generate .env files automatically
npm run setup:env

# 4. Launch Backend in a separate window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD/server'; npm run dev"

# 5. Launch Frontend in this window
cd client
npm run dev
```

---

### macOS (Terminal) Quick Start

Copy and paste these commands into Terminal:

```bash
# 1. Clone & enter project
git clone https://github.com/AJ21-10/shareKart.git
cd shareKart/ShareKart

# 2. Install all dependencies
npm install
(cd client && npm install)
(cd server && npm install)

# 3. Generate .env files automatically
npm run setup:env

# 4. Launch Backend in background
(cd server && npm run dev) &

# 5. Launch Frontend
cd client && npm run dev
```

---

### Linux (Bash) Quick Start

Copy and paste these commands into Linux Terminal:

```bash
# 1. Clone & enter project
git clone https://github.com/AJ21-10/shareKart.git
cd shareKart/ShareKart

# 2. Install all dependencies
npm install
(cd client && npm install)
(cd server && npm install)

# 3. Generate .env files automatically
npm run setup:env

# 4. Launch Backend in background
(cd server && npm run dev) &

# 5. Launch Frontend
cd client && npm run dev
```

---

## 👥 Default Demo User Logins

When testing login, authentication, and rental escrow features, use these pre-seeded accounts:

| Role / Name      | Email                 | Password      | Details                                    |
| ---------------- | --------------------- | ------------- | ------------------------------------------ |
| **Aarav Patel**  | `aarav@sharekart.in`  | `password123` | Aadhaar Verified Host (Laptops, MacBooks)  |
| **Vikram Joshi** | `vikram@sharekart.in` | `password123` | Aadhaar Verified Host (Air Fryers, Drones) |
| **Kavya Patel**  | `kavya@sharekart.in`  | `password123` | Verified Renter (Hostel Student)           |
| **Ramesh Kumar** | `ramesh@sharekart.in` | `password123` | Verified Citizen (Tools & Machinery)       |

---

## 🛠 Troubleshooting & FAQs

### 1. Port 3000 or 5000 Already In Use (`EADDRINUSE`)
If port 5000 or 3000 is occupied by another process:

* **On Windows (PowerShell)**:
  ```powershell
  # Find PID using port 5000 or 3000
  netstat -ano | findstr :5000
  # Kill process by PID
  taskkill /PID <PID_NUMBER> /F
  ```
* **On macOS / Linux**:
  ```bash
  lsof -ti:5000 | xargs kill -9 2>/dev/null
  lsof -ti:3000 | xargs kill -9 2>/dev/null
  ```

---

### 2. Images Not Loading or Broken Icons
- Run `npm run setup:env` in the `ShareKart/` directory to ensure `SUPABASE_STORAGE_BUCKET=product-images` is set.
- Make sure **both** Backend (`npm run dev:server`) and Frontend (`npm run dev:client`) are running simultaneously.
- If you have missing local images, run `cd server && npm run sync:images` to sync existing images to your Supabase Cloud Storage.

---

### 3. Windows PowerShell Script Execution Disabled
If you see the error:
`File ... cannot be loaded because running scripts is disabled on this system`

Run this command in PowerShell to allow script execution:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

---

### 4. Node Version Warning
ShareKart runs best on **Node.js v18.x or v20.x LTS**. If you have an older version:
- Check your current version: `node -v`
- Upgrade Node.js using [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows) (Windows):
  ```bash
  nvm install 20
  nvm use 20
  ```

---

## 🤝 Need Help?
- **GitHub Repository**: [https://github.com/AJ21-10/shareKart](https://github.com/AJ21-10/shareKart)
- Feel free to open an Issue or ask the maintainers for assistance.
