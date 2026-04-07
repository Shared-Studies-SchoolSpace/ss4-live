# Header Specification

## Overview
- **Target file:** `src/components/Header.jsx`
- **Interaction model:** click-driven & scroll-aware (sticky)
- **Background:** `#FFFFFF`
- **Height:** ~80px

## DOM Structure
- `header.sticky.top-0.z-50.bg-white.shadow-sm`
  - `nav.container.mx-auto.flex.items-center.justify-between.px-4.py-4`
    - `div.flex.items-center.gap-8`
      - `NicheLogo` component
      - `div.hidden.lg:flex.gap-6`
        - `NavLink` ("K-12", "Colleges", etc.)
    - `div.flex.items-center.gap-4`
      - `SearchToggle` (SearchIcon)
      - `LoginButton` (Outlined)
      - `SignUpButton` (Contained, Dark Green)

## Computed Styles
- **NavLinks**: `fontSize: 14px`, `fontWeight: 700`, `color: #333333`, `transition: color 0.2s`
- **Log In Button**: 
  - `border: 1px solid #004529`
  - `color: #004529`
  - `borderRadius: 24px`
- **Sign Up Button**:
  - `backgroundColor: #004529`
  - `color: #FFFFFF`
  - `borderRadius: 24px`

## States & Behaviors
- **Sticky**: Header stays at top-0 index.
- **Search Reveal**: Clicking SearchIcon opens a full-width search overlay (optional for first pass, will implement as simple toggle).
- **Hover**: 
  - Links: `color: #26844D` (brand-primary-green)
  - Sign Up: `backgroundColor: #26844D`
