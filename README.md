# 🛒 ShareKart - Setup & Getting Started Guide

A complete step-by-step guide to clone, configure, and run **ShareKart** (Hyperlocal Peer-to-Peer Sharing & Rental Platform) on **Windows**, **macOS**, and **Linux**.

---

## 📑 Table of Contents

1. [Project Overview & Architecture](#-project-overview--architecture)
2. [Prerequisites (What you need)](#-prerequisites-what-you-need)
   - [Windows Installation](#windows-setup)
   - [macOS Installation](#macos-setup)
   - [Linux Installation](#linux-setup)
3. [Step 1: Clone the Repository](#step-1-clone-the-repository)
4. [Step 2: Project Structure](#step-2-project-structure)
5. [Step 3: Install Dependencies](#step-3-install-dependencies)
6. [Step 4: Environment Variables Setup (.env)](#step-4-environment-variables-setup-env)
7. [Step 5: Database Setup & Seeding](#step-5-database-setup--seeding)
8. [Step 6: Running the Application](#step-6-running-the-application)
9. [Operating System Cheatsheets](#-operating-system-cheatsheets)
   - [Windows (PowerShell)](#windows-powershell-one-shot)
   - [macOS (Terminal)](#macos-terminal-one-shot)
   - [Linux (Bash)](#linux-bash-one-shot)
10. [Default Demo User Logins](#-default-demo-user-logins)
11. [Troubleshooting & Common Issues](#-troubleshooting--common-issues)

---

## 🏗 Project Overview & Architecture

ShareKart has a clean modular full-stack architecture:

- **Frontend (`/ShareKart/client`)**: React 18, Vite, TailwindCSS, Material Symbols.
  - Default URL: `http://localhost:3000`
- **Backend API (`/ShareKart/server`)**: Node.js, Express, JWT Authentication, RESTful APIs.
  - Default URL: `http://localhost:5000`
- **Database (`/ShareKart/server/database`)**: PostgreSQL / Supabase cloud database with schema and mock seed.
- **Data Catalog (`/ShareKart/client/src/data/initialData.js`)**: Built-in rich offline catalog (Air fryers, MacBooks, Sony cameras, Bosch drills, etc.) that works even without backend!

---

## 📦 Prerequisites (What you need)

Before running the project, make sure you have:

1. **Git** (to clone the repo)
2. **Node.js** (v18.x or v20.x LTS recommended)
3. **npm** (bundled automatically with Node.js)

### Windows Setup

1. **Install Git**: Download and run installer from [git-scm.com/download/win](https://git-scm.com/download/win).
2. **Install Node.js**: Download and install **LTS version** from [nodejs.org](https://nodejs.org/).
3. Verify in Command Prompt (`cmd`) or PowerShell:
   ```powershell
   git --version
   node -v
   npm -v
   ```

### macOS Setup

1. Open Terminal and install [Homebrew](https://brew.sh) (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. Install Git and Node.js:
   ```bash
   brew install git node@20
   ```
3. Verify in Terminal:
   ```bash
   git --version
   node -v
   npm -v
   ```

### Linux Setup (Ubuntu / Debian)

1. Open terminal and run:

   ```bash
   sudo apt update
   sudo apt install -y git curl

   # Install Node.js v20 LTS via NodeSource
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

2. Verify in Terminal:
   ```bash
   git --version
   node -v
   npm -v
   ```

---

## Step 1: Clone the Repository

Open your terminal or command prompt in the folder where you want to keep the project (e.g., `Desktop` or `Projects`):

```bash
git clone https://github.com/AJ21-10/shareKart.git
cd shareKart
```

---

## Step 2: Project Structure

The project code is organized inside the `ShareKart/` folder:

```text
shareKart/
├── README.md               <-- Setup documentation
└── ShareKart/
    ├── package.json        <-- Root project scripts
    ├── client/             <-- React + Vite Frontend
    │   ├── package.json
    │   ├── .env.example
    │   ├── .env
    │   └── src/
    │       ├── data/initialData.js  <-- Local product catalog
    │       ├── context/             <-- Auth, Cart & Marketplace State
    │       └── pages/               <-- UI pages (Home, Search, Details)
    └── server/             <-- Express.js REST API
        ├── package.json
        ├── .env
        ├── database/       <-- schema.sql & seed.sql
        └── src/
```

Navigate into the `ShareKart` folder:

```bash
cd ShareKart
```

---

## Step 3: Install Dependencies

You need to install dependencies for both the **root**, **server**, and **client**.

### Quick method (from `ShareKart/` root):

#### On Linux / macOS / Windows Git Bash:

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

#### On Windows PowerShell:

```powershell
# 1. Install root dependencies
npm install

# 2. Install client dependencies
cd client; npm install; cd ..

# 3. Install server dependencies
cd server; npm install; cd ..
```

---

## Step 4: Environment Variables Setup (.env)

   Download the file from the given drive link and place it in the given location

#### Drive Link : [ENV] (`https://drive.google.com/drive/folders/1O25Jhng4iIplMe1Hz4rDobqFoA0UV0GB?usp=sharing`)

### 1. Server Environment (`ShareKart/server/.env`)

Create or verify the `.env` file in `ShareKart/server/.env`:

### 2. Client Environment (`ShareKart/client/.env`)

Create or verify the `.env` file in `ShareKart/client/.env`:

---

## Step 5: Database Setup & Seeding

> **Note**: ShareKart has a rich offline fallback catalog in `initialData.js`. Even if the database is offline, the frontend will work 100% fine!

If you want to run the database migration and seed data into PostgreSQL / Supabase:

From `ShareKart/` root:

```bash
npm run seed
```

Or from `ShareKart/server/`:

```bash
cd server
npm run seed
```

This executes `schema.sql` and `seed.sql`, creating tables for users, products, categories, rentals, disputes, and reviews.

---

## Step 6: Running the Application

You need **two terminal tabs/windows**: one for the Backend Server and one for the Frontend Client.

### Terminal 1: Backend Server (Port 5000)

From `ShareKart/` directory:

```bash
npm run dev:server
```

_(Or `cd server && npm run dev`)_

You will see:

```text
ShareKart server running on port 5000
Database connected successfully
```

---

### Terminal 2: Frontend Client (Port 3000)

Open a **new terminal tab/window**, navigate to `ShareKart/`:

```bash
npm run dev:client
```

_(Or `cd client && npm run dev`)_

You will see:

```text
  VITE v5.4.11  ready in 240 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

Now open your web browser and go to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 💻 Operating System Cheatsheets

### Windows (PowerShell) One-Shot

Run these commands in Windows PowerShell:

```powershell
# 1. Clone repository
git clone https://github.com/AJ21-10/shareKart.git
cd shareKart/ShareKart

# 2. Install all packages
npm install
cd client; npm install; cd ..
cd server; npm install; cd ..

# 3. Start Backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD/server'; npm run dev"

# 4. Start Frontend in current window
cd client
npm run dev
```

### macOS (Terminal) One-Shot

Run these commands in macOS Terminal:

```bash
# 1. Clone repository
git clone https://github.com/AJ21-10/shareKart.git
cd shareKart/ShareKart

# 2. Install all packages
npm install
(cd client && npm install)
(cd server && npm install)

# 3. Start Backend in background or separate tab
cd server && npm run dev &

# 4. Start Frontend
cd ../client && npm run dev
```

### Linux (Bash) One-Shot

Run these commands in Linux Terminal:

```bash
# 1. Clone repository
git clone https://github.com/AJ21-10/shareKart.git
cd shareKart/ShareKart

# 2. Install all packages
npm install
(cd client && npm install)
(cd server && npm install)

# 3. Start Backend in background or separate terminal
(cd server && npm run dev) &

# 4. Start Frontend
cd client && npm run dev
```

---

## 👥 Default Demo User Logins

When testing login, authentication, and rental escrow features, you can use these pre-seeded accounts:

| Role / Name      | Email                 | Password      | Details                                    |
| ---------------- | --------------------- | ------------- | ------------------------------------------ |
| **Aarav Patel**  | `aarav@sharekart.in`  | `password123` | Aadhaar Verified Host (Laptops, MacBooks)  |
| **Vikram Joshi** | `vikram@sharekart.in` | `password123` | Aadhaar Verified Host (Air Fryers, Drones) |
| **Kavya Patel**  | `kavya@sharekart.in`  | `password123` | Verified Renter (Hostel Student)           |
| **Ramesh Kumar** | `ramesh@sharekart.in` | `password123` | Verified Citizen (Tools & Machinery)       |

---

## 🛠 Troubleshooting & Common Issues

### 1. Port 3000 or 5000 Already In Use (`EADDRINUSE`)

- **Windows**:
  ```powershell
  # Find PID using port 5000 or 3000
  netstat -ano | findstr :5000
  # Kill task by PID
  taskkill /PID <PID_NUMBER> /F
  ```
- **macOS / Linux**:
  ```bash
  # Kill whatever is running on port 5000 or 3000
  lsof -ti:5000 | xargs kill -9
  lsof -ti:3000 | xargs kill -9
  ```

### 2. PowerShell Script Execution Disabled (Windows)

If you see `File ... cannot be loaded because running scripts is disabled on this system`:
Run PowerShell as Administrator and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### 3. Node Version Incompatibility

If you see unexpected syntax or module errors, make sure you are using Node.js v18 or v20+:

```bash
node -v
```

Use [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows) (Windows) if you need to switch versions:

```bash
nvm install 20
nvm use 20
```

### 4. Running Frontend Without Backend (Standalone Mode)

If you only want to design, develop UI, test products, or work on frontend:

```bash
cd ShareKart/client
npm run dev
```

All catalog products (including `#SK-6 Philips Air Fryer`, MacBook, Sony Camera, etc.) will automatically load from `src/data/initialData.js` and localStorage without needing the backend server.

---

## 🤝 Need Help?

- Repo: [https://github.com/AJ21-10/shareKart](https://github.com/AJ21-10/shareKart)
- For issues, open a GitHub Issue or reach out to the project maintainers.
