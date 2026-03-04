# 🥛 DigiDhoodh - Product Requirements Document (PRD)

**Version:** 2.0 (FINAL)  
**Date:** 2026-02-09  
**Status:** ✅ Production Ready

---

## 1. Product Overview

### 1.1 What is DigiDhoodh?
DigiDhoodh is a **milk collection and billing management app** for dairy owners in India. It digitizes the traditional paper ledger system with offline-first capabilities.

### 1.2 Core Principles (LOCKED)

| Principle | Description |
|-----------|-------------|
| **Only Dairy Owner Pays** | Farmers & Staff are always FREE |
| **No GPS/Delivery** | No logistics, no tracking |
| **One App, Role-Based** | Single app with 5 user roles |
| **Inventory = Supporting** | Not main business, just for billing |
| **Farmer Requests** | Request only, Dairy decides |

### 1.3 What We Are NOT Building
- ❌ GPS/Delivery tracking
- ❌ Route management  
- ❌ Marketplace (buy/sell)
- ❌ AI/LLM integration
- ❌ Voice assistant
- ❌ Farm/Cattle management

---

## 2. User Roles (5 Roles Only)

| Role | Purpose | Pays? |
|------|---------|-------|
| **Platform Super Admin** | DigiDhoodh team | Internal |
| **Internal Super Admin** | Support & audit | Internal |
| **Dairy Owner** | Full dairy control | ✅ YES |
| **Staff / Helper** | Limited operations | ❌ FREE |
| **Farmer** | View only | ❌ FREE |

---

## 3. Pricing Plans (FINAL)

### 🟩 BASIC — ₹199/month (GST included)
**Best for:** Small village dairies

**Limits:**
- 👨‍🌾 Farmers: Up to 300
- 👥 Staff: 1
- ✏️ Edit history: 30 days

**Features:**
- Milk collection (Morning / Evening)
- FAT / SNF auto rate calculation
- 1 rate chart
- Farmer ledger
- Advance & loan tracking
- 10-day / monthly billing
- PDF bill generation
- WhatsApp bill sharing (limited)
- Offline milk entry + auto sync
- Multi-language UI
- Farmer login (view only)

**Not Included:** Multiple rate charts, Unlimited WhatsApp, Inventory, Product requests

---

### 🟧 PREMIUM — ₹299/month (GST included) ⭐ MOST CHOSEN
**Best for:** Growing dairies

**Limits:**
- 👨‍🌾 Farmers: Up to 600
- 👥 Staff: 3
- ✏️ Edit history: 90 days

**Everything in BASIC +**
- Unlimited WhatsApp notifications
- Multiple rate charts
- Farmer-specific rates
- Staff permission controls
- Advanced reports
- Faster support
- No ads

**Not Included:** Inventory, Product request system

---

### 🟦 PREMIUM+ — ₹599/month (GST included)
**Best for:** Large dairies, societies

**Limits:**
- 👨‍🌾 Farmers: Unlimited
- 👥 Staff: Unlimited
- ✏️ Edit history: 365 days

**Everything in PREMIUM +**
- ✅ Inventory management (feed, medicine, items)
- ✅ Farmer product request system
- ✅ Product sales to farmers
- ✅ Auto ledger adjustment for products
- ✅ GST invoice (optional)
- ✅ Priority support
- ✅ Unlimited exports

---

## 4. Feature Comparison Table

| Feature | BASIC ₹199 | PREMIUM ₹299 | PREMIUM+ ₹599 |
|---------|------------|--------------|---------------|
| Farmers | Up to 300 | Up to 600 | Unlimited |
| Staff | 1 | 3 | Unlimited |
| Edit History | 30 days | 90 days | 365 days |
| Milk Collection | ✅ | ✅ | ✅ |
| FAT / SNF Rate | ✅ | ✅ | ✅ |
| Rate Charts | 1 | Multiple | Unlimited |
| Farmer Ledger | ✅ | ✅ | ✅ |
| Billing (PDF) | ✅ | ✅ | ✅ |
| WhatsApp | Limited | Unlimited | Unlimited |
| Offline Mode | ✅ | ✅ | ✅ |
| Inventory | ❌ | ❌ | ✅ |
| Product Requests | ❌ | ❌ | ✅ |
| Product Sales | ❌ | ❌ | ✅ |
| GST Invoice | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |

**(GST included in all prices)**

---

## 5. Inventory & Product Request System (PREMIUM+ Only)

### This is VERY SIMPLE and NON-COMPLICATED.

### 👨‍🌾 Farmer Side (Request Only)
**Farmer CAN:**
- See list of available products (feed, medicine, etc.)
- See price (if dairy allows)
- Send product request (product name, quantity, optional message)

**Farmer CANNOT:**
- Place automatic order
- Pay online
- Reduce stock directly

**👉 It's a REQUEST, not an ORDER.**

### 🧑‍💼 Dairy Side (Full Control)
**Dairy CAN:**
- Accept or reject request
- Adjust quantity or price
- Mark as sold (cash / credit)
- Auto-update stock
- Auto-add amount to farmer ledger
- Include in next milk bill

### Simple Real-Life Example
1. Farmer requests: 🧺 Cattle Feed – 1 bag
2. Dairy checks stock:
   - If available → Accept
   - If not → Reject / Call farmer
3. If accepted:
   - Stock −1
   - Ledger +₹1,200
   - Shows in next bill

### What Inventory Does NOT Have
- ❌ No delivery system
- ❌ No warehouse management
- ❌ No multi-location
- ❌ No online orders

---

## 6. Core Modules

### 6.1 Milk Collection (All Plans)
- Morning (AM) and Evening (PM) collection
- FAT and SNF entry (manual or device)
- Auto rate calculation from rate chart
- Total amount = Liters × Rate
- Offline entry with auto-sync
- Edit history with audit trail

### 6.2 Rate Chart Engine (All Plans)
- FAT-based pricing
- FAT+SNF based pricing
- Cow/Buffalo/Goat differentiation
- Effective date for rate changes
- Multiple charts (PREMIUM+)
- Farmer-specific rates (PREMIUM+)

### 6.3 Farmer Ledger (All Plans - IMMUTABLE)
- Append-only transactions
- Credit: Milk payments
- Debit: Advances, loans, product purchases
- Balance = SUM(credits) - SUM(debits)
- ⚠️ Never UPDATE or DELETE money entries

### 6.4 Billing System (All Plans)
**Supported Billing Cycles:**
- Daily (1-Day) billing
- Weekly (7-Day) billing
- 10-Day billing cycle
- 15-Day billing cycle
- Monthly billing cycle
- Custom billing cycle

**Features:**
- PDF bill generation
- WhatsApp bill sharing
- Advance/Loan deduction from bill
- Net payable calculation

---

## 7. Technical Requirements

### 7.1 Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript + Next.js |
| Styling | TailwindCSS |
| Offline | IndexedDB + ServiceWorker |
| Backend | Supabase (PostgreSQL) |
| Auth | Supabase Auth (OTP) |
| PDF | @react-pdf/renderer |
| i18n | react-i18next (10 languages) |
| Desktop | Electron |
| Payments | Razorpay |

### 7.2 Platforms
- ✅ Web App (PWA) - Primary
- ✅ Mobile (PWA Installable)
- ✅ Desktop (Electron)
- ⏸️ Native Android (Phase 2)

### 7.3 Offline Requirements
- All milk entries work offline
- Data stored in IndexedDB
- Auto-sync when online
- Clear sync status indicators

---

## 8. Security Requirements

### Non-Negotiable Rules
| Rule | Enforcement |
|------|-------------|
| No UPDATE on money tables | Database trigger |
| No DELETE on financial data | Database trigger |
| Balance is calculated, never stored | Application logic |
| Row Level Security (RLS) | Supabase policies |
| Audit log for all changes | Automatic |

---

## 9. Language Support (10 Languages)

| # | Language | Code |
|---|----------|------|
| 1 | English | en |
| 2 | Hindi | hi |
| 3 | Gujarati | gu |
| 4 | Marathi | mr |
| 5 | Punjabi | pa |
| 6 | Bengali | bn |
| 7 | Tamil | ta |
| 8 | Telugu | te |
| 9 | Kannada | kn |
| 10 | Odia | or |

---

## 10. Phase 2 (Future)

| Feature | Status | Priority |
|---------|--------|----------|
| Native Android App | ⏸️ Planned | P0 |
| Play Store Publishing | ⏸️ Planned | P0 |
| Push Notifications (FCM) | ⏸️ Planned | P0 |
| **Multi-Centre Management** | ⏸️ Planned | P1 |
| Deep Linking | ⏸️ Planned | P1 |
| Smart Insights (Statistics) | ⏸️ Planned | P2 |

### Multi-Centre Management (PREMIUM+ Only)
For dairies with multiple collection centres:
- Add/Edit/Delete Centres
- Centre-wise Farmer Assignment
- Centre-wise Staff Assignment
- Centre-wise Reports
- Consolidated Dashboard

---

## 11. Final Lock Statement

```
DigiDhoodh pricing is simple, affordable, and dairy-friendly.
Inventory & product requests exist only to support farmer billing, not logistics.

✅ Milk → Rate → Bill is always correct
✅ App works fully offline
✅ Farmer can see their milk and money
✅ Dairy owner trusts the numbers

Pricing: ₹199 / ₹299 / ₹599 — LOCKED
```

---

*This PRD is the single source of truth for DigiDhoodh requirements.*
