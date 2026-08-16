---
name: SS4 Chess League
description: Connecting Academic Chess Communities through "The Varsity Arena" Design System
colors:
  primary: "#1A56C4"
  primary-hover: "#1545A2"
  primary-container: "#E8EFFF"
  on-primary-container: "#00194B"
  accent: "#B84D00"
  accent-bright: "#E8640A"
  accent-container: "#FFEEDB"
  on-accent-container: "#2E0E00"
  neutral-bg: "#F6F4F0"
  neutral-text: "#111111"
  surface: "#FFFFFF"
  surface-variant: "#F0EEEA"
  dark-surface: "#0B192C"
  outline: "#CCCCCC"
  outline-variant: "#EAEAEA"
  success: "#059669"
  success-container: "#D1FAE5"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "0em"
  body:
    fontFamily: "Outfit, Avenir Next, Avenir, Helvetica Neue, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label / micro-label / eyebrow / eyebrow tags / badges / chips / metadata pills:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.05em"
    textTransform: "uppercase"
    style: "Solid high-contrast light surface design (NO NEON, NO GLOW, NO DARK MASKS)"
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    minHeight: "48px"
    padding: "10px 24px"
    fontWeight: 700
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    border: "1px solid {colors.primary}"
    rounded: "{rounded.lg}"
    minHeight: "48px"
    padding: "10px 24px"
  tab-item-active:
    backgroundColor: "rgba(26, 86, 196, 0.05)"
    borderBottom: "2px solid {colors.primary}"
    textColor: "{colors.primary}"
    roundedTop: "{rounded.md}"
  card-varsity:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.outline-variant}"
    rounded: "{rounded.xl}"
    boxShadow: "0 2px 8px rgba(0,0,0,0.015)"
---

# Design System: SS4 Chess League - "The Varsity Arena"

## 1. Overview & Creative Identity

**Creative North Star: "The Varsity Arena"**

SS4 is styled as a premium, high-contrast varsity sports community. Inspired by collegiate athletic divisions, high-stakes tournament standings, and classic sports typography, the design system combines high typographic density, structural framing, and a restrained color palette. Every screen is crisp, bold, and clear.

### Core Design Principles:
1. **High-Contrast Editorial Typography:** Heavy geometric headings (`Space Grotesk`) paired with highly legible body copy (`Outfit` / `Avenir Next`) and uppercase micro-labels.
2. **Restrained Color Strategy (The Accent Rarity Rule):** 80%+ of surface area uses neutral cream (`#F6F4F0`), carbon ink (`#111111`), and pure white (`#FFFFFF`). Primary Varsity Blue (`#1A56C4`) and Championship Orange (`#B84D00` / `#E8640A`) are strictly reserved for interactive controls, highlights, active tabs, and divisional markers.
3. **Flat-First Structural Surfaces (The Flat-First Rule):** Avoid heavy, muddy drop shadows or gratuitous page-wide glassmorphism. Surfaces are defined by crisp 1px borders (`#EAEAEA` or `#CCCCCC`) and ambient, low-opacity elevation glows (`0 2px 8px rgba(0,0,0,0.015)`).
4. **Touch-First Accessibility & Fitts's Law:** All interactive targets maintain a minimum height of 48px on mobile, explicit keyboard focus rings (`focus-visible:ring-2 focus-visible:ring-brand-primary`), and full WCAG AA contrast compliance (minimum 4.5:1 text-to-background contrast ratio).

---

## 2. Color System & Semantic Palette

### Primary Palette
- **Varsity Blue** (`#1A56C4`): Primary actions, active tab borders, selected state indicators, links.
- **Varsity Blue Hover** (`#1545A2`): Darkened shade for active/hover state feedback.
- **Primary Container Tint** (`#E8EFFF`): Soft blue surface tint for active tab backgrounds and selected table rows.
- **On-Primary Container** (`#00194B`): Dark navy contrast text on primary container surfaces.

### Accent Palette
- **Championship Orange (WCAG AA Safe)** (`#B84D00`): Used for warning highlights, status updates, and division markers on light backgrounds.
- **Championship Orange Bright** (`#E8640A`): Used strictly on dark backdrops (`#0B192C` / `#111111`) where contrast ratio remains compliant.
- **Secondary Container Tint** (`#FFEEDB`): Soft orange background for highlight badges and warning chips.
- **On-Secondary Container** (`#2E0E00`): Dark brown contrast text on orange container surfaces.

### Neutrals & Surface Hierarchy
- **Ink Black** (`#111111`): Primary headings, body copy, hero headers.
- **Carbon Navy** (`#0B192C` / `#0F172A`): Dark hero containers, high-stakes tournament headers, footer backdrop.
- **League Cream** (`#F6F4F0`): Global page background surface.
- **Pure White** (`#FFFFFF`): Card surfaces, modal containers, standings table body.
- **Surface Variant Gray** (`#F0EEEA` / `#F8F9FA`): Segmented control backgrounds, sticky table headers, secondary tags.
- **Outline Border** (`#CCCCCC`): Form input borders, key component dividers.
- **Outline Variant Light** (`#EAEAEA`): Card borders, table row dividers, subtle card separators.

### Semantic Palette
- **Success / Winner Green** (`#059669` / `#0D9488`): Completed win states, confirmed registrations, qualified tournament advancing spots.
- **Success Container** (`#D1FAE5`): Soft green background for qualified/winning tags.
- **On-Success Text** (`#065F46`): Dark green text for success chips.
- **Error / Forfeit Red** (`#DC2626` / `#EF4444`): Forfeit match status, disqualifications, live recording indicators.

### Named Rules:
- **The Accent Rarity Rule:** Primary blue and orange accent colors MUST occupy less than 15% of the total screen space. Their scarcity makes them meaningful.
- **WCAG AA Contrast Mandate:** All body text and label text must maintain at least a 4.5:1 contrast ratio against its background. Text on primary blue buttons MUST be pure white (`#FFFFFF`). Text on orange accents MUST use WCAG-safe `#B84D00` on light surfaces or `#FFFFFF` on dark surfaces.

---

## 3. Typography & Hierarchy

### Fonts
- **Display & Headings:** `Space Grotesk` (Google Fonts, sans-serif) - Weights: `800` (ExtraBold), `900` (Black).
- **Body & Controls:** `Outfit` / `Avenir Next` (sans-serif) - Weights: `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold).

### Typographic Scale & Hierarchy
| Hierarchy Level | Font Family | Size | Weight | Line Height | Letter Spacing | Usage / Guidelines |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display / Hero** | Space Grotesk | `clamp(2rem, 5vw, 3.5rem)` | 900 | 1.1 | `-0.02em` | Main hero headers, page titles. |
| **Section Headline (H2)** | Space Grotesk | `1.5rem` - `1.75rem` | 800 | 1.2 | `-0.015em` | Major page section titles. |
| **Component Title (H3)** | Space Grotesk | `1.125rem` - `1.25rem` | 800 | 1.3 | `0em` | Card headers, table section titles. |
| **Subhead (H4)** | Space Grotesk / Outfit | `1rem` - `1.1rem` | 700 | 1.3 | `0em` | Sub-section headers, player names. |
| **Body Large** | Outfit / Avenir Next | `1rem` (16px) | 400 / 500 | 1.5 | `0em` | Hero descriptions, key summary text. |
| **Body Regular** | Outfit / Avenir Next | `0.875rem` (14px) | 400 / 500 | 1.5 | `0em` | Standard paragraph text (limit to 65ch). |
| **Caption / Small** | Outfit / Avenir Next | `0.75rem` (12px) | 500 / 600 | 1.4 | `0.01em` | Meta information, secondary stats. |
| **Micro-Label** | Space Grotesk / Outfit | `0.65rem` - `0.75rem` | 800 | 1.2 | `0.05em` | Uppercase badge labels, table headers. |

---

## 4. Elevation, Texture & Surface Styling

SS4 is **flat-by-default**, emphasizing clean structural borders over heavy shadows.

### Elevation Vocabulary
- **Flat Surface (`surface-flat`):** `background: #FFFFFF; border: 1px solid #EAEAEA; box-shadow: none;`
- **Ambient Glow (`varsity-card`):** `background: #FFFFFF; border: 1px solid #EAEAEA; box-shadow: 0 2px 8px rgba(0,0,0,0.015);`
- **Hover Lift (`varsity-card:hover`):** `border-color: #1A56C4; box-shadow: 0 4px 16px rgba(26,86,196,0.05); transform: translateY(-1px);`
- **Overlay Elevation (Modals/Drawers):** `background: #FFFFFF; border: 1px solid #EAEAEA; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);`

### Decorative Textures & Watermarks
- **Stitched Varsity Patch (`varsity-patch`):** `border: 2px dashed #1A56C4; box-shadow: inset 0 0 0 2px #FFFFFF, 0 4px 12px rgba(0,0,0,0.05); background: #F6F4F0;`
- **Radial Dot Grid Watermark (`bg-radial-grid`):** `background-image: radial-gradient(#111111 1px, transparent 1px); background-size: 10px 10px; opacity: 0.05;`
- **Chess Tile Watermark (`watermark-chess`):** `background-image: radial-gradient(#EAEAEA 1px, transparent 1px); background-size: 16px 16px;`

### Named Rules:
- **The Flat-First Rule:** Never stack multiple shadows or use dark drop shadows. Use light gray borders (`#EAEAEA` / 1px) to divide layout blocks.

---

## 5. Comprehensive Component Specifications

### 5.1 Buttons & Action Elements

All buttons follow "The Varsity Arena" structured corner guidelines, maintaining minimum touch target sizes and clear active feedback.

#### A. Varsity Primary Button (Filled)
- **Class / Style:** `.varsity-btn-primary`
- **Background:** `#1A56C4` Varsity Blue
- **Text:** `#FFFFFF`, Font: `Outfit` Bold (700)
- **Corners:** `rounded-xl` (`16px`) or `rounded-full` (`9999px`)
- **Dimensions:** Min-height `48px`, Padding `10px 24px` (`py-2.5 px-6`)
- **Hover:** Background `#1545A2`, Shadow `0 2px 8px rgba(26, 86, 196, 0.25)`, `translateY(-0.5px)`
- **Active:** `transform: scale(0.98)`
- **Focus:** `focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2`

#### B. Varsity Secondary Button (Outlined)
- **Class / Style:** `.varsity-btn-secondary`
- **Background:** `transparent`
- **Border:** `1px solid #1A56C4`
- **Text:** `#1A56C4`, Font: `Outfit` Bold (700)
- **Corners:** `rounded-xl` (`16px`) or `rounded-full` (`9999px`)
- **Dimensions:** Min-height `48px`, Padding `10px 24px`
- **Hover:** Background `rgba(26, 86, 196, 0.06)`, Border `#1A56C4`, `translateY(-0.5px)`
- **Active:** `transform: scale(0.98)`

#### C. Varsity Accent Button (Championship Orange)
- **Background:** `#B84D00` (WCAG AA compliant)
- **Text:** `#FFFFFF`, Font: `Outfit` Bold (700)
- **Hover:** Background `#963F00`, Shadow `0 2px 8px rgba(184, 77, 0, 0.25)`

#### D. Dark Hero Buttons (White Outline / White Solid)
- **White Outline:** `bg-white/10 text-white border border-white/25 hover:bg-white/20 hover:border-white/40`
- **White Solid:** `bg-white text-[#111111] hover:bg-gray-100 hover:shadow-lg`

#### E. Minimal / Ghost Button
- **Class / Style:** `bg-transparent text-[#111111] hover:text-brand-primary min-h-[48px] px-4 border-none shadow-none`

---

### 5.2 Primary Outer Page Tabs ("Tables | Fixtures | Knockout Bracket | Results | Rules & Schedule | Admin")

Mandatory layout for all top-level outer page section navigation across SS4 (e.g. Tournament Page main tabs). Extracted directly from the Tournament Page sticky tab bar.

#### A. Sticky Tab Bar Container
- **Positioning:** `sticky top-16 lg:top-20 z-40`
- **Surface:** `bg-white/95 backdrop-blur-md`
- **Border:** `border-b border-gray-200/90` (`#E5E7EB`)
- **Padding & Layout:** `px-3 sm:px-6 md:px-12 lg:px-16 shadow-xs`
- **Scroll Container:** `max-w-5xl mx-auto flex gap-2 sm:gap-6 overflow-x-auto no-scrollbar touch-pan-x py-1`

#### B. Individual Primary Tab Button Specification
- **Min Target Size:** Min-height `48px`, Padding `10px 14px` (`px-3.5 py-3`)
- **Typography:** `font-black` (700/900), `whitespace-nowrap`, `text-sm sm:text-base`, `Space Grotesk` / `Outfit`
- **Corners:** Top-rounded `rounded-t-xl` (`12px`)
- **Active State:**
  - Border: `border-b-2 border-brand-primary` (`#1A56C4`)
  - Text Color: `text-brand-primary` (`#1A56C4`)
  - Background Tint: `bg-brand-primary/5` (`rgba(26, 86, 196, 0.05)`)
- **Inactive State:**
  - Border: `border-b-2 border-transparent`
  - Text Color: `text-gray-500` (`#6B7280`)
  - Hover: `hover:text-[#111111] hover:bg-gray-50/50`
- **Tab Icon:** 16px × 16px inline SVG icon preceding label (`text-brand-primary` when active, `text-gray-400` when inactive).

---

### 5.3 Secondary Inner Page Segmented Tabs ("Tables | Knockout Matrix | Fixtures")

Mandatory layout for all secondary inner-view switching inside cards, panels, or nested views.

#### A. M3 Segmented Button Container (`.m3-segmented-container`)
- **Display:** `flex` row
- **Background:** `#F0EEEA` (`var(--color-m3-surface-variant)`)
- **Border:** `1px solid #CCCCCC` (`var(--color-m3-outline)`)
- **Corners:** `rounded-full` (`100px`)
- **Padding:** `2px`

#### B. M3 Segmented Item (`.m3-segmented-item`)
- **Height:** `38px`
- **Corners:** `rounded-full` (`100px`)
- **Typography:** `font-size: 0.72rem`, `font-weight: 800`, `font-family: Space Grotesk`, `text-transform: uppercase`, `letter-spacing: 0.02em`
- **Active State:** Background `#FFFFFF`, Text `#1A56C4` Varsity Blue, Box Shadow `0 1px 3px rgba(0,0,0,0.08)`
- **Inactive State:** Background `transparent`, Text `#444444`, Hover `rgba(68, 68, 68, 0.04)`

#### C. Notebook Binder Tabs (`.binder-tab`)
- **Layout:** Vertical list tab item
- **Border:** `border-left: 4px solid transparent`
- **Active State:** `border-left-color: #1A56C4; background-color: #F0EEEA; box-shadow: -2px 4px 12px rgba(0,0,0,0.03);`

---

### 5.4 Filter Chips & Division Pills

Used for filtering groups (Group A, Group B, Group C) or categories.

#### Specification (`.m3-filter-chip`)
- **Height:** `32px`
- **Padding:** `0 16px`
- **Corners:** `rounded-lg` (`8px`)
- **Typography:** `font-size: 0.8125rem` (13px), `font-weight: 600`
- **Border:** `1px solid #CCCCCC`
- **Background:** Transparent
- **Active Primary (`active-primary`):** Background `#E8EFFF` (`m3-primary-container`), Text `#00194B`, Border `#1A56C4`
- **Active Accent (`active`):** Background `#FFEEDB` (`m3-secondary-container`), Text `#2E0E00`, Border `#B84D00`

---

### 5.5 Cards & Surface Containers

#### A. Outlined Varsity Card (`.varsity-card`)
- **Background:** `#FFFFFF` (`var(--color-m3-surface)`)
- **Border:** `1px solid #EAEAEA` (`var(--color-m3-outline-variant)`)
- **Corners:** `rounded-3xl` (`24px`)
- **Padding:** Standard `24px` (`p-6`) or `16px` (`p-4`) on mobile
- **Shadow:** Ambient `0 2px 8px rgba(0, 0, 0, 0.015)`
- **Hover Behavior:** Border transitions to `#1A56C4`, shadow shifts to `0 4px 16px rgba(26, 86, 196, 0.05)`, `transform: translateY(-1px)`

#### B. Stitched Varsity Patch (`.varsity-patch`)
- **Border:** `2px dashed #1A56C4`
- **Box Shadow:** `inset 0 0 0 2px #FFFFFF, 0 4px 12px rgba(0, 0, 0, 0.05)`
- **Background:** `#F6F4F0` League Cream
- **Hover:** `transform: scale(1.02)`

#### C. Dark Varsity Hero Container
- **Background:** Carbon Navy `#0B192C` or Ink Black `#111111` with radial dot grid watermark
- **Border:** `1px solid rgba(255, 255, 255, 0.1)`
- **Corners:** `rounded-3xl` (`24px` - `32px`)
- **Text:** White headings `#FFFFFF`, secondary meta `#9CA3AF`

---

### 5.6 Standings Tables & Data Display

Extracted from the Group Stage Table component in the Tournament Page.

#### A. Table Container
- Outer wrapper: `varsity-card overflow-hidden border border-gray-200/80 bg-white`

#### B. Table Header (`thead tr`)
- **Background:** `bg-gray-50/90 backdrop-blur` or `#F0EEEA`
- **Border Bottom:** `1px solid #E5E7EB`
- **Header Cell (`th`):**
  - Typography: `text-[10px] font-extrabold text-gray-500 uppercase tracking-wider` (`0.05em`)
  - Padding: `py-3 px-4`

#### C. Table Body Rows (`tbody tr`)
- **Border Bottom:** `1px solid #F3F4F6`
- **Hover State:** `hover:bg-blue-50/40 transition-colors`
- **Top 2 Advancing Rows:** Left accent border (`border-l-4 border-emerald-500` or `#1A56C4`) with soft green tag (`Qualified for Knockout`).
- **Rank Indicators:**
  - 1st Place: Gold badge `#F59E0B`
  - 2nd Place: Silver badge `#94A3B8`
  - 3rd Place: Bronze badge `#D97706`

---

### 5.7 Knockout Brackets & Match Cards

Extracted from the Split Bracket Visualizer component.

#### A. Match Fixture Card
- **Background:** `#FFFFFF`, Border `1px solid #EAEAEA`, Corners `rounded-xl` (`12px`), Padding `12px 16px`
- **Player Row:** Flex alignment with avatar (32px circle), player name, school tag, ELO rating pill, match points.
- **Winner Highlight:** Bold player name, primary blue text or green victory indicator.

#### B. Match Status Indicators
- **Scheduled:** Background `#F3F4F6`, Text `#4B5563`, Label: `Scheduled`
- **Live Now:** Background `#FEE2E2`, Text `#DC2626`, Pulsing red indicator dot (`animate-ping`)
- **Completed:** Background `#ECFDF5`, Text `#059669`, Label: `Final`

---

### 5.8 Badges, Chips, Eyebrows & Metadata Pills (`label / micro-label / eyebrow / eyebrow tags / badges / chips / metadata pills`)

All micro-labels, eyebrow tags, category badges, chips, and metadata pills across SS4 MUST follow these strict light-surface rules (strictly NO neon colors, NO glowing text, NO dark background masks):

- **Typography Mandate:** Font `Space Grotesk` (or `Outfit`), Size `0.65rem` - `0.75rem` (`text-xs` / `text-[10px]`), Weight `800` (ExtraBold/Black), Uppercase `textTransform: uppercase`, Tracking `letterSpacing: 0.05em`.
- **Primary Division / Round Tag:** Solid Varsity Blue (`bg-[#1A56C4]`), text Pure White (`#FFFFFF`), `rounded-md` (`6px`), padding `px-3 py-1`.
- **Neutral Metadata Chip:** Pure White surface (`bg-white`), border `1px solid #CCCCCC`, text Ink Black (`#111111`), padding `px-3 py-1`.
- **Secondary Category Chip:** Light gray surface (`bg-gray-200` / `bg-[#F0EEEA]`), text dark gray (`text-gray-700`), padding `px-3 py-1`.
- **Live Status Badge:** Light red surface (`bg-red-50`), border `1px solid #FECACA`, text dark red (`text-red-700`), with an inline 8px solid red dot (`w-2 h-2 rounded-full bg-red-600`).
- **ELO Rating Pill:** Soft blue tint surface (`bg-blue-50`), border `1px solid #BFDBFE`, text Varsity Blue (`text-[#1A56C4]`), weight `800`.
- **Qualified Status Pill:** Soft green surface (`bg-emerald-100`), border `1px solid #A7F3D0`, text dark green (`text-emerald-800`), weight `800`.

---

### 5.9 Modals & Overlay Frames

Extracted from Tournament Player Modal & Admin Modals.

#### Specification
- **Backdrop:** `fixed inset-0 bg-[#111111]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4`
- **Modal Window:** Surface `#FFFFFF`, Border `1px solid #EAEAEA`, Radius `24px` - `32px` (`rounded-3xl`), Shadow `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)`
- **Header:** Title in Space Grotesk ExtraBold, close button with circular hover ring (`w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500`)
- **Content Area:** Padding `24px` (`p-6`), max-height `85vh` with smooth auto scrolling.

---

### 5.10 Inputs & Form Controls

#### Specification (`.varsity-input`)
- **Background:** `#FFFFFF` (`var(--color-m3-surface)`)
- **Border:** `1px solid #CCCCCC` (`var(--color-m3-outline)`)
- **Corners:** `rounded-xl` (`16px`)
- **Padding:** `12px 16px` (`py-3 px-4`)
- **Typography:** `Outfit` / `Avenir Next` Regular, Text `#111111`
- **Focus State:** `border-color: #1A56C4; border-width: 2px; outline: none;`
- **Placeholder:** Text color `#9CA3AF`

---

### 5.11 Navigation Header & Footer System

- **Sticky Header Navbar:** Surface `white/95 backdrop-blur-md`, height `72px` - `80px`, border-bottom `1px solid #EAEAEA`, brand logo in Space Grotesk (`font-black tracking-tight`).
- **Footer:** Surface Carbon Navy `#0B192C` or Ink Black `#111111`, headers `#FFFFFF` Space Grotesk, body text `#9CA3AF`, social icons with hover fill `#1A56C4`.

---

### 5.12 Landing Page Specific Layout Alignment Rules

When applying the Varsity design system to the Landing Page:
1. **Hero Section:** Dark Carbon Navy background (`#0B192C`) or high-contrast League Cream backdrop (`#F6F4F0`), with primary button in Varsity Blue (`#1A56C4`) and secondary in White/Outline.
2. **Feature Grid:** Wrap all feature items in `.varsity-card` with 24px rounded corners and subtle hover elevation.
3. **Category Tabs / Filters:** Use sticky tab bar (`bg-white/95 backdrop-blur-md`) or segmented controls (`.m3-segmented-container`).
4. **News & Announcement Cards:** Follow exact Card & Badge specs with uppercase micro-labels for categories (e.g., `ACADEMIC`, `TOURNAMENT`, `ANNOUNCEMENT`).

---

## 6. Layout, Grid System & Responsiveness

- **Grid System:** Standard 12-column grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6`).
- **Container Max-Widths:**
  - Standard Content: `max-w-5xl mx-auto px-4 sm:px-6`
  - Wide Standings / Tables: `max-w-7xl mx-auto px-4 sm:px-6 md:px-8`
- **Touch Target Boundary:** Minimum interactive size of 48px × 48px for touch targets on mobile.

---

## 7. Motion, Animation & Accessibility

### Micro-Animations
- **Hover Transitions:** `transition: all 180ms cubic-bezier(0.2, 0, 0, 1)`
- **Active Click Press:** `active:scale-[0.98]`
- **Row Entrance:** `@keyframes rowFadeSlide` (`opacity 0 -> 1`, `translateY 12px -> 0` over 350ms)
- **Podium Entrance:** `@keyframes podiumScale` (`opacity 0 -> 1`, `scale 0.95 -> 1` over 400ms)

### Accessibility Mandate (`prefers-reduced-motion`)
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
    transform: none !important;
  }
}
```

---

## 8. Strict Do's and Don'ts

### Do:
- **Do** maintain a strict 4.5:1 text-to-background contrast ratio (WCAG AA).
- **Do** use `Space Grotesk` for all major section headers and display titles.
- **Do** use `Outfit` / `Avenir Next` for all body text, input fields, and paragraph text.
- **Do** reserve Varsity Blue (`#1A56C4`) and Championship Orange (`#B84D00`) strictly for active states, CTAs, and key badges (< 15% screen space).
- **Do** use 1px structural borders (`#EAEAEA` / `#CCCCCC`) to separate cards and table sections.
- **Do** enforce sticky, mobile-first tab bars with icon support on multi-tab views.

### Don't:
- **Don't** use text gradients or linear-gradient font masks.
- **Don't** use decorative page-wide glassmorphism or muddy blur backdrops.
- **Don't** use dark, heavy drop shadows or stacked shadow effects.
- **Don't** use native browser `alert()` popups; use custom Varsity Modal frames or Toast notifications.
- **Don't** use unstyled native buttons or link text without hover states.
- **Don't** break Fitts's law: never render primary interactive buttons smaller than 48px min-height on mobile.

