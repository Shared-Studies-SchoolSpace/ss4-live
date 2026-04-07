# DirectAdmissions Specification

## Overview
- **Target file:** `src/components/DirectAdmissions.jsx`
- **Interaction model:** static flex layout with interactive buttons
- **Background:** `#F6F4F0` (brand-bg-cream)

## DOM Structure
- `section.bg-brand-bg-cream.py-20`
  - `div.container.mx-auto.px-4.flex.flex-col.lg:flex-row.items-center.gap-12`
    - `div.w-full.lg:w-1/2.space-y-8` (Text content)
      - `img` (direct-admissions-logo.webp)
      - `h2.text-4xl.lg:text-5xl.font-bold.text-brand-dark-green` ("Get accepted without an application.")
      - `p.text-lg.text-brand-dark-green.opacity-80` ("No application. No waiting...")
      - `div.flex.gap-4`
        - `Button.contained` ("Create a Niche Profile")
        - `Button.outlined` ("Learn more")
    - `div.w-full.lg:w-1/2.relative` (Graphic)
      - `PhoneMockup` with arrows and circular images

## Assets
- Logo: `public/direct-admissions-logo.webp`
- Circles: `phillips-andover.png`, `oregon.png`, `marquette.png`, etc.
