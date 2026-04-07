# StayOnTrack Specification

## Overview
- **Target file:** `src/components/StayOnTrack.jsx`
- **Interaction model:** animation with play/pause toggle
- **Background:** Dark Green with wave transition

## DOM Structure
- `section.bg-brand-dark-green.py-24.relative.overflow-hidden`
  - `div.container.mx-auto.px-4.flex.flex-col.lg:flex-row.items-center.gap-16`
    - `div.w-full.lg:w-1/2.relative` (Visual Mockup)
      - `div.bg-white.p-6.rounded-xl.shadow-2xl` (Animated UI Cards)
        - `LocationCard`, `CostCard`, `SizeCard`
      - `button.absolute.bottom-4.left-4` ("Pause")
    - `div.w-full.lg:w-1/2.text-white.space-y-8` (Content)
      - `p.text-xs.font-bold.tracking-widest.uppercase.opacity-80` ("STAY ON TRACK")
      - `h2.text-4xl.lg:text-5xl.font-bold` ("Tools to organize your school search.")
      - `div.w-24.h-1.bg-brand-primary-green.rounded-full`
      - `p.text-lg.opacity-90` ("We'll help you build your list...")
      - `a.text-white.font-bold.border-b-2.border-white.pb-1.hover:border-brand-primary-green` ("Start Exploring")
