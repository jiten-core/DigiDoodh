# 🔪 DIGI DHOODH — FEATURE KILL LIST
**ENGINEERING DISCIPLINE & STRATEGIC FOCUS**

**Date:** 2026-02-09  
**Philosophy:** "Every feature you don't build is a feature you don't have to maintain."

---

# 🎯 KILL LIST PHILOSOPHY

## The Core Principle
> If a feature does not directly improve **trust in milk or money records**, kill it.

## Why This Matters
- **Focus** — 60 features done right > 200 features done poorly
- **Velocity** — Ship faster, iterate quicker
- **Maintenance** — Less code = fewer bugs
- **Trust** — Complexity is the enemy of reliability

---

# ❌ CATEGORY A: SUPER-APP TRAPS

## 🚫 Customer Milk Delivery Apps

### What it includes:
- Customer subscriptions
- Doorstep delivery tracking
- Customer wallets
- Delivery boy live tracking
- Route optimization
- GPS-based logistics

### Why competitors have it:
- DairyKhata built this
- Trying to be "one-stop solution"
- Chasing B2C revenue

### Why we kill it:

#### Engineering Cost
- Separate domain models (delivery ≠ collection)
- Realtime tracking infrastructure
- Notification storms (100s of customers)
- High bug surface (3x code complexity)
- GPS/maps integration
- Route planning algorithms

#### Business Reality
- **Logistics-heavy** — Different business model
- **Low margins** — Delivery is 5–10% margin business
- **Capital burn** — Requires delivery fleet
- **Different customer** — B2C vs B2B2F (dairy-farmer)

#### Focus Damage
- Pulls engineering away from ledger
- Divides product vision
- Confuses marketing message

**Verdict: ❌ Kill permanently**

---

## 🚫 Cattle Trading / Marketplace

### What it includes:
- Buy/sell cattle listings
- Image/video uploads
- In-app chat between buyers/sellers
- Price negotiation tools
- Cattle profiles (breed, age, weight)
- Rating/review system

### Why competitors have it:
- DairyKhata has full cattle marketplace
- Trying to monetize farmer network
- "Ecosystem play"

### Why we kill it:

#### Engineering Cost
- Huge schema surface (cattle attributes are complex)
- Media storage (images, videos = storage costs)
- Moderation system (prevent fraud)
- Chat infrastructure
- Payment escrow
- Dispute resolution system

#### Legal & Trust Risk
- **High fraud potential** — Cattle quality disputes
- **Legal liability** — Transaction disputes
- **Vet verification required** — Regulatory complexity
- **Trust damage** — One bad transaction = brand hit

#### Strategic Misalignment
- **Separate business entirely**
- **Zero relation to milk ledger**
- **Different user journey**

**Verdict: ❌ Kill (potential separate startup if ever)**

---

## 🚫 Inventory Management (Phase 1)

### What it includes:
- Feed inventory
- Medicine inventory
- Product stock tracking
- Purchase orders
- Stock alerts
- Multi-unit tracking
- Supplier management

### Why competitors have it:
- Liter has inventory
- "Complete dairy management"
- Cross-sell products to farmers

### Why we kill it (in MVP):

#### Engineering Cost
- State reconciliation (stock in/out)
- Multi-unit tracking (kg, liter, bags)
- Purchase/sale workflows
- Low stock alerts
- Expiry date tracking
- Separate accounting for inventory

#### Usage Reality
- **80% of small dairies ignore it**
- **Breaks UI simplicity**
- **Adds 30–40 screens**
- **Support nightmare** (stock mismatch issues)

#### Decision
- ❌ Kill in BASIC & PREMIUM
- ✅ Include in PREMIUM+ only (for large dairies)
- Only after ledger is proven bulletproof

**Verdict: ❌ Kill in MVP, ✅ Phase 2 Premium+ only**

---

# ❌ CATEGORY B: ERP BLOAT

## 🚫 HR / Payroll Management

### What it includes:
- Staff attendance tracking
- Salary slip generation
- Leave management
- Shift scheduling
- Performance reviews

### Why we kill it:

#### Engineering Cost
- Separate HR domain
- Payroll tax calculations
- Attendance algorithms
- Leave policy engine

#### Reality Check
- **Not core to milk-money trust**
- **Already solved elsewhere** (Zoho, Keka)
- **Small dairies = 1–3 staff** (overkill)

**Verdict: ❌ Kill permanently**

---

## 🚫 Multi-Location Warehouse Management

### What it includes:
- Multiple warehouse locations
- Stock transfer between locations
- Location-wise inventory
- Warehouse staff management

### Why we kill it:

- **Extremely complex** (ERP-level feature)
- **Small dairies = 1 location**
- **Different business** (large cooperatives)

**Verdict: ❌ Kill permanently**

---

# ❌ CATEGORY C: UI/UX ANTI-PATTERNS

## 🚫 Editable Balances

### What it is:
- Manual balance correction
- Direct debit/credit editing
- "Fix balance" button

### Why we kill it:

#### Trust Impact
🚨 **ABSOLUTE NO. THIS IS THE HILL WE DIE ON.**

- **Breaks append-only ledger**
- **Creates disputes** — "You changed my balance!"
- **Impossible audit trail**
- **Destroys trust permanently**

#### Technical Debt
- Violates core architecture
- Makes ledger verification impossible
- Opens backdoor for fraud

**Verdict: ❌ NEVER BUILD — This is our core moat**

---

## 🚫 Fancy Dashboards

### What it includes:
- Animated charts
- KPI overload (20+ metrics)
- Real-time graphs
- Heatmaps
- Gamified UI
- Complex filters

### Why we kill it:

#### UX Reality
- **Low literacy users confused**
- **Farmers want numbers, not charts**
- **Slows daily work** (milk entry should be fast)
- **Mental model mismatch** (paper register has no charts)

#### Engineering Cost
- Chart libraries (bundle size +200KB)
- Performance issues (rendering)
- Complex state management

**Verdict: ❌ Kill. Numbers > Charts always.**

---

# ❌ CATEGORY D: TECH DEBT MAGNETS

## 🚫 Blockchain / Tokens / NFTs

### What it includes:
- Milk NFTs
- Blockchain ledger
- Crypto payments
- Token rewards

### Why we kill it:

#### No Farmer Value
- **Zero comprehension** — Farmers don't understand crypto
- **No trust gain** — SQL ledger is verifiable enough
- **Regulatory nightmare** — Crypto laws unclear in India

#### Engineering Cost
- Blockchain integration complexity
- Gas fees (who pays?)
- Wallet management
- Security risks (private keys)

**Verdict: ❌ Kill permanently (marketing gimmick)**

---

## 🚫 AI Predictions (Early Stage)

### What it includes:
- Milk yield prediction
- Price forecasting
- Smart recommendations
- "AI Assistant"

### Why we kill it (now):

#### Data Reality
- **Garbage in = garbage out**
- **Requires years of clean data first**
- **Small sample size** (new dairy = no history)

#### Trust Risk
- **Wrong prediction = trust loss**
- **Farmers don't trust "black box"**
- **Prefer transparent calculations**

**Verdict: ❌ Kill until Year 3+ (after data moat built)**

---

# ❌ CATEGORY E: COMPLIANCE OVERREACH

## 🚫 Aadhaar Storage

### What it includes:
- Storing Aadhaar numbers in DB
- Aadhaar verification via UIDAI
- Biometric data storage

### Why we kill it:

#### Legal Nightmare
🚨 **ABSOLUTE NO**

- **UIDAI Act violations** — Strict regulations
- **Security liability** — Data breach = major fine
- **Trust damage** — Farmers fear misuse

#### Not Needed
- **Phone OTP is sufficient**
- **Aadhaar offers zero additional trust**

**Verdict: ❌ NEVER BUILD — Legal landmine**

---

# ❌ CATEGORY F: MARKETING DISTRACTIONS

## 🚫 Referral Systems (Early)

### What it includes:
- Cashback for referrals
- Coins/points system
- Rewards marketplace

### Why we kill it (in MVP):

#### Misaligned Incentives
- **Attracts wrong users** — People chasing rewards, not solving problems
- **Doesn't build product trust**
- **Complicates pricing** — Discounts hurt unit economics

#### Complexity
- Fraud prevention (fake referrals)
- Payout tracking
- Tax implications (TDS on rewards)

**Verdict: ❌ Kill in MVP, ✅ Consider post-PMF only**

---

# ❌ CATEGORY G: NICE-TO-HAVE, NOT MUST-HAVE

## 🚫 Voice Input / Voice Assistant

### What it includes:
- "DoodhAI" voice assistant
- Voice-to-text milk entry
- Voice commands

### Why we kill it:

#### Reality Check
- **Accents vary wildly** — Hindi/English/regional
- **Noisy dairy environment** — Cows, machines
- **Accuracy issues** — "6.2 FAT" vs "62 FAT"
- **Trust concern** — Farmers want to see numbers

#### Engineering Cost
- Speech recognition APIs (costs money)
- Language model training
- Error correction UX

**Verdict: ❌ Kill permanently (text/numeric input is reliable)**

---

## 🚫 Social Features (Likes, Comments, Community)

### What it includes:
- Dairy owner community
- Post updates
- Like/comment
- "Dairy of the month"

### Why we kill it:

- **Distraction from core job** (ledger trust)
- **Moderation overhead**
- **Not a social network**

**Verdict: ❌ Kill permanently**

---

# ✅ WHAT WE BUILD INSTEAD

## Focus on Core
1. **Ledger correctness** — 1000% reliability
2. **Offline resilience** — Works in 2G
3. **Simple large-number UX** — Paper-like
4. **Audit trail** — Every change visible
5. **Trust indicators** — Sync status, immutability badges

## Build Deep, Not Wide
- 60 features at 99.9% quality
- NOT 200 features at 60% quality

---

# 📊 KILL LIST SCORECARD

| Feature | Competitor Has | Farmer Value | Eng Cost | Trust Risk | Verdict |
|---------|----------------|--------------|----------|------------|---------|
| Delivery Apps | ✅ DairyKhata | ⚪ Low | 🔴 High | 🟡 Medium | ❌ KILL |
| Cattle Marketplace | ✅ DairyKhata | ⚪ Low | 🔴 Very High | 🔴 High | ❌ KILL |
| Editable Balances | ✅ Most | ❌ Negative | 🟢 Low | 🔴 CRITICAL | ❌ NEVER |
| Fancy Dashboards | ✅ Most | ⚪ Low | 🟡 Medium | 🟢 Low | ❌ KILL |
| Blockchain | ❌ None | ❌ Zero | 🔴 Very High | 🔴 High | ❌ KILL |
| AI Predictions | ⚪ Some | ⚪ Low (early) | 🔴 High | 🟡 Medium | ❌ DEFER |
| Aadhaar Storage | ⚪ Some | ⚪ Low | 🟡 Medium | 🔴 CRITICAL | ❌ NEVER |
| Voice Assistant | ❌ None | ⚪ Low | 🔴 High | 🟡 Medium | ❌ KILL |

---

# 🧠 FINAL ENGINEERING RULE

```
IF feature increases state mutation → DANGEROUS
IF feature stores derived values → DANGEROUS  
IF feature allows silent edits → NEVER BUILD
IF feature adds complexity without trust value → KILL
```

---

# 🎯 FOCUS STATEMENT

**We are not building dairy software.**  
**We are replacing a 40-year-old trust system.**

**If the feature doesn't make the ledger more trustworthy, we don't build it.**

---

*This kill list is a strategic asset.*  
*Saying NO is harder than saying YES.*  
*This is how leaders build category-defining products.*
