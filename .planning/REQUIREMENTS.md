# 🥛 DIGI DHOODH — REQUIREMENTS DOCUMENT

**Date:** 2026-02-09  
**Status:** Approved  
**Version:** 1.0

---

# V1 REQUIREMENTS (MUST HAVE)

## R1: Offline Database Layer
**Priority:** P0 (CRITICAL)  
**Traceability:** Phase 1

### Must Have:
- [ ] Dexie.js integration for IndexedDB
- [ ] Schema mirroring Supabase tables
- [ ] CRUD operations (Create, Read, Update, Delete)
- [ ] Migrations support
- [ ] Error handling & rollback
- [ ] Data versioning

### Acceptance Criteria:
1. All core tables exist in IndexedDB
2. Write operations work offline
3. Data persists across sessions
4. No data loss on app close

---

## R2: Background Sync System
**Priority:** P0 (CRITICAL)  
**Traceability:** Phase 1

### Must Have:
- [ ] Sync queue (pending changes)
- [ ] Network status detection
- [ ] Auto-retry on connection
- [ ] Conflict resolution (CRDT-style)
- [ ] Sync status UI indicator
- [ ] Manual sync trigger

### Acceptance Criteria:
1. Changes sync automatically when online
2. Conflicts resolve without data loss
3. User sees sync status clearly
4. Failed syncs retry intelligently

---

## R3: Milk Collection (Offline-First)
**Priority:** P0 (CRITICAL)  
**Traceability:** Phase 2

### Must Have:
- [ ] AM/PM shift selection
- [ ] Farmer selection (searchable dropdown)
- [ ] Quantity input (liters, 2 decimals)
- [ ] FAT input (%, 1 decimal, mandatory)
- [ ] SNF input (%, 1 decimal, optional)
- [ ] CLR input (%, 1 decimal, optional)
- [ ] Temperature input (°C, optional)
- [ ] Cattle type (Cow/Buffalo/Goat)
- [ ] Auto-rate calculation
- [ ] Auto-amount calculation
- [ ] Instant local save (IndexedDB)
- [ ] Background sync to Supabase

### Acceptance Criteria:
1. Entry saves instantly offline
2. Syncs to Supabase when online
3. UI feels instant (< 100ms)
4. No data loss

---

## R4: Append-Only Ledger System
**Priority:** P0 (CRITICAL MOAT)  
**Traceability:** Phase 3

### Must Have:
- [ ] Ledger entries table (immutable)
- [ ] Credit entries (milk payments)
- [ ] Debit entries (payments, advances, loans)
- [ ] **NO stored balance column**
- [ ] Runtime balance = SUM(credits) - SUM(debits)
- [ ] Linked correction entries (not edits)
- [ ] Full audit trail (user, device, timestamp)
- [ ] Delete prevention (RLS + trigger)

### Acceptance Criteria:
1. NO UPDATE/DELETE allowed on ledger_entries
2. Corrections create new linked entries
3. Balance always calculated, never stored
4. Every action logged in audit table

---

## R5: Rate Charts (Versioned)
**Priority:** P0 (CRITICAL)  
**Traceability:** Phase 2

### Must Have:
- [ ] Base rate per liter
- [ ] FAT-based slabs (e.g., 3.0-3.5% = ₹35)
- [ ] SNF-based slabs
- [ ] Combined FAT+SNF pricing
- [ ] Cow/Buffalo/Goat separate charts
- [ ] Multiple named charts (Premium plan)
- [ ] Farmer-specific rate override (Premium)
- [ ] Effective date system
- [ ] **Version history** (immutable old versions)
- [ ] Auto-detect applicable rate

### Acceptance Criteria:
1. Rate changes create new versions
2. Old entries retain old rates
3. New entries use current rates
4. History never changes

---

## R6: Billing System (All 6 Cycles)
**Priority:** P1 (HIGH)  
**Traceability:** Phase 4

### Must Have:
- [ ] **1-Day billing** (daily)
- [ ] **7-Day billing** (weekly)
- [ ] **10-Day billing**
- [ ] **15-Day billing**
- [ ] **Monthly billing**
- [ ] **Custom period** (date range)
- [ ] Auto-bill generation
- [ ] Deductions (advance, loan, products)
- [ ] Net payable calculation
- [ ] PDF generation (jsPDF)
- [ ] WhatsApp share
- [ ] Bill history

### Acceptance Criteria:
1. All 6 billing types work
2. Deductions apply correctly
3. PDF matches ledger exactly
4. WhatsApp share works

---

## R7: Electron Desktop App
**Priority:** P1 (HIGH)  
**Traceability:** Phase 5

### Must Have:
- [ ] Windows .exe installer (NSIS)
- [ ] Mac .dmg image
- [ ] Linux AppImage
- [ ] Auto-updates (optional)
- [ ] Offline database (same as PWA)
- [ ] Tray icon
- [ ] Window state persistence

### Acceptance Criteria:
1. Runs on Windows 10/11
2. Runs on macOS 12+
3. Runs on Ubuntu 22.04+
4. Installer works correctly
5. App icon shows properly

---

## R8: PWA Mobile Experience
**Priority:** P1 (HIGH)  
**Traceability:** Phase 5

### Must Have:
- [ ] Installable on Android (Chrome)
- [ ] Installable on iOS (Safari)
- [ ] Offline-first (Service Workers)
- [ ] Add to Home Screen prompt
- [ ] Splash screen
- [ ] App icon
- [ ] Full-screen mode
- [ ] Pull-to-refresh
- [ ] Background sync

### Acceptance Criteria:
1. PWA score 100/100 (Lighthouse)
2. Works offline on Android
3. Works offline on iOS
4. Feels native

---

## R9: Multi-Language Support
**Priority:** P1 (HIGH)  
**Traceability:** Phase 6

### Must Have:
- [ ] English (default)
- [ ] Hindi (हिंदी)
- [ ] Gujarati (ગુજરાતી)
- [ ] Marathi (मराठी)
- [ ] Punjabi (ਪੰਜਾਬੀ)
- [ ] Bengali (বাংলা)
- [ ] Tamil (தமிழ்)
- [ ] Telugu (తెలుగు)
- [ ] Kannada (ಕನ್ನಡ)
- [ ] Odia (ଓଡ଼ିଆ)
- [ ] i18next integration
- [ ] Language switcher UI
- [ ] Persistent language preference

### Acceptance Criteria:
1. All 10 languages load
2. UI text translates fully
3. Number formatting correct
4. Date formatting correct

---

## R10: Reports & Analytics
**Priority:** P2 (MEDIUM)  
**Traceability:** Phase 7

### Must Have:
- [ ] Daily milk summary
- [ ] Farmer-wise report
- [ ] Shift-wise report
- [ ] Period comparison
- [ ] Outstanding dues
- [ ] Export to Excel
- [ ] Export to PDF

### Acceptance Criteria:
1. Reports load < 2s
2. Data matches ledger
3. Exports work

---

# V2 REQUIREMENTS (NICE TO HAVE)

## R11: SMS Alerts
**Traceability:** Phase 8 (Future)

- SMS after milk entry
- Payment reminders
- Bill notifications

## R12: Hardware Integration
**Traceability:** Phase 8 (Future)

- Weighing scale (serial/Bluetooth)
- FAT analyzer (serial/USB)
- Thermal printer (Bluetooth)

## R13: Multi-Centre Management
**Traceability:** Phase 9 (Future)

- Multiple collection centres
- Centre-wise reports
- Inter-centre transfers

---

# OUT OF SCOPE (NEVER BUILD)

## ❌ Delivery Apps
- Customer delivery app
- Delivery partner tracking
- Route optimization

**Reason:** Different business, logistics-heavy

## ❌ Cattle Marketplace
- Buy/sell cattle
- Chat between traders
- Image/video listings

**Reason:** High fraud risk, separate domain

## ❌ Editable Balances
- Manual balance correction
- Direct ledger editing

**Reason:** **TRUST KILLER** — destroys core moat

## ❌ Fancy Dashboards
- Animated charts
- KPI widgets
- Heatmaps

**Reason:** Low literacy users, distracts from work

---

# ACCEPTANCE CRITERIA (GLOBAL)

**Every feature must:**
1. ✅ Work 100% offline
2. ✅ Survive app close/reload
3. ✅ Sync to Supabase when online
4. ✅ Support all 10 languages
5. ✅ Work on mobile + desktop
6. ✅ Follow Bharat-First design
7. ✅ Include audit logging
8. ✅ Be tested (80% coverage)

---

# TECHNICAL CONSTRAINTS

1. **Database:** PostgreSQL (Supabase) + IndexedDB (Dexie.js)
2. **Auth:** Supabase Auth (OTP + Google OAuth)
3. **UI:** React 19 + Next.js 16 + Tailwind CSS
4. **Offline:** Service Workers + Background Sync API
5. **Desktop:** Electron 28 + Electron Builder
6. **Mobile:** PWA (no native apps in V1)

---

# NON-FUNCTIONAL REQUIREMENTS

## Performance
- First paint < 1.5s
- Offline entry save < 100ms
- Sync batch size: 100 entries max
- IndexedDB size: < 50MB typical

## Security
- RLS on all Supabase tables
- No stored passwords
- Audit all financial changes
- 2FA for admin roles

## Reliability
- 99.9% uptime (Supabase)
- Zero data loss offline
- Graceful error handling

## Usability
- One-thumb operation
- Hindi-first
- Paper-like UX

---

**Requirements approved. Ready for roadmap planning.** ✅
