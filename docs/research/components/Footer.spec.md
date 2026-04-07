# Footer Specification

## Overview
- **Target file:** `src/components/Footer.jsx`
- **Interaction model:** static navigational columns
- **Background:** White

## DOM Structure
- `footer.bg-white.pt-20.pb-12.border-t.border-gray-100`
  - `div.container.mx-auto.px-4`
    - `div.grid.grid-cols-2.lg:grid-cols-5.gap-12.mb-20`
      - `FooterColumn` (About Niche, Business Links)
      - `FooterColumn` (Colleges)
      - `FooterColumn` (K-12)
      - `FooterColumn` (Places to Live)
      - `FooterColumn` (Search Categories)
    - `hr.border-gray-100.mb-12`
    - `div.flex.flex-col.md:flex-row.justify-between.items-center.gap-8`
      - `div.flex.gap-6` (Social Icons)
      - `div.text-sm.text-gray-500` ("© 2026 Niche.com Inc.")
      - `div.flex.gap-4` (App download badges)
