# NicheStories Specification

## Overview
- **Target file:** `src/components/NicheStories.jsx`
- **Interaction model:** carousel with auto-play and manual navigation (dots)
- **Background:** White

## DOM Structure
- `section.bg-white.py-20.px-4`
  - `div.container.mx-auto.flex.flex-col.lg:flex-row.items-center.gap-16`
    - `div.w-full.lg:w-2/5.space-y-6` (Text content)
      - `p.text-xs.font-bold.tracking-widest.text-gray-500.uppercase` ("REAL NICHE STORIES")
      - `h2.text-3xl.lg:text-4xl.font-bold.text-brand-dark-green` ("Niche has helped millions...")
      - `div.relative.min-h-[200px]` (Story text container)
        - `p.text-lg.lg:text-xl.text-brand-primary-green.font-medium.italic` (Current story text)
        - `p.font-bold.text-brand-dark-green` (Name)
      - `div.flex.gap-2` (Carousel dots)
        - `button.w-3.h-3.rounded-full` (Active: Brand Dark Green, Inactive: Gray-200)
    - `div.w-full.lg:w-3/5.relative` (Images)
      - `div.relative`
        - `img.rounded-2xl.shadow-xl` (Main student photo)
        - `div.absolute.inset-0.bg-red-400.opacity-20.mix-blend-multiply` (Color overlay)

## Stories
- **Abby D.**: "During my college search, I was having a difficult time narrowing down what I wanted in a school, so I used Niche to help. I especially liked looking at the rankings for different aspects of the college experience, like the campus, academics, and much more!"
- **Dayna M.**: "I am so grateful for Niche and their resources. Schooling children at home has truly had its challenges. But having resources has made it so much easier. Finding the right programs for my little ones has been invaluable."
- **Clay N.**: "When I was applying to college, I had no idea what I was looking for. Niche helped me explore different schools and see breakdowns on many aspects of their programs! Thanks to Niche, I found a school that was a perfect fit!"
