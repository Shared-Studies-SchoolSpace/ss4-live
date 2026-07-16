---
name: SS4 Chess League
description: Connecting Academic Chess Communities
colors:
  primary: "#1A56C4"
  accent: "#E8640A"
  neutral-bg: "#F6F4F0"
  neutral-text: "#111111"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Avenir Next, Avenir, Helvetica Neue, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
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
    rounded: "{rounded.full}"
    padding: "10px 24px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "10px 24px"
---

# Design System: SS4 Chess League

## 1. Overview

**Creative North Star: "The Varsity Arena"**

SS4 is styled as a premium, high-contrast varsity sports community. The design system uses editorial typographic density and stark contrast to mimic professional athletic divisions. Every screen is crisp, bold, and clear.

**Key Characteristics:**
- High contrast typography for immediate data readability.
- Clear separation between active gameplay, standings, and messaging.
- Restrained color strategy: 80% neutral cream/ink surface, with blue and orange used strictly for actions, highlights, and divisional branding.

## 2. Colors

A high-contrast neutral cream palette with scholastic blue and orange accents.

### Primary
- **Varsity Blue** (#1A56C4): Used for primary buttons, active states, and highlights.

### Accent
- **Championship Orange** (#E8640A): Used for warning highlights, status updates, and division markers.

### Neutral
- **Ink Black** (#111111): Body text and secondary headings.
- **League Cream** (#F6F4F0): Main page background.
- **Pure White** (#FFFFFF): Card surfaces and container backgrounds.

### Named Rules
**The Accent Rarity Rule.** Primary blue and orange accent colors must occupy less than 15% of the total screen space. Their scarcity makes them meaningful.

## 3. Typography

**Display Font:** Space Grotesk (sans-serif)
**Body Font:** Avenir Next (sans-serif)

### Hierarchy
- **Display** (Bold, clamp(2rem, 5vw, 3.5rem), 1.1): Hero titles and major standings headers.
- **Headline** (ExtraBold, 1.25rem, 1.2): Section titles.
- **Title** (Bold, 1rem, 1.3): Component headers and player names.
- **Body** (Medium/Regular, 0.875rem, 1.5): Chat text, details, and labels. Limit paragraphs to 65ch.
- **Label** (Heavy, 0.75rem, 1.2): Micro-labels and stats.

## 4. Elevation

SS4 is flat-by-default, emphasizing clean structural borders over heavy shadows.

### Shadow Vocabulary
- **Card Glow** (`box-shadow: 0 4px 12px rgba(0,0,0,0.03)`): Diffuse ambient backdrop under cards to lift them slightly.

### Named Rules
**The Flat-First Rule.** Never stack multiple shadows or use dark shadows. Use light gray borders (#E8E8E8 / 1px) to divide layout blocks.

## 5. Components

### Buttons
- **Shape:** Rounded full (rounded-full)
- **Primary:** Varsity Blue (#1A56C4), white text, padding (10px 24px)
- **Secondary:** Transparent, Varsity Blue text, border (1px solid #1A56C4)

### Cards / Containers
- **Corner Style:** Rounded large (16px) or extra large (24px)
- **Background:** Pure White (#FFFFFF)
- **Border:** 1px solid (#EAEAEA)

### Inputs / Fields
- **Style:** Pure white background, border (1px solid #CCCCCC), rounded-xl
- **Focus:** Border transitions to Varsity Blue (#1A56C4)

## 6. Do's and Don'ts

### Do:
- **Do** maintain a strict 4.5:1 text-to-background contrast ratio.
- **Do** display division names clearly using designated badge shapes.
- **Do** make links to institutions explicit, underlined on hover.

### Don't:
- **Don't** use decorative page-wide glassmorphism or blur backdrops.
- **Don't** use text gradients.
- **Don't** add side-stripe accents larger than 1px.
