---
target: partner-onboarding
total_score: 16
p0_count: 2
p1_count: 2
timestamp: 2026-07-17T13-46-47Z
slug: partner-onboarding
---
Method: dual-agent (A: e452798c-46ee-4952-a51f-e09cb00b52a2 · B: b6c78ab7-a55e-4fb8-9b0a-6f32c90274f1)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1/4 | Submission relies on a blocking OS browser `alert()`. No loading state or inline success card. |
| 2 | Match System / Real World | 3/4 | Plain English labels, but input fields feel like a basic feedback box rather than an official intake process. |
| 3 | User Control and Freedom | 2/4 | No form confirmation, draft save, or correction step before redirection. |
| 4 | Consistency and Standards | 1/4 | Form bypasses standardized `.varsity-input` styling class in `src/index.css`, resulting in inconsistent border styles and outline rings. |
| 5 | Error Prevention | 2/4 | Lacks real-time input format validation. No double-click protection on submit button. |
| 6 | Recognition Rather Than Recall | 2/4 | Visual hierarchy is weak. Form fields are stacked with uniform gaps and zero division between school info vs rep contacts. |
| 7 | Flexibility and Efficiency | 2/4 | Standard single-column form is simple, but lacks shortcuts, autofill configurations, or layout optimizations. |
| 8 | Aesthetic and Minimalist Design | 1/4 | Bland, plain centered form card with zero branding, values, or visual features. |
| 9 | Error Recovery | 1/4 | Relies on default HTML validation popups, which look unpolished and provide no clear recovery paths. |
| 10 | Help and Documentation | 1/4 | No instructions on validation timeline, verification steps, or next actions. |
| **Total** | | **16/40** | **Needs Work** |

## Anti-Patterns Verdict

### LLM Assessment
- **Lacks Premium Trust Panel:** The `/partner` page ([CreateUniversityPage.jsx](file:///home/kami/Desktop/codebase/ss4/src/pages/CreateUniversityPage.jsx)) is a blank canvas. An institutional administrator would not feel motivated to register since there are no value propositions, active school counts, or processing steps shown.
- **Blocking Browser Alerts (BANNED):** Submission executes a blocking window `alert()`, which is a major design tell.
- **Broken Focus Indicator (a11y):** The inputs in `CreateUniversityForm.jsx` specify `outline-none` with `focus:ring-brand-primary` but fail to specify a ring width (e.g. `focus:ring-2`), rendering the focus ring invisible.

### Deterministic Scan
- **Results:** 0 findings reported by `detect.mjs`.
- **Manual verification (A11y/Contrast):**
  - **Low Border Contrast:** Unfocused input border contrast is **1.25:1** on a white background, violating WCAG Non-Text Contrast guidelines (minimum 3:1).
  - **Style Deviation:** Inputs bypass the project's global `.varsity-input` CSS class, leading to duplicate style properties.

## Overall Impression
The partner registration page is highly functional but visual-heavy on plain forms, failing to project institutional value or platform trust. The keyboard focus ring is broken, the contrast is low, and the blocking alert breaks the SPA flow.

## What's Working
1. **Clean Form Spacing:** Inputs are stacked at comfortable relative gaps.
2. **AAA Text Contrast:** High-contrast text values make field inputs readable.

## Priority Issues

### [P0] Fix Focus Rings & Contrast (Accessibility)
- **Why it matters:** Keyboard users cannot locate focus position because focus rings are completely invisible.
- **Fix:** Apply the standard `.varsity-input` class to all form input/textarea elements, restoring the 2px focus border and compliant contrast.

### [P0] Remove window.alert() Blocking Loop (Usability)
- **Why it matters:** Blocking alerts freeze the application UI and look highly unpolished.
- **Fix:** Remove `alert()` and implement an inline custom success state (e.g. a congrats card showing the verification timeline) in the parent page after form submission.

### [P1] Refactor to Split-Pane Layout (Aesthetic / Onboarding)
- **Why it matters:** A blank centered form card lacks value context. A split layout balances visual weight.
- **Fix:** Create a 50/50 split panel on desktop screens:
  - **Left Side:** Institutional proof panel detailing features, platform scale (metrics), and verification timeline.
  - **Right Side:** Glassmorphic registration form card.

### [P1] Add Submission Loading State (Usability)
- **Why it matters:** Clicking multiple times on the action button before it redirects can cause duplicate inquiries.
- **Fix:** Disable the submit button and show a loading indicator during form submission.

### [P2] Add Section Headings (Cognitive Load / Law of Proximity)
- **Why it matters:** Fields are stacked uniformly with no visual grouping.
- **Fix:** Segment form fields into two logical sections: "Institution Details" and "Authorized Contact Information".
