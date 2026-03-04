# 🥛 PHASE 2 — CORE DAIRY OPERATIONS (EXECUTION PLAN)

**Phase:** 2 of 7  
**Status:** IN PROGRESS  
**Started:** 2026-02-09 15:00 IST  
**Methodology:** Get Shit Done (GSD)

---

## 🎯 PHASE GOAL

Build the milk collection flow — the most-used feature that farmers interact with daily.

---

## 📋 TASKS BREAKDOWN (4 Main Components)

### 🔹 TASK 1: Big Numeric Input Component
**Goal:** Reusable numeric keypad for milk entry  
**Priority:** P0 (CRITICAL - foundation for all other tasks)  
**Estimated Time:** 30 min

**Deliverables:**
- [ ] Create `big-numeric-input.tsx` component
- [ ] Large touch-friendly buttons (56px minimum)
- [ ] Decimal support (2 places for liters, 1 for FAT/SNF)
- [ ] Clear/backspace functionality
- [ ] Works offline
- [ ] Paper-like styling (Bharat-First design)

**Verification:**
- Can input numbers easily with thumb
- Decimal places limited correctly
- Looks like paper register

---

### 🔹 TASK 2: Farmer Search Component
**Goal:** Fast, offline farmer search and selection  
**Priority:** P0 (CRITICAL - needed for milk entry)  
**Estimated Time:** 45 min

**Deliverables:**
- [ ] Create `farmer-search.tsx` component
- [ ] Real-time search (useFarmerSearch hook - already built ✅)
- [ ] Display farmer name + code + village
- [ ] Debounced input (300ms)
- [ ] Works 100% offline (IndexedDB)
- [ ] Keyboard accessible
- [ ] Shows recent farmers list when empty
- [ ] QR code scanner button (placeholder for Phase 7)

**Verification:**
- Search works offline
- Results appear < 500ms
- Can select farmer
- Clears after selection

---

### 🔹 TASK 3: Milk Entry Form
**Goal:** The main workflow — add milk entry  
**Priority:** P0 (CRITICAL - core feature)  
**Estimated Time:** 90 min

**Deliverables:**
- [ ] Create `milk-entry-form.tsx` page/component
- [ ] Shift selector (Morning/Evening)
- [ ] Farmer search integration (Task 2)
- [ ] Quantity input (Task 1 - Big Numeric)
- [ ] FAT input (mandatory, Task 1)
- [ ] SNF input (optional, Task 1)
- [ ] CLR input (optional, Task 1)
- [ ] Temperature input (optional, Task 1)
- [ ] Cattle type selector (Cow/Buffalo/Goat)
- [ ] **Auto rate calculation** (display live as typing)
- [ ] **Auto amount calculation** (Qty × Rate)
- [ ] Save button (saves to IndexedDB instantly)
- [ ] Success toast notification
- [ ] Form reset after save
- [ ] Works 100% offline

**Verification:**
- Entry saves < 100ms
- Rate calculates correctly based on FAT/SNF
- Amount = Qty × Rate
- Background sync queues entry
- Can add multiple entries quickly

---

### 🔹 TASK 4: Dashboard Today View
**Goal:** Show today's milk collection stats  
**Priority:** P1 (HIGH - user needs to see progress)  
**Estimated Time:** 60 min

**Deliverables:**
- [ ] Create/update `dashboard/page.tsx`
- [ ] Today's date display (Hindi + English)
- [ ] Current shift indicator (AM/PM)
- [ ] Morning shift stats:
  - Total liters
  - Total amount
  - Farmers count
- [ ] Evening shift stats:
  - Total liters
  - Total amount
  - Farmers count
- [ ] Overall today stats:
  - Combined liters
  - Combined amount
  - Total farmers served
- [ ] Primary CTA: "Add Milk Entry" button (navigate to Task 3)
- [ ] Recent entries list (last 4)
- [ ] Sync status indicator (already built ✅)
- [ ] Uses `useDailyStats` hook (already built ✅)
- [ ] Auto-updates when new entry added (live query)

**Verification:**
- Stats update in real-time
- Dashboard loads < 1s
- CTA button is prominent
- Paper-like design

---

## 🔧 TECHNICAL REQUIREMENTS

### Dependencies (Already Installed):
- ✅ React 19
- ✅ Next.js 16
- ✅ Tailwind CSS
- ✅ Dexie.js + hooks
- ✅ Framer Motion (animations)
- ✅ Lucide React (icons)

### Database Operations (Already Built):
- ✅ `useFarmers()` hook
- ✅ `useFarmerSearch()` hook
- ✅ `addMilkEntry()` function
- ✅ `calculateRate()` function
- ✅ `useDailyStats()` hook
- ✅ `useMilkEntries()` hook

### Design System (Already Defined):
- ✅ Colors: Saffron (#FF9933) + Green (#138808)
- ✅ Font: Inter + Noto Sans
- ✅ Touch targets: 56px minimum
- ✅ Paper-like aesthetic

---

## 📐 EXECUTION ORDER (GSD Style)

```
1. Big Numeric Input (30 min)
   ↓
2. Farmer Search (45 min)
   ↓
3. Milk Entry Form (90 min) ← Uses 1 & 2
   ↓
4. Dashboard (60 min)
   ↓
PHASE 2 COMPLETE ✅
```

**Total Time:** ~3.5 hours for core features  
**Additional Time:** Testing + polish = +1 hour  
**Total Phase 2:** ~4.5 hours (half day)

---

## ✅ COMPLETION CRITERIA

**Phase 2 is done when:**
1. ✅ Can add milk entry offline in < 10 seconds
2. ✅ Farmer search works instantly
3. ✅ Rate calculates automatically
4. ✅ Dashboard shows real-time stats
5. ✅ All components look paper-like
6. ✅ Background sync queues entries
7. ✅ No TypeScript errors
8. ✅ Mobile responsive

---

## 🐛 TESTING CHECKLIST

- [ ] Add milk entry offline
- [ ] Entry persists after reload
- [ ] Search works with no internet
- [ ] Rate calculation correct for all types
- [ ] Dashboard updates live
- [ ] Sync indicator shows pending
- [ ] Multiple rapid entries work
- [ ] Mobile touch works smoothly

---

## 📊 PROGRESS TRACKER

| Task | Status | Time |
|------|--------|------|
| 1. Big Numeric Input | ⏸️ Next | 0/30 min |
| 2. Farmer Search | ⏸️ Pending | 0/45 min |
| 3. Milk Entry Form | ⏸️ Pending | 0/90 min |
| 4. Dashboard | ⏸️ Pending | 0/60 min |
| **TOTAL** | **0%** | **0/225 min** |

---

## 🔄 NEXT IMMEDIATE ACTION

**Starting Task 1:** Big Numeric Input Component

**File to create:** `src/components/big-numeric-input.tsx`

**Why first?** Because Tasks 2 and 3 both need this component. Build foundation first.

---

**LET'S BUILD!** 🚀
