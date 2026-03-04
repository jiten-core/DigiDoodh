# 🥛 DIGI DHOODH — ROADMAP

**Date:** 2026-02-09  
**Milestone:** V1 MVP  
**Target:** Production-ready offline-first dairy management system

---

# PHASES OVERVIEW

| Phase | Name | Duration | Status |
|-------|------|----------|--------|
| **1** | Offline Foundation | 2-3 days | ⏸️ Pending |
| **2** | Core Dairy Ops | 3-4 days | ⏸ | **3** | Append-Only Ledger | 2-3 days | ⏸️ Pending |
| **4** | Billing System | 2-3 days | ⏸️ Pending |
| **5** | Platform Distribution | 3-4 days | ⏸️ Pending |
| **6** | Multi-Language | 1-2 days | ⏸️ Pending |
| **7** | Reports & Polish | 2-3 days | ⏸️ Pending |

**Total Estimated Time:** 15-22 days

---

# PHASE 1: OFFLINE FOUNDATION
**Duration:** 2-3 days  
**Requirements:** R1, R2  
**Status:** ⏸️ Pending

## Goals:
Build the offline-first infrastructure that makes DigiDhoodh work without internet.

## Deliverables:
1. Dexie.js database setup
2. Schema matching Supabase
3. Offline CRUD operations
4. Background sync system
5. Network status detection
6. Sync queue UI
7. Conflict resolution logic

## Tasks:
- [ ] Install & configure Dexie.js
- [ ] Create IndexedDB schema (farmers, milk_entries, ledger, etc.)
- [ ] Build database wrapper with TypeScript types
- [ ] Implement sync queue (pending changes)
- [ ] Add network status hook
- [ ] Create sync service (auto-retry)
- [ ] Build conflict resolution (timestamp + device ID)
- [ ] Add sync status indicator UI
- [ ] Test offline → online → offline flow

## Verification:
- Can add farmer offline
- Farmer syncs when online
- Works after app reload
- No data loss

---

# PHASE 2: CORE DAIRY OPERATIONS
**Duration:** 3-4 days  
**Requirements:** R3, R5  
**Status:** ⏸️ Pending

## Goals:
Build the milk collection flow — the most-used feature.

## Deliverables:
1. Milk entry form (offline-first)
2. Farmer search & selection
3. FAT/SNF/CLR inputs
4. Auto-rate calculation
5. Shift management (AM/PM)
6. Rate chart system
7. Entry history view

## Tasks:
- [ ] Build milk entry UI (mobile-optimized)
- [ ] Add farmer searchable dropdown
- [ ] Implement big numeric inputs
- [ ] Create rate chart management UI
- [ ] Build rate calculation logic (FAT+SNF slabs)
- [ ] Add entry validation
- [ ] Save to IndexedDB instantly
- [ ] Queue for background sync
- [ ] Build entry history list
- [ ] Add edit/delete (with audit trail)

## Verification:
- Entry saves < 100ms offline
- Rate auto-calculates correctly
- Syncs to Supabase when online
- History shows all entries

---

# PHASE 3: APPEND-ONLY LEDGER
**Duration:** 2-3 days  
**Requirements:** R4  
**Status:** ⏸️ Pending

## Goals:
Build the core moat — immutable financial ledger.

## Deliverables:
1. Ledger schema (NO balance column)
2. Credit/Debit entry functions
3. Runtime balance calculation
4. Correction entries (linked)
5. Audit logging
6. RLS policies
7. Ledger view UI

## Tasks:
- [ ] Create ledger_entries table (Supabase)
- [ ] Add RLS policies (prevent UPDATE/DELETE)
- [ ] Create database trigger (block edits)
- [ ] Build ledger functions (addCredit, addDebit)
- [ ] Implement balance calculation (SUM query)
- [ ] Create correction entry system
- [ ] Add audit_log table
- [ ] Build ledger view UI
- [ ] Show running balance
- [ ] Link corrections visually

## Verification:
- Cannot edit ledger entry directly
- Corrections create new entries
- Balance = SUM(credits) - SUM(debits)
- All actions logged

---

# PHASE 4: BILLING SYSTEM
**Duration:** 2-3 days  
**Requirements:** R6  
**Status:** ⏸️ Pending

## Goals:
Generate bills for all 6 billing cycles.

## Deliverables:
1. Billing period selector (1/7/10/15/30/custom days)
2. Bill generation logic
3. Deductions (advance, loan, products)
4. PDF export (jsPDF)
5. WhatsApp share
6. Bill history

## Tasks:
- [ ] Build billing UI (period selection)
- [ ] Create bill calculation logic
- [ ] Fetch milk entries for period
- [ ] Calculate total milk + amount
- [ ] Apply deductions (advance, loan, products)
- [ ] Generate PDF (jsPDF + autotable)
- [ ] Add WhatsApp share button
- [ ] Save bills to IndexedDB
- [ ] Sync bills to Supabase
- [ ] Build bill history view

## Verification:
- All 6 cycles work
- Deductions apply correctly
- PDF renders properly
- WhatsApp opens with bill link

---

# PHASE 5: PLATFORM DISTRIBUTION
**Duration:** 3-4 days  
**Requirements:** R7, R8  
**Status:** ⏸️ Pending

## Goals:
Make DigiDhoodh available on Windows, Mac, Linux, Android, iOS.

## Deliverables:
1. **Electron Windows .exe**
2. **Electron Mac .dmg**
3. **Electron Linux AppImage**
4. **PWA (Android installable)**
5. **PWA (iOS installable)**
6. Service Worker optimization
7. Install prompts

## Tasks:
### Electron:
- [ ] Create electron-app/main.js (updated for Electron 28)
- [ ] Configure electron-builder
- [ ] Set up auto-updater (optional)
- [ ] Add tray icon
- [ ] Test on Windows 10/11
- [ ] Test on macOS 12+
- [ ]Test on Ubuntu 22.04
- [ ] Build installers (.exe, .dmg, AppImage)
- [ ] Sign code (Windows/Mac - optional for V1)

### PWA:
- [ ] Configure next-pwa (already done ✅)
- [ ] Create manifest.json
- [ ] Add app icons (192x192, 512x512)
- [ ] Create splash screens (iOS)
- [ ] Add install prompt UI
- [ ] Test on Android Chrome
- [ ] Test on iOS Safari
- [ ] Optimize Service Worker
- [ ] Test offline functionality

## Verification:
- Windows .exe installs & runs
- Mac .dmg installs & runs
- Linux AppImage runs
- Android: Adds to home screen
- iOS: Adds to home screen
- PWA Lighthouse score: 100/100
- All work offline

---

# PHASE 6: MULTI-LANGUAGE
**Duration:** 1-2 days  
**Requirements:** R9  
**Status:** ⏸️ Pending

## Goals:
Support all 10 Indian languages.

## Deliverables:
1. i18next setup
2. Translation files (10 languages)
3. Language switcher UI
4. Number/date formatting
5. RTL support (not needed for our langs)

## Tasks:
- [ ] Install i18next + react-i18next
- [ ] Create translation JSON files (10 languages)
- [ ] Extract all UI strings
- [ ] Translate to Hindi (primary)
- [ ] Translate to other 9 languages
- [ ] Add language switcher dropdown
- [ ] Persist language preference (localStorage)
- [ ] Format numbers correctly per locale
- [ ] Format dates correctly
- [ ] Test all languages

## Verification:
- All UI text translates
- Language persists after reload
- Numbers format correctly (e.g., ₹1,00,000 in Hindi)
- Dates format correctly

---

# PHASE 7: REPORTS & POLISH
**Duration:** 2-3 days  
**Requirements:** R10  
**Status:** ⏸️ Pending

## Goals:
Add reporting and final polish.

## Deliverables:
1. Daily milk summary
2. Farmer-wise reports
3. Outstanding dues
4. Period comparison
5. Excel export
6. PDF export
7. Performance optimization
8. Bug fixes

## Tasks:
- [ ] Build daily summary dashboard
- [ ] Create farmer-wise report
- [ ] Build outstanding dues view
- [ ] Add period comparison charts
- [ ] Implement Excel export (SheetJS)
- [ ] Implement PDF export
- [ ] Optimize bundle size
- [ ] Add loading skeletons
- [ ] Fix mobile UI issues
- [ ] Test all flows end-to-end

## Verification:
- Reports load < 2s
- Data matches ledger
- Exports work correctly
- UI feels polished

---

# MILESTONE COMPLETION CRITERIA

**V1 MVP is complete when:**
1. ✅ All 7 phases done
2. ✅ All V1 requirements met
3. ✅ 223 features built
4. ✅ Works offline (PWA + Electron)
5. ✅ Runs on Windows/Mac/Linux/Android/iOS
6. ✅ 10 languages supported
7. ✅ Ledger is append-only & immutable
8. ✅ Tests pass (80% coverage)
9. ✅ No critical bugs
10. ✅ Ready for beta launch

---

# POST-V1 ROADMAP (V2)

## Phase 8: SMS & Hardware
- SMS alerts after milk entry
- Weighing scale integration
- FAT analyzer integration
- Thermal printer support

## Phase 9: Multi-Centre
- Multiple collection centres
- Centre-wise farmers
- Centre-wise reports
- Consolidated dashboard

## Phase 10: Advanced Features
- Inventory management (Premium+)
- Product requests (farmers)
- GST invoicing
- Advanced analytics

---

# RISK MITIGATION

| Risk | Impact | Mitigation |
|------|--------|------------|
| Offline sync conflicts | High | CRDT-style resolution + timestamp |
| Electron build failures | Medium | Test early, containerized builds |
| PWA iOS limitations | Medium | Fallback to web app |
| Translation quality | Low | Use native speakers |

---

# DEPENDENCIES

**External:**
- Supabase (backend)
- Dexie.js (offline DB)
- Electron Builder (desktop builds)
- jsPDF (PDF generation)

**Internal:**
- Design system (✅ complete)
- Strategic docs (✅ complete)

---

**Roadmap approved. Ready to execute Phase 1.** 🚀
