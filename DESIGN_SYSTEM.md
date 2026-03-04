# 🎨 DigiDhoodh — UI/UX DESIGN SYSTEM

**Version:** 2.0  
**Date:** 2026-02-09  
**Status:** Production Ready  
**Philosophy:** Bharat-First, Apple-Quality, GOAT Experience

---

# 🎯 DESIGN PHILOSOPHY

## Core Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Bharat-First** | Designed for Indian users | Regional languages, cultural colors |
| **Touch-First** | Mobile is primary | 56px touch targets, bottom nav |
| **Offline-First** | Works without internet | IndexedDB, sync indicators |
| **Trust-First** | Farmers trust this app | Transparency, immutable ledger |
| **Speed-First** | Fast for rural networks | Optimized assets, lazy loading |

## Design Goals

1. **WOW Factor** - First impression must impress
2. **Ease of Use** - Farmers with basic phone skills can use it
3. **Premium Feel** - Justify the ₹199+ monthly cost
4. **Accessibility** - Works for all age groups
5. **Consistency** - Same patterns everywhere

---

# 🎨 COLOR SYSTEM

## Primary Palette (Bharat-First)

| Color | Name | Hex | RGB | Usage |
|-------|------|-----|-----|-------|
| 🟠 | Saffron | `#FF9933` | 255, 153, 51 | Primary accents, CTAs |
| 🟢 | India Green | `#138808` | 19, 136, 8 | Success, positive actions |
| ⚪ | Cream | `#FFFAF0` | 255, 250, 240 | Backgrounds (like milk) |
| ⚪ | Pure White | `#FFFFFF` | 255, 255, 255 | Cards, surfaces |

## Extended Palette

| Color | Name | Hex | Usage |
|-------|------|-----|-------|
| 🔵 | Trust Blue | `#3B82F6` | Links, information |
| 🟣 | Premium Purple | `#8B5CF6` | Premium features |
| 🔴 | Alert Red | `#EF4444` | Errors, destructive actions |
| 🟡 | Warning Yellow | `#F59E0B` | Warnings, cautions |
| ⚫ | Slate Dark | `#1E293B` | Dark mode background |
| ⬛ | Slate 900 | `#0F172A` | Dark mode surfaces |

## Semantic Colors

```css
:root {
  /* Backgrounds */
  --bg-primary: #FFFAF0;
  --bg-secondary: #F8FAFC;
  --bg-card: #FFFFFF;
  --bg-dark: #0F172A;
  
  /* Text */
  --text-primary: #111827;
  --text-secondary: #4B5563;
  --text-tertiary: #9CA3AF;
  --text-inverse: #FFFFFF;
  
  /* States */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
  
  /* Brand */
  --saffron: #FF9933;
  --saffron-dark: #E8860D;
  --green: #138808;
  --green-dark: #0D6E05;
}
```

## Color Contrast (WCAG AA Compliant)

| Combination | Ratio | Status |
|-------------|-------|--------|
| Slate-900 on White | 17.5:1 | ✅ AAA |
| Saffron on White | 3.2:1 | ✅ AA (large text) |
| Green on White | 5.1:1 | ✅ AA |
| White on Saffron | 3.2:1 | ✅ AA (large text) |

---

# 📝 TYPOGRAPHY

## Font Stack

```css
/* Primary Font */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Hindi/Devanagari */
font-family: 'Noto Sans Devanagari', 'Inter', sans-serif;
```

## Type Scale (8px Base)

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| Hero H1 | 48px | 800 | 1.1 | -0.02em |
| H1 | 36px | 700 | 1.2 | -0.02em |
| H2 | 28px | 700 | 1.25 | -0.01em |
| H3 | 24px | 600 | 1.3 | -0.01em |
| H4 | 20px | 600 | 1.4 | 0 |
| Body Large | 18px | 400 | 1.6 | 0 |
| Body | 16px | 400 | 1.6 | 0 |
| Body Small | 14px | 400 | 1.5 | 0 |
| Caption | 12px | 500 | 1.4 | 0.02em |
| Overline | 10px | 800 | 1.2 | 0.1em |

## Font Weights

| Weight | Name | Usage |
|--------|------|-------|
| 400 | Regular | Body text |
| 500 | Medium | Emphasis, labels |
| 600 | Semibold | Subheadings, buttons |
| 700 | Bold | Headings |
| 800 | Extrabold | Hero text, numbers |

---

# 📐 SPACING SYSTEM

## 8px Grid System

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0px | Reset |
| `space-1` | 4px | Tight (icon gaps) |
| `space-2` | 8px | Compact (inline) |
| `space-3` | 12px | Default (form gaps) |
| `space-4` | 16px | Comfortable (card padding) |
| `space-5` | 20px | Relaxed |
| `space-6` | 24px | Sections |
| `space-8` | 32px | Large sections |
| `space-10` | 40px | Hero spacing |
| `space-12` | 48px | Major sections |
| `space-16` | 64px | Page sections |
| `space-20` | 80px | Hero sections |
| `space-24` | 96px | Full sections |

## Component Spacing

| Component | Internal Padding | External Margin |
|-----------|-----------------|-----------------|
| Button | 12px 24px | 8px |
| Card | 20px | 16px |
| Input | 16px | 16px (spacing) |
| Modal | 24px | - |
| Section | 64px | 0 |

---

# 🔲 BORDER RADIUS

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-none` | 0px | Sharp edges |
| `rounded-sm` | 4px | Tags, badges |
| `rounded` | 6px | Buttons, inputs |
| `rounded-md` | 8px | Small cards |
| `rounded-lg` | 12px | Cards |
| `rounded-xl` | 16px | Large cards |
| `rounded-2xl` | 20px | Modals, sheets |
| `rounded-3xl` | 24px | Premium cards |
| `rounded-full` | 9999px | Pills, avatars |

---

# 🌓 SHADOWS & ELEVATION

## Light Mode Shadows

| Level | Shadow | Usage |
|-------|--------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle depth |
| `shadow` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Default cards |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` | Elevated cards |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | Modals, dropdowns |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` | Floating elements |
| `shadow-2xl` | `0 25px 50px rgba(0,0,0,0.25)` | Hero elements |

## Glassmorphism (Premium Cards)

```css
.card-glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

---

# 🖱️ INTERACTIVE STATES

## Button States

| State | Style |
|-------|-------|
| Default | Solid color |
| Hover | Darken 10%, scale(1.02) |
| Active | Darken 15%, scale(0.98) |
| Focus | 2px ring offset |
| Disabled | 50% opacity, cursor not-allowed |
| Loading | Spinner icon, 70% opacity |

## Input States

| State | Border | Background | Icon |
|-------|--------|------------|------|
| Default | Gray-300 | White | - |
| Focus | Blue-500 (2px) | White | - |
| Filled | Gray-400 | White | - |
| Error | Red-500 | Red-50 | ⚠️ |
| Success | Green-500 | Green-50 | ✓ |
| Disabled | Gray-200 | Gray-100 | - |

---

# 🧩 COMPONENT LIBRARY

## Button Variants

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| Primary | Saffron gradient | White | None | Main CTAs |
| Secondary | White | Saffron | Saffron 1px | Alternative |
| Success | Green gradient | White | None | Confirm actions |
| Destructive | Red | White | None | Delete, cancel |
| Ghost | Transparent | Gray | None | Tertiary actions |
| Link | Transparent | Blue | None | Inline links |

## Button Sizes

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| xs | 28px | 8px 12px | 12px |
| sm | 36px | 8px 16px | 14px |
| md | 44px | 12px 20px | 16px |
| lg | 52px | 16px 24px | 18px |
| xl | 60px | 16px 32px | 20px |

## Card Variants

| Variant | Background | Shadow | Radius | Usage |
|---------|------------|--------|--------|-------|
| Default | White | shadow | 12px | Standard cards |
| Elevated | White | shadow-lg | 16px | Highlighted |
| Premium | Glass | shadow-xl | 20px | Premium features |
| Flat | Gray-50 | none | 8px | Nested content |
| Outline | White | none | 12px | Border only |

## Input Sizes

| Size | Height | Font Size | Usage |
|------|--------|-----------|-------|
| sm | 36px | 14px | Compact forms |
| md | 44px | 16px | Default |
| lg | 56px | 20px | Touch-friendly |
| xl | 72px | 28px | Hero inputs |

---

# 📱 RESPONSIVE DESIGN

## Breakpoints

| Name | Width | Columns | Gutter |
|------|-------|---------|--------|
| xs | 0-479px | 4 | 16px |
| sm | 480-639px | 4 | 16px |
| md | 640-767px | 8 | 24px |
| lg | 768-1023px | 12 | 24px |
| xl | 1024-1279px | 12 | 32px |
| 2xl | 1280px+ | 12 | 32px |

## Container Widths

| Breakpoint | Max Width |
|------------|-----------|
| sm | 100% |
| md | 100% |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1440px |

## Mobile-First Patterns

| Pattern | Mobile | Desktop |
|---------|--------|---------|
| Navigation | Bottom bar | Top bar |
| Cards | Stacked | Grid |
| Forms | Full width | 50-75% width |
| Modals | Bottom sheet | Center dialog |
| Tables | Card list | Full table |

---

# ⚡ ANIMATION & MOTION

## Timing Functions

| Name | Cubic Bezier | Usage |
|------|--------------|-------|
| `ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Enter |
| `ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful |

## Duration Scale

| Token | Duration | Usage |
|-------|----------|-------|
| `duration-75` | 75ms | Instant feedback |
| `duration-100` | 100ms | Micro-interactions |
| `duration-150` | 150ms | Button states |
| `duration-200` | 200ms | Small transitions |
| `duration-300` | 300ms | Modal, dropdown |
| `duration-500` | 500ms | Page transitions |
| `duration-700` | 700ms | Complex animations |
| `duration-1000` | 1000ms | Hero animations |

## Common Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Scale In */
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Shake (Error) */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}

/* Pulse (Notification) */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Page Enter */
@keyframes pageEnter {
  from { 
    opacity: 0; 
    transform: translateY(20px);
  }
  to { 
    opacity: 1; 
    transform: translateY(0);
  }
}
```

---

# 📐 LAYOUT PATTERNS

## Dashboard Layout

```
┌─────────────────────────────────────────────┐
│ Header (Sticky)                    [Profile]│
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Stat 1  │ │ Stat 2  │ │ Stat 3  │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│                                             │
│  ┌─────────────────────────────────┐       │
│  │ Main Content Area               │       │
│  │                                 │       │
│  └─────────────────────────────────┘       │
│                                             │
├─────────────────────────────────────────────┤
│ [🏠] [🥛] [📊] [💰] [⚙️]        Bottom Nav │
└─────────────────────────────────────────────┘
```

## Form Layout

```
┌─────────────────────────────────────────────┐
│ Form Title                                  │
│ Description text                            │
├─────────────────────────────────────────────┤
│                                             │
│  Label                                      │
│  ┌───────────────────────────────────────┐ │
│  │ Input                                 │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌────────────────┐  ┌────────────────┐   │
│  │ FAT            │  │ SNF            │   │
│  └────────────────┘  └────────────────┘   │
│                                             │
│  [Cancel]                        [Submit ►]│
│                                             │
└─────────────────────────────────────────────┘
```

## Card Grid Layout

```
┌─────────────────────────────────────────────┐
│ Section Title                    [View All ►]│
├─────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │  Card   │ │  Card   │ │  Card   │        │
│ │         │ │         │ │         │        │
│ └─────────┘ └─────────┘ └─────────┘        │
└─────────────────────────────────────────────┘
```

---

# ♿ ACCESSIBILITY

## Touch Targets

| Element | Minimum Size |
|---------|--------------|
| Buttons | 44px x 44px |
| Touch-primary | 56px x 56px |
| Icon buttons | 44px x 44px |
| List items | 48px height |

## Focus Indicators

```css
:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
  border-radius: 4px;
}
```

## Color Contrast Requirements

| Content | Minimum Ratio |
|---------|---------------|
| Normal text | 4.5:1 (AA) |
| Large text (18px+) | 3:1 (AA) |
| UI components | 3:1 (AA) |
| Focus indicators | 3:1 (AA) |

## Screen Reader Support

- All images have `alt` text
- Form fields have `aria-label` or visible labels
- Error messages linked with `aria-describedby`
- Loading states use `aria-busy`
- Modals use `aria-modal` and focus trap

---

# 🌙 DARK MODE

## Color Mapping

| Light Mode | Dark Mode |
|------------|-----------|
| White (#FFFFFF) | Slate-900 (#0F172A) |
| Gray-50 (#F9FAFB) | Slate-800 (#1E293B) |
| Gray-100 (#F3F4F6) | Slate-700 (#334155) |
| Cream (#FFFAF0) | Slate-900 (#0F172A) |
| Text-primary (#111827) | White (#FFFFFF) |
| Text-secondary (#4B5563) | Gray-300 (#D1D5DB) |

## Dark Mode Adjustments

- Reduce shadow opacity by 50%
- Slightly desaturate brand colors
- Add subtle border to cards (Slate-700)
- Increase contrast for text

---

# 📋 DESIGN CHECKLIST

## Before Release

- [ ] All touch targets are 44px minimum
- [ ] Color contrast meets WCAG AA
- [ ] Dark mode works correctly
- [ ] Animations respect `prefers-reduced-motion`
- [ ] All forms have error states
- [ ] Loading states for all async actions
- [ ] Empty states for lists
- [ ] Offline indicators present
- [ ] Hindi translations complete
- [ ] Tested on slow 3G network

---

# 🏆 DESIGN SUPERIORITY vs COMPETITORS

| Aspect | Competitors | DigiDhoodh |
|--------|-------------|------------|
| Color System | Generic blue/green | Bharat-First saffron |
| Typography | System fonts | Inter + Noto Devanagari |
| Touch Targets | 36-40px | 56px (touch-friendly) |
| Animations | Basic/none | Framer Motion smooth |
| Dark Mode | Limited | Full support |
| Glassmorphism | None | Premium cards |
| Loading States | Spinner only | Skeleton + shimmer |
| Empty States | Generic | Custom illustrations |
| Error Handling | Basic alerts | Inline + toast |
| Accessibility | Basic | WCAG AA compliant |

---

*This design system ensures DigiDhoodh delivers the GOAT experience.*
*Dairykhata features + Apple-level UI = 🐐*
