# Hero Specification

## Overview
- **Target file:** `src/components/Hero.jsx`
- **Interaction model:** static text with interactive CTA pills
- **Background:** Left (Image), Right (`#004529`)

## DOM Structure
- `section.relative.flex.flex-col.lg:flex-row.min-h-[600px]`
  - `div.w-full.lg:w-1/2.relative` (Image side)
    - `img.object-cover.w-full.h-full` (hero-lg.webp)
  - `div.w-full.lg:w-1/2.bg-brand-dark-green.flex.items-center.justify-center.p-12` (Content side)
    - `div.max-w-xl.text-white`
      - `h1.text-5xl.font-bold.mb-6` ("FIND THE SCHOOL THAT FITS YOU BEST")
      - `p.text-lg.mb-12.opacity-90` ("Finding the right school shouldn't be hard...")
      - `div.space-y-4`
        - `h3.text-sm.font-bold.tracking-widest.uppercase` ("START YOUR SEARCH")
        - `div.flex.flex-wrap.gap-4`
          - `CategoryPill` ("K-12 Schools", "Colleges", "Grad Schools")

## Computed Styles
- **Heading**: `fontSize: 48px`, `lineHeight: 1.1`, `textTransform: uppercase`
- **CategoryPill**:
  - `backgroundColor: #26844D`
  - `padding: 12px 24px`
  - `borderRadius: 4px`
  - `fontWeight: 700`

## Assets
- Image: `public/home/hero-lg.webp`
