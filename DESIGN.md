# Design System: DigiDhoodh
**Project ID:** digidhoodh-ultimate

## 1. Visual Theme & Atmosphere

Airy, fresh, and organic. The design evokes the purity of fresh dairy with a clean, modern SaaS aesthetic that feels welcoming to Indian dairy farmers. The atmosphere strikes a balance between professional business tool and warm, approachable digital product—think "modern Indian dairy farm" meets "Google Sheets." The use of subtle paper textures, gentle gradients, and soft shadows creates depth without heaviness, while the dairy-green primary color anchors everything in trust and freshness.

## 2. Color Palette & Roles

### Primary Colors
- **Dairy Fresh Green (#22c55e)** - The signature color. Used for primary actions, active states, success indicators, and the brand's main accent.
- **Dairy Deep (#15803d)** - Darker variant for hover states, headers, and text that needs higher contrast.
- **Dairy Premium (#166534)** - The richest green for premium badges and key brand elements.

### Secondary Colors
- **Saffron Warm (#f97316)** - Warm Indian spice orange. Used for promotional calls-to-action, premium features, and accents that need to stand out from the dairy green.
- **Earth Brown (#ac7651)** - Warm, organic brown. Used for secondary text, muted elements, and to ground the design.
- **Terra Clay (#ef4444)** - Soft red for destructive actions, errors, and alerts (kept muted rather than harsh).

### Neutrals
- **Cream White (#fefcf3)** - Warm off-white background. Not stark white—feels more natural and less clinical.
- **Paper (#faf6f3)** - Slightly darker cream for cards and elevated surfaces.
- **Stone (#78716c)** - Muted brownish-gray for secondary text and borders.
- **Earth Ink (#1c1917)** - Near-black for primary text. Not pure black—warmer and softer.

### Semantic Colors
- **Success Green (#22c55e)** - Inline with dairy palette.
- **Warning Amber (#f59e0b)** - For alerts and warnings.
- **Error Terracotta (#ef4444)** - Softened red for errors.
- **Info Blue (#3b82f6)** - For informational elements.

## 3. Typography Rules

### Font Stacks
- **Primary:** 'Outfit' - Modern, friendly geometric sans-serif. The main UI font.
- **Display:** 'Playfair Display' - Elegant serif for headlines and emphasis.
- **Indian Script Support:** 'Noto Sans Devanagari' - Full Devanagari/Hindi character support included.

### Hierarchy
- **Display (Headers):** 2-3rem, font-weight 700. Bold, confident, but not shouting.
- **Section Headers:** 1.5-1.75rem, font-weight 600.
- **Body:** 1rem, font-weight 400, line-height 1.5 for readability.
- **Labels/Small:** 0.875rem, font-weight 500 for labels and buttons.
- **Captions:** 0.75rem, font-weight 400, muted color.

### Letter-Spacing
- Headers: Slightly tight (-0.02em to -0.025em) for a modern feel.
- Body: Normal tracking (0).
- Labels: Slightly loose (0.025em) for readability in uppercase.

## 4. Component Stylings

### Buttons
- **Primary (Green):** Rounded-xl (12px radius), dairy-500 background, white text, subtle shadow on hover. Active state darkens to dairy-600.
- **Secondary (Outline):** Rounded-xl, transparent background, dairy-500 border, dairy-500 text. Hover fills with dairy-50.
- **Ghost:** Rounded-xl, no border, transparent. Hover adds subtle background.
- **Danger:** Rounded-xl, terra-500 background. Hover darkens to terra-600.
- **Tap Target:** Minimum 44px height for mobile touch accessibility.

### Cards/Containers
- **Default Card:** Rounded-2xl (16px radius), cream-50 background in light mode, subtle warm shadow.
- **Glass Panel:** Rounded-2xl, frosted glass effect with blur and semi-transparent background.
- **Elevated Card:** Rounded-2xl, white/dark background, warm-lg shadow for lift.
- **Surface Texture:** Subtle dot grid pattern overlay at 2% opacity for tactile feel.

### Inputs/Forms
- **Text Input:** Rounded-xl, subtle border (stone-200), cream background. Focus ring in dairy-500.
- **Select/Dropdown:** Rounded-xl, matches input styling.
- **Search:** Rounded-full pill shape for the search bar specifically.
- **Labels:** Floating or above, font-weight 500, muted color.

### Navigation
- **Sidebar (Desktop):** Fixed left sidebar, collapsible 80px icon-only to 280px full. Glass effect background.
- **Bottom Nav (Mobile):** Fixed bottom with 5 key items: Home, Milk, Farmers, Bills, Settings.
- **Nav Items:** Rounded-xl, icon + label, subtle active indicator (green background).

### Badges & Tags
- **Success Badge:** Rounded-full, dairy-100 background, dairy-700 text.
- **Premium Badge:** Rounded-full, saffron gradient background.
- **Warning Badge:** Rounded-full, amber-100/amber-700.
- **Count Badge:** Rounded-full, small circle with count number (red for notifications).

## 5. Layout Principles

### Spacing System
- **Base Unit:** 4px (matches Tailwind default).
- **Spacing Scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- **Card Padding:** p-4 to p-6 (16-24px).
- **Section Gaps:** Gap-4 to gap-8 (16-32px).

### Responsive Breakpoints
- **Mobile:** < 640px - Single column, bottom nav, full-width content.
- **Tablet:** 640px - 1024px - Flexible grid, possibly 2 columns.
- **Desktop:** > 1024px - Fixed sidebar, multi-column layouts, optional right panels.
- **Large:** > 1280px - Max-width containers (1400px), whitespace-focused.

### Grid & Alignment
- **Container Max:** 1400px centered for main content.
- **Grid System:** 12-column grid foundation with Tailwind.
- **Card Grid:** auto-fit with minmax(280px, 1fr) for responsive cards.
- **Content Padding:** 16px mobile, 24px tablet, 32px+ desktop.

### Visual Effects
- **Shadows:** Warm-tinted (slight brown/orange undertone) rather than pure gray.
- **Borders:** Subtle, 1px, slightly warm stone-200/800.
- **Gradients:** Very subtle diagonal, used sparingly for premium elements.
- **Texture:** 2% opacity noise/dot overlay adds organic feel.
- **Animations:** Fade-in-up for content, scale-in for modals, smooth 200-300ms transitions.

### Dark Mode
- **Background:** Near-black warm (#1c1917), not pure black.
- **Cards:** Elevated dark (#292524), subtle.
- **Text:** Warm white, not pure white.
- **Shadows:** Reduced, lighter.
- **Accents:** Desaturated versions of all colors.

## 6. Mobile-Specific Considerations

### Full-Width Mobile
- No fixed margins on mobile.
- Bottom navigation is primary nav (5 items: Home, Milk, Farmers, Bills, Settings).
- Touch targets minimum 44px.
- Padding: 16px horizontal.
- Cards: Full-width with 16px margins.
- Stack vertically by default.

### Desktop-Sidebar Approach
- Fixed left sidebar with collapse toggle.
- Main content area adjusts based on sidebar width (80px collapsed, 280px expanded).
- Desktop does NOT overlap content with sidebar.