# NEXUS — Video Streaming Platform

> A next-generation video streaming platform built by **Team Neon Nexus**.

---

## Quick Start

No build tools needed. This is a **static HTML/CSS/JS** project.

1. Clone the repo and switch to the `feature/shreya` branch:
   ```bash
   git clone <repo-url>
   git checkout feature/shreya
   ```
2. Open `index.html` in your browser (or use any local server like Live Server).

---

## Project Structure

```
NEXUS/
├── index.html                 # Entry point — home page with nav, chips, video grid, footer
├── DESIGN_SYSTEM.md           # Complete design reference (colors, tokens, data shape)
├── README.md                  # ← You are here
├── .gitignore
│
├── css/
│   ├── reset.css              # CSS reset baseline
│   ├── tokens.css             # Design tokens (colors, spacing, radii, shadows, z-index)
│   ├── global.css             # Typography, scrollbar, utility classes (.sr-only, .container)
│   ├── components/            # One CSS file per component (BEM naming)
│   │   ├── nav.css            # Top navbar + hamburger + mobile panel
│   │   ├── video-card.css     # Video thumbnail card
│   │   ├── category-chips.css # Horizontally scrollable filter chips
│   │   └── footer.css         # Site footer
│   └── pages/
│       └── home.css           # Home page layout + responsive video grid
│
├── js/
│   └── theme-toggle.js        # Dark/light theme, hamburger menu, chips scroll fade
│
├── data/
│   └── videos.js              # NEXUS_VIDEOS array — 12 sample videos (global constant)
│
└── assets/
    └── thumbnails/            # 12 thumbnail images (thumbnail-01.jpg … thumbnail-12.jpg)
```

---

## What's Done (Shreya's Phase — Foundation)

| Area | Status | Details |
|---|---|---|
| Design tokens | ✅ Done | Both dark + light themes in `css/tokens.css` |
| CSS reset | ✅ Done | Modern reset in `css/reset.css` |
| Global styles | ✅ Done | Typography, scrollbar, utilities in `css/global.css` |
| Navigation | ✅ Done | Fixed top nav with logo, search, actions, mobile hamburger |
| Category chips | ✅ Done | Scrollable chip row with fade indicators and active state |
| Video cards | ✅ Done | 12 cards with thumbnail, duration badge, channel avatar, metadata |
| Responsive grid | ✅ Done | 4 → 3 → 2 → 1 column based on breakpoint |
| Theme toggle | ✅ Done | Dark/light with `localStorage` persistence |
| Footer | ✅ Done | Brand, links, copyright |
| Sample data | ✅ Done | `NEXUS_VIDEOS` array with consistent schema |
| Accessibility | ✅ Done | ARIA labels, roles, `prefers-reduced-motion`, `sr-only` headings |

---

## For Team Members: How to Work Without Conflicts

### Branching Strategy

- **`main`** — stable, production-ready
- **`feature/shreya`** — foundation phase (CSS, HTML structure, design tokens)
- Create your own branch **off `main`** (e.g., `feature/ananya`, `feature/bhaskar`)

### File Ownership Boundaries

| Owner | Files | Rule |
|---|---|---|
| **Shreya** | `css/tokens.css`, `css/reset.css`, `css/global.css`, all `css/components/*.css`, `css/pages/*.css`, `DESIGN_SYSTEM.md` | Don't modify these — use the tokens, don't redefine them |
| **Ananya** | New files in `js/` (e.g., `js/search.js`, `js/filter.js`) | Add `<script>` tags **after** `js/theme-toggle.js` in `index.html` |
| **Bhaskar** | New React/component files | When migrating to React, consume `NEXUS_VIDEOS` and preserve CSS token usage |

### Rules for Adding Code

1. **Use design tokens** — never hardcode colors, spacing, or font sizes. Use `var(--color-…)`, `var(--space-…)`, etc.
2. **Follow BEM naming** — e.g., `.video-card__title`, `.category-chip--active`
3. **Add new CSS in new files** — create `css/components/your-component.css`, don't append to existing files
4. **Don't edit `data/videos.js` structure** — you can add entries, but don't rename properties. See `DESIGN_SYSTEM.md` for the full schema.
5. **Category filtering** — chips have `data-category` slugs, cards have matching `data-category` attributes. See the slug mapping table in `DESIGN_SYSTEM.md`.

### Key Integration Points

**For search/filter (Ananya):**
- Category chips: `<button data-category="technology">` → filter cards with `<article data-category="technology">`
- Video data: `window.NEXUS_VIDEOS` is a global array available from `data/videos.js`
- Search input: `#search-input` is wired up visually, add your logic via a new JS file

**For React migration (Bhaskar):**
- `NEXUS_VIDEOS` defines the canonical data shape — map it directly to component props
- All CSS uses custom properties — they'll work in React with zero changes
- Component CSS files map 1:1 to future React components

---

## Design Reference

See **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** for:
- Full color palette (dark + light tokens)
- Typography scale
- Spacing system
- Breakpoints
- Video data schema + category slug mapping

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | Semantic HTML5 |
| Styling | Vanilla CSS (custom properties, BEM) |
| Logic | Vanilla JavaScript (IIFE, no framework) |
| Font | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| Build | None (static files, no bundler) |

---

## Browser Support

Tested for modern evergreen browsers:
- Chrome 100+
- Firefox 100+
- Safari 16+
- Edge 100+

---

*Built by Team Neon Nexus · © 2026*
