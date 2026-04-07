# DiscoveryGrid Specification

## Overview
- **Target file:** `src/components/DiscoveryGrid.jsx`
- **Interaction model:** static 3-column grid
- **Background:** `#FFFFFF` (White)

## DOM Structure
- `section.bg-white.py-24`
  - `div.container.mx-auto.px-4.text-center`
    - `p.text-xs.font-bold.tracking-widest.text-brand-dark-green.uppercase.mb-4` ("FIND YOUR NICHE")
    - `h2.text-3xl.font-bold.text-brand-dark-green.mb-4` ("Your search is unique. Just like you.")
    - `div.w-32.h-1.bg-brand-primary-green.mx-auto.mb-8.rounded-full` (Wavy line)
    - `p.max-w-2xl.mx-auto.text-lg.text-gray-600.mb-16` ("We give you all of the data...")
    - `div.grid.grid-cols-1.md:grid-cols-3.gap-12`
      - `DiscoveryItem` (Icon, Title, Description)

## Items
1. **NO HEAVY LIFTING**: Icon: `why-icon-1.svg`
2. **THE GOOD, THE BAD, & THE HONEST**: Icon: `why-icon-2.svg`
3. **LIKE A GLOVE**: Icon: `why-icon-3.svg`
