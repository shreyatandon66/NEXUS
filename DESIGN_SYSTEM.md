# NEXUS Design System

> **Version:** 1.0 — Foundation Phase (Shreya)
> **Last updated:** 2026-09-05

---

## Philosophy

NEXUS is a video-streaming platform with its own distinct identity. The design language is:
- **Confident, not flashy** — clean surfaces, deliberate color use, no gratuitous gradients or glassmorphism
- **Readable, not decorative** — typography and spacing serve content hierarchy, not decoration
- **Familiar, not derivative** — users should intuit the interface without it looking like any existing platform

---

## Color Palette — "Deep Space"

All colors are defined as CSS custom properties in `css/tokens.css` and switch automatically via `data-theme="light"` / `data-theme="dark"` on `<body>`.

### Backgrounds

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--color-bg-primary` | `#F8F9FA` | `#0D0D0F` | Page background |
| `--color-bg-secondary` | `#FFFFFF` | `#18181B` | Cards, surfaces |
| `--color-bg-tertiary` | `#F0F1F3` | `#222226` | Hover/elevated surfaces |
| `--color-bg-nav` | `#FFFFFF` | `#131316` | Navigation bar |

### Text

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--color-text-primary` | `#111113` | `#ECECEE` | Headings, body |
| `--color-text-secondary` | `#5C5C66` | `#9494A0` | Descriptions, channel names |
| `--color-text-tertiary` | `#8E8E99` | `#6B6B78` | Timestamps, metadata |

### Accent

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--color-accent` | `#6C5CE7` | `#A78BFA` | Primary interactive color |
| `--color-accent-hover` | `#5A4BD6` | `#B49CFC` | Hover state |
| `--color-accent-subtle` | `#EDE9FE` | `#1E1639` | Accent backgrounds |

### Borders & Utility

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--color-border` | `#E2E3E7` | `#2A2A2F` | Borders, dividers |
| `--color-danger` | `#E53E3E` | `#FC8181` | Error/destructive |
| `--color-chip-bg` | `#E8E9EC` | `#27272B` | Category chip default |
| `--color-chip-active-bg` | `#6C5CE7` | `#A78BFA` | Active category chip |
| `--color-chip-active-text` | `#FFFFFF` | `#FFFFFF` | Active chip text |

### Why indigo-violet?
YouTube owns red. Twitch owns purple. NEXUS takes the gap between — a refined indigo-violet that reads as premium and modern without clashing with either.

---

## Typography

**Font family:** `'Inter', system-ui, -apple-system, sans-serif`

Inter is chosen for its excellent readability at small sizes (video metadata) and its clean geometric character at larger sizes (headings). It's available via Google Fonts.

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `--font-size-xs` | `0.75rem` (12px) | 1.5 | 400/500 | Duration badges, view counts |
| `--font-size-sm` | `0.875rem` (14px) | 1.5 | 400 | Channel names, secondary text |
| `--font-size-base` | `1rem` (16px) | 1.6 | 400 | Body text, search input |
| `--font-size-lg` | `1.125rem` (18px) | 1.4 | 500 | Card titles |
| `--font-size-xl` | `1.5rem` (24px) | 1.3 | 600 | Section headings |
| `--font-size-2xl` | `2rem` (32px) | 1.2 | 700 | Page title |

### Font Weights

| Token | Value |
|---|---|
| `--font-weight-regular` | 400 |
| `--font-weight-medium` | 500 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |

---

## Spacing Scale

Based on a 4px unit. All layout spacing uses these tokens — no magic numbers.

| Token | Value |
|---|---|
| `--space-1` | `0.25rem` (4px) |
| `--space-2` | `0.5rem` (8px) |
| `--space-3` | `0.75rem` (12px) |
| `--space-4` | `1rem` (16px) |
| `--space-5` | `1.25rem` (20px) |
| `--space-6` | `1.5rem` (24px) |
| `--space-8` | `2rem` (32px) |
| `--space-10` | `2.5rem` (40px) |
| `--space-12` | `3rem` (48px) |
| `--space-16` | `4rem` (64px) |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `4px` | Badges, small elements |
| `--radius-md` | `8px` | Cards, inputs |
| `--radius-lg` | `12px` | Thumbnails, modals |
| `--radius-full` | `9999px` | Chips, avatars, pills |

---

## Shadows / Elevation

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Cards on hover |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modals, dropdowns |

In dark mode, shadows are less visible against dark backgrounds, so `--shadow-md` and `--shadow-lg` use slightly increased opacity.

---

## Breakpoints

| Name | Min-width | Columns (video grid) |
|---|---|---|
| Mobile | `< 640px` | 1 |
| Tablet | `640px` | 2 |
| Desktop | `1024px` | 3 |
| Wide | `1400px` | 4 |

---

## Transitions

| Token | Value | Usage |
|---|---|---|
| `--transition-fast` | `120ms ease` | Color changes, opacity |
| `--transition-base` | `200ms ease` | Hover effects, transforms |
| `--transition-slow` | `350ms ease` | Layout shifts, slide-ins |

---

## Video Data Shape

All sample/production video data follows this consistent object structure (defined in `data/videos.js`). Other teammates' phases (search, filters, React state) should consume this same shape:

```js
{
  id: String,              // Unique identifier, e.g. "v001"
  title: String,           // Video title
  thumbnail: String,       // Relative path to thumbnail, e.g. "assets/thumbnails/thumbnail-01.jpg"
  channel: {
    name: String,          // Channel display name
    avatar: String|null,   // Path to channel avatar image (null = use initials)
    color: String          // Hex color for avatar background, e.g. "#4A90D9"
  },
  duration: String,        // Formatted duration, e.g. "18:42" or "3:14:22"
  durationSeconds: Number, // Duration in total seconds (for sorting/filtering)
  views: Number,           // View count as integer, e.g. 245000
  uploadDate: String,      // ISO date string, e.g. "2026-08-28"
  category: String         // Display label, e.g. "Technology", "Art & Design"
}
```

### Category Slug Mapping

The HTML uses **lowercase slug** `data-category` attributes. The `NEXUS_VIDEOS` data uses **display labels** in the `category` field. When building filter logic, use this mapping:

| Display Label (data) | Slug (HTML `data-category`) |
|---|---|
| Technology | `technology` |
| Photography | `photography` |
| Food | `food` |
| Travel | `travel` |
| Art & Design | `art-design` |
| Science | `science` |
| Music | `music` |
| Fitness | `fitness` |
| Lifestyle | `lifestyle` |
| Gaming | `gaming` |
| Education | `education` |
| News | `news` |
| Film | `film` |

> **Convention:** To derive a slug from a display label, lowercase and replace spaces/ampersands with hyphens: `"Art & Design"` → `"art-design"`. A utility function for this is recommended.

---

## File Organization

```
NEXUS/
├── index.html                 # Main HTML entry point (home page)
├── DESIGN_SYSTEM.md           # This file — design reference
├── README.md                  # Project overview & team guide
├── .gitignore                 # Git ignore rules
│
├── css/
│   ├── reset.css              # CSS reset baseline
│   ├── tokens.css             # All design tokens (both themes)
│   ├── global.css             # Base typography, layout, utilities
│   ├── components/            # Component-specific styles (BEM)
│   │   ├── nav.css
│   │   ├── video-card.css
│   │   ├── category-chips.css
│   │   └── footer.css
│   └── pages/                 # Page-specific layout styles
│       └── home.css
│
├── js/
│   └── theme-toggle.js        # Theme switching + hamburger menu + chips fade
│
├── data/
│   └── videos.js              # Sample video data (NEXUS_VIDEOS array)
│
└── assets/
    └── thumbnails/            # 12 sample video thumbnail images
        ├── thumbnail-01.jpg
        └── ... (through thumbnail-12.jpg)
```

Components own their own CSS file. Pages import component styles as needed. The token system is the single source of truth for all visual values.
