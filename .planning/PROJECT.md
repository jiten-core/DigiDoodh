# 🥛 DIGI DHOODH — PROJECT MASTER FILE

**Date Created:** 2026-02-09  
**Status:** In Development  
**Methodology:** Get Shit Done (GSD)

---

## 🎯 PROJECT VISION

**What we're building:**
An offline-first, append-only, dispute-proof digital ledger system for milk, money, and trust between farmers and dairies.

**Primary abstraction:** Ledger  
**Primary value:** Trust  
**Primary moat:** Accounting correctness + offline reliability

**NOT building:** Delivery app, cattle marketplace, super-app

---

## 📦 DELIVERABLES

### Platform Requirements
1. ✅ **Web App (PWA)** — Installable, works offline, no app store
2. ⏸️ **Electron Desktop** — Windows .exe, Mac .dmg, Linux AppImage
3. ⏸️ **Mobile PWA** — Android & iOS via browser (offline-first)
4. ⏸️ **Offline Functionality** — Full CRUD in IndexedDB + background sync

### Core Features (223 total)
- ✅ Authentication (OTP, Google OAuth, device binding)
- ✅ User roles (5: Platform Admin, Internal Admin, Dairy Owner, Staff, Farmer)
- ⏸️ Milk collection (offline-first, FAT/SNF, auto-rate)
- ⏸️ **Append-only ledger** (CORE MOAT)
- ⏸️ Rate charts (versioned, immutable)
- ⏸️ Billing (all 6 cycles: 1/7/10/15/30/custom)
- ⏸️ Reports & Analytics
- ⏸️ Inventory (Premium+)
- ⏸️ Multi-language (10 languages)

---

## 💻 TECH STACK

**Frontend:**
- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS
- Framer Motion
- IndexedDB (via Dexie.js for offline)

**Backend:**
- Supabase (PostgreSQL + Auth + RLS)
- Edge Functions
- Real-time subscriptions

**Desktop:**
- Electron 28
- Electron Builder

**Mobile:**
- PWA (next-pwa configured)
- Service Workers
- Background Sync API

**State Management:**
- Zustand (global state)
- React Query (server state)
- Dexie.js (offline database)

---

## 🏗️ ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│              USER INTERFACES                         │
│  PWA (Mobile) │ Electron (Desktop) │ Web (Browser)  │
└─────────────────┬───────────────────────────────────┘
                  │
     ┌────────────▼───────────────┐
     │   OFFLINE-FIRST LAYER      │
     │  - IndexedDB (Dexie.js)    │
     │  - Background Sync Queue   │
     │  - Conflict Resolution     │
     └────────────┬───────────────┘
                  │
     ┌────────────▼───────────────┐
     │   API LAYER (Next.js)      │
     │  - Server Actions          │
     │  - API Routes              │
     └────────────┬───────────────┘
                  │
     ┌────────────▼───────────────┐
     │   SUPABASE BACKEND         │
     │  - PostgreSQL (RLS)        │
     │  - Auth + Sessions         │
     │  - Edge Functions          │
     └────────────────────────────┘
```

---

## 🔐 SECURITY PRINCIPLES

1. **Row Level Security (RLS)** — Dairy-scoped isolation
2. **Append-only ledger** — NO UPDATE/DELETE on financial tables
3. **Audit logging** — Every action tracked
4. **Device binding** — Prevent credential sharing
5. **2FA** — For admin roles
6. **No stored balance** — Always runtime SUM()

---

## 📱 PLATFORMS & DISTRIBUTIONS

| Platform | Status | Distribution | Offline |
|----------|--------|--------------|---------|
| **Web App** | ✅ Built | Vercel | ⚠️ Partial |
| **PWA (Mobile)** | ⏸️ Pending | Browser install | ✅ Full |
| **Electron (Windows)** | ⏸️ Pending | .exe installer | ✅ Full |
| **Electron (Mac)** | ⏸️ Pending | .dmg image | ✅ Full |
| **Electron (Linux)** | ⏸️ Pending | AppImage | ✅ Full |

---

## 🎯 DEFINITION OF DONE

**A feature is complete when:**
1. ✅ Code written & tested
2. ✅ Works 100% offline
3. ✅ Background sync implemented
4. ✅ Audit logging added
5. ✅ Multi-language support
6. ✅ Dark mode compatible
7. ✅ Mobile responsive
8. ✅ Electron compatible
9. ✅ Git committed with message
10. ✅ Documented

---

## 📊 SUCCESS METRICS

**Technical:**
- Offline-first: 100% features work without internet
- PWA Score: 100/100 (Lighthouse)
- Electron Build: Successful .exe, .dmg, AppImage
- Bundle Size: < 500KB initial JS

**Product:**
- Feature Parity: 98% vs competitors
- Zero Bloat: 0% unnecessary features
- Ledger Integrity: 100% immutable
- Test Coverage: 80%+

---

## 🚀 CURRENT STATUS

**What's Done:**
- ✅ Next.js 16 setup with TypeScript
- ✅ Tailwind CSS + Design system
- ✅ PWA configuration (next-pwa)
- ✅ Electron setup (package.json + build config)
- ✅ Supabase integration
- ✅ Basic auth pages
- ✅ Dashboard layout
- ✅ Strategic documentation (150+ pages)

**What's Next:**
1. Complete offline database layer (Dexie.js)
2. Build core milk collection flow
3. Implement append-only ledger
4. Add background sync
5. Build Electron app & test Windows .exe
6. Test PWA on Android/iOS
7. Polish & optimize

---

## 📁 PROJECT STRUCTURE

```
DigiDhoodh-Ultimate/
├── .planning/              # GSD planning files
│   ├── PROJECT.md         # This file
│   ├── REQUIREMENTS.md    # Detailed requirements
│   ├── ROADMAP.md         # Phased roadmap
│   ├── STATE.md           # Current state & decisions
│   └── milestones/        # Milestone-specific planning
├── src/
│   ├── app/               # Next.js 16 app router
│   ├── components/        # React components
│   ├── lib/               # Utilities & helpers
│   ├── db/                # Offline database (Dexie.js)
│   └── types/             # TypeScript types
├── electron-app/          # Electron main/renderer
├── public/                # Static assets
└── Strategic Docs/        # 150+ pages of strategy
    ├── EXECUTIVE_SUMMARY.md
    ├── MASTER_STRATEGY.md
    ├── FEATURE_KILL_LIST.md
    ├── MOAT_ANALYSIS.md
    ├── GTM_STRATEGY.md
    └── ...
```

---

## 🎓 KEY CONSTRAINTS

1. **Offline-first** — App MUST work without internet
2. **Immutable ledger** — Financial data can NEVER be silently edited/deleted
3. **Zero bloat** — NO delivery apps, cattle marketplace, etc.
4. **India-focused** — Hindi-first, village UX, ₹199 pricing
5. **Trust > Features** — Quality over quantity

---

## 📞 STAKEHOLDERS

**Owner:** Jiten (Founder)  
**Primary Users:** Dairy owners (20-1,000 farmers)  
**Secondary Users:** Farmers (view-only), Staff (operations)  
**Target Market:** Indian dairies currently using paper registers

---

**Project initialized successfully. Ready for GSD workflow.** 🚀
