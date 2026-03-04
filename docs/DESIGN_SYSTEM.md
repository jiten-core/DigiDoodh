# DigiDhoodh - Bharat-First Design System

## Core Philosophy
**"Yeh app toh apni hi lagti hai."**

If a user has to think, the design has failed.

---

## Color Palette (LOCKED - Non-Negotiable)

| Color | Hex | Usage |
|-------|-----|-------|
| Saffron Orange | `#FF9933` | Primary actions ONLY |
| Farmer Green | `#228B22` | Success, confirmations |
| Milk Cream | `#FFF8E7` | Main background (paper-ledger feel) |
| Deep Black | `#1A1A1A` | Text, icons (maximum readability) |
| Pure White | `#FFFFFF` | Cards, inputs |
| Alert Red | `#DC143C` | Errors ONLY |
| Golden Yellow | `#FFD700` | Premium badges (rare use) |

### Rules
- ❌ No gradients
- ❌ Minimal shadows only where needed
- ✅ Flat, 2G-optimized UI

---

## Typography

```
Primary: Noto Sans Devanagari (Hindi)
Secondary: Roboto (English)

Body text: 18px minimum
Large numbers: 32px (central, bold)
Line height: 1.6
```

**Numbers must be big, bold, and central.**

---

## Touch Targets (STRICT)

| Element | Size |
|---------|------|
| Buttons | 56px height, full-width primary |
| Inputs | 56px height |
| Navigation icons | 32px |
| Standard icons | 24px |
| Minimum touch area | 56×56px |

---

## Component Classes

### Buttons
```html
<!-- Primary Action - Saffron -->
<button class="btn-primary">Record Milk</button>

<!-- Success/Confirm - Farmer Green -->
<button class="btn-success">Confirm Payment</button>
```

### Inputs
```html
<input class="input-field" placeholder="Enter quantity..." />
```

### Cards
```html
<div class="card-simple">
  <span class="number-display">₹12,450</span>
</div>
```

### Offline Banner
```html
<div class="offline-banner">
  <WifiOff /> Offline - 3 entries pending sync
</div>
```

---

## Bottom Navigation (Always Visible)

| Icon | Screen | Hindi |
|------|--------|-------|
| 🏠 | Home | होम |
| 📝 | Record | रिकॉर्ड |
| 🐄 | Cattle | पशु |
| 💰 | Money | पैसा |

---

## Decimals Rule

| Context | Display |
|---------|---------|
| Daily use | Rounded values: `12L`, `₹563` |
| Confirmations | Exact: `12.5L`, `₹563.50` |
| Reports | Exact with 2 decimals |
| Statements | Full precision |

---

## UI Metaphors (Familiar to India)

- ✅ WhatsApp-style lists & chat layouts
- ✅ Paper ledger structure
- ✅ Photo album–style records
- ✅ QR codes for identity
- ✅ Large numeric blocks (not dense tables)

---

## Offline UX (STRICT RULES)

1. **Explicit offline banner** - Always visible when offline
2. **Pending action count** - Show exactly how many entries pending
3. **"Sync now" button** - Manual sync option
4. **Never fake loading** - Be honest about data state
5. **Last sync time** - Show when last successful sync happened

---

## Language & Copy

- **Primary**: Hindi (Devanagari)
- **Secondary**: English
- **Tone**: Respectful ("Aap")
- **Sentences**: Short, clear, no technical words
- **Vibe**: "Your digital neighbor who knows your dairy"

---

## HARD NOs (What NOT to Add)

- ❌ Dark patterns
- ❌ Dense analytics dashboards
- ❌ Tiny text (below 18px)
- ❌ English-only UI
- ❌ Features that look powerful but confuse
- ❌ Unnecessary AI gimmicks

**If a feature increases confusion → remove it.**

---

## Target Feeling

> "Yeh app toh apni hi lagti hai."

Works on:
- ₹5,000–₹15,000 phones
- 2G/3G networks
- Frequent offline usage
- One-thumb operation

---

*Made with ❤️ in Bharat 🇮🇳*
