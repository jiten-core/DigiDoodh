# 🧩 DigiDhoodh — FINAL PRODUCT REQUIREMENTS DOCUMENT (PRD)
**UPDATED v2.0 • SINGLE SOURCE OF TRUTH • BUILD‑READY**

---

## 1. Product Overview

**Product Name:** DigiDhoodh  
**Product Type:** Dairy Management SaaS  
**Platforms:** Web (PWA), Android, iOS, Desktop (Electron)  
**Deployment:** Cloud + Offline‑first  

**Paying User:** Dairy Owner only  
**Free Users:** Staff, Farmer, Buyer  

**Core Promise:**  
> Accurate milk → correct rate → trusted ledger → simple billing, even without internet.

---

## 2. Product Philosophy (NON‑NEGOTIABLE)

- One app only (no separate farmer / staff apps)
- Strict role‑based access
- Offline‑first by default
- Money accuracy > features
- Simple UI for rural & low‑tech users
- Multi‑language is mandatory
- Cross-platform: Web + Mobile (PWA) + Desktop (Electron)

---

## 3. User Roles (FINAL - 6 ROLES)

1. **Platform Super Admin** – Company owner / core leadership (God mode)
2. **Internal Super Admin** – Company internal team (support & audit)
3. **Dairy Owner** – Paying customer (owns one dairy)
4. **Staff / Helper** – Operations role
5. **Farmer** – Free, view‑only user (supplies milk)
6. **Buyer** – Purchases milk/products from dairy

No delivery boy role. No accountant role.

---

## 4. Supported Languages (FINAL - 10 LANGUAGES)

The app UI, PDFs, and WhatsApp messages must support:

- English  
- Hindi (हिंदी)  
- Gujarati (ગુજરાતી)  
- Marathi (मराठी)  
- Punjabi (ਪੰਜਾਬੀ)  
- Bengali (বাংলা)  
- Tamil (தமிழ்)  
- Telugu (తెలుగు)  
- Kannada (ಕನ್ನಡ)  
- Odia (ଓଡ଼ିଆ)

Language can be changed anytime by the user.

---

## 5. Core Functional Modules

### 5.1 Authentication & Access
- Mobile OTP login (primary)
- Optional email login
- Role‑based UI rendering
- Multi‑device login (Owner)

---

### 5.2 Milk Collection (TIER‑0 MODULE)

- Morning / Evening milk entry
- Farmer search (name / ID / QR scan)
- Input: liters, FAT, SNF
- Auto rate calculation from rate chart
- Auto amount calculation
- Edit permissions based on role & plan
- Full offline support
- **QR Code scanning for farmer identification**

---

### 5.3 Rate Chart Engine

- Unlimited rate charts
- FAT‑only or FAT + SNF / CLR
- Cow / Buffalo / Mixed milk
- Farmer‑specific rate override
- Effective‑from date support
- Historical rate tracking

---

### 5.4 Farmer Ledger (MOST CRITICAL)

- Daily milk transaction history
- Advances & loans
- Auto deduction from milk payments
- Pending balance tracking
- Lifetime immutable ledger
- PDF & Excel export

---

### 5.5 Billing System

- 10‑day billing
- Monthly billing
- Custom billing cycles
- Draft bill → Final bill flow
- GST invoice (Premium+)
- PDF generation
- WhatsApp bill sharing
- **Bluetooth Printer support**
- **Thermal/Receipt Printer support**

---

### 5.6 Staff Operations

- Milk entry
- Limited edit capability (owner‑controlled)
- Payment recording (approval‑based)
- Draft bill generation
- Offline sync status indicators

---

### 5.7 Buyer Management (NEW)

- Register buyers who purchase milk/products
- Track buyer orders and payments
- Buyer ledger (receivables)
- Generate invoices for buyers
- **QR Code for buyer identification**

---

### 5.8 Reports & Dashboard

- Today's milk total
- Monthly milk summary
- Payable / receivable overview
- Simple trend graphs
- Export reports (role‑controlled)

---

### 5.9 Notifications

- Daily milk slip (WhatsApp)
- Monthly bill notifications
- Payment reminders
- Rate change alerts

---

### 5.10 Printing System (NEW)

- **Bluetooth Printer** – Mobile printing for receipts
- **Thermal/Receipt Printer** – Counter printing via USB/network
- **PDF Generation** – Standard printing
- Supported formats: Daily milk slip, Bill, Receipt, Ledger statement

---

### 5.11 QR Code System (NEW)

- **QR Code Generation** – Unique QR for each farmer/buyer
- **QR Code Scanning** – Quick farmer/buyer identification
- **QR on Bills** – Payment QR codes (UPI)
- Works offline with cached data

---

### 5.12 Referral System (NEW)

- Dairy owners can refer other dairy owners
- Referral code generation
- Track referrals and conversions
- Reward system:
  - Referrer: 30 days free extension
  - Referred: 15 days free trial extension
- Referral dashboard in settings

---

## 6. Pricing Plans (FINAL)

### 🟩 BASIC — ₹199 / month
- Up to 300 farmers
- Up to 50 buyers
- 30‑day edit history
- PDF bills
- Limited WhatsApp
- 1 staff account
- Bluetooth printing

### 🟧 PREMIUM — ₹299 / month
- Up to 600 farmers
- Up to 200 buyers
- 90‑day edit history
- Unlimited WhatsApp
- 3 staff accounts
- All printing options
- QR scanning

### 🟦 PREMIUM+ — ₹599 / month
- Unlimited farmers
- Unlimited buyers
- 365‑day edit history
- Full inventory management
- All printing & scanning
- Priority support
- Referral rewards (double)

*GST included • Yearly plans available*

---

## 7. Role‑Wise Capabilities (FINAL)

| Feature / Capability | Platform Super Admin | Internal Super Admin | Dairy Owner | Staff / Helper | Farmer | Buyer |
|--------------------|--------------------|--------------------|-------------|---------------|--------|-------|
| Login (OTP) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Access All Dairies | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Impersonate Dairy Owner | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ |
| Add Milk Entry | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Edit Old Milk | ✅ | ❌ | ✅ | ⚠️ | ❌ | ❌ |
| Delete Milk Entry | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| View Milk History | ✅ | ✅ | ✅ | ✅ | Own | ❌ |
| View Farmer Ledger | ✅ | ⚠️ | ✅ | ⚠️ | Own | ❌ |
| Modify Ledger | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Rate Charts | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Generate Bill Draft | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Finalize Bills | ✅ | ❌ | ✅ | ⚠️ | ❌ | ❌ |
| View Bills (PDF) | ✅ | ✅ | ✅ | ⚠️ | Own | Own |
| Export Reports | ✅ | ⚠️ | ✅ | ⚠️ | ❌ | ❌ |
| App Settings | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Subscription / Plan | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Offline Entry | ✅ | ❌ | ✅ | ✅ | View | View |
| Print Receipts | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| QR Scanning | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| View Own Orders | ❌ | ❌ | ❌ | ❌ | ❌ | Own |
| Manage Referrals | ✅ | ⚠️ | ✅ | ❌ | ❌ | ❌ |

⚠️ = Explicit permission required from Platform Admin or Dairy Owner

---

## 8. Non‑Functional Requirements

- Works on low‑end Android devices (2GB RAM)
- Offline‑first with automatic sync
- Zero data loss
- Screen load < 1 second
- Large buttons & readable fonts
- Cross-platform compatibility (Web/Mobile/Desktop)

---

## 9. Technology Stack (FINAL)

### Frontend
- React + TypeScript
- Vite (fast builds)
- TailwindCSS
- Framer Motion (light usage)
- Progressive Web App (PWA)

### Desktop Application
- **Electron** – Desktop app for Windows/Mac/Linux
- Native printer integration
- System tray support
- Auto-updates

### Backend (PRIMARY: SUPABASE)
- **Supabase (PostgreSQL)** – Primary database
- Supabase Auth (OTP login)
- Row Level Security (RLS)
- Edge Functions
- Storage (PDFs & exports)
- Realtime subscriptions

### Offline Engine
- IndexedDB (via Dexie.js)
- Local mutation queue
- Conflict resolution (latest valid write)

### Hardware Integration
- **Bluetooth Printer** – ESC/POS protocol
- **USB/Network Printer** – Receipt/thermal printers
- **Camera API** – QR code scanning
- **Web Bluetooth API** – For PWA printing

---

## 10. Security & Data Safety

- Strict dairy‑level RLS
- Platform Super Admin bypass
- Encrypted local storage
- Full audit logs
- No hard delete for financial data
- 2FA for all admin roles

---

## 11. Platform Deployment

| Platform | Technology | Distribution |
|----------|-----------|--------------|
| Web | React + Vite | Vercel / Cloudflare |
| Android | PWA | Google Play Store |
| iOS | PWA | Safari / App Store (later) |
| Windows | Electron | Direct download / Microsoft Store |
| Mac | Electron | Direct download / Mac App Store |
| Linux | Electron | AppImage / Snap |

---

## 12. Definition of DONE (LAUNCH CRITERIA)

DigiDhoodh is considered production‑ready when:

- Milk → rate → bill is always correct
- App works fully offline
- Farmer can see his milk & money
- Dairy owner fully trusts the numbers
- No role can access unauthorized data
- Printing works on all supported devices
- QR scanning works for farmer identification
- Referral system is functional
- Desktop app is installable and functional

---

## 13. Final Lock Statement

> **This PRD is FINAL and LOCKED (v2.0).**  
> Any future change must go through structured product review.

**Changes from v1.0:**
- Added Buyer role
- Added Bluetooth/Receipt Printer support
- Added QR Code system
- Added Referral System
- Added Electron Desktop app requirement
- Confirmed Supabase as primary database

**DigiDhoodh PRD v2.0 — Company Foundation Document**
