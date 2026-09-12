# NEXUS — Team Handoff Document

> **Last Updated:** 2026-09-08
> **Project:** NEXUS — Video Streaming Platform
> **Team:** Neon Nexus
> **Tech Stack:** HTML5 · CSS3 · Vanilla JavaScript · LocalStorage

---

## Team

| Role | Name | Roll Number |
|---|---|---|
| **Team Lead** | Shreya | 2510990484 |
| Member | Ananya Setia | 2510990556 |
| Member | Gurasees Singh | 2510990421 |
| Member | Bhaskar | 2510990427 |

---

## Project Structure

```
NEXUS/
├── auth.html                           ← Landing page (Sign In / Sign Up)
├── index.html                          ← Home page (video feed)
├── DESIGN_SYSTEM.md                    ← Design reference
├── README.md                           ← Project overview
├── NEXUS_TEAM_HANDOFF.md               ← This file
├── .gitignore
│
├── css/
│   ├── reset.css                       ← CSS reset
│   ├── tokens.css                      ← Design tokens (dark + light themes)
│   ├── global.css                      ← Typography, utilities
│   ├── components/
│   │   ├── nav.css                     ← Navigation bar
│   │   ├── video-card.css              ← Video card component
│   │   ├── category-chips.css          ← Category filter chips
│   │   └── footer.css                  ← Footer
│   └── pages/
│       ├── auth.css                    ← Auth page (Sign In / Sign Up)
│       └── home.css                    ← Home page layout
│
├── js/
│   ├── theme-toggle.js                 ← Theme switching, hamburger, chips fade
│   └── auth.js                         ← Auth forms, localStorage auth, nav state
│
├── data/
│   └── videos.js                       ← NEXUS_VIDEOS array (12 videos)
│
└── assets/
    ├── icons/
    │   └── favicon.svg                 ← NEXUS favicon
    └── thumbnails/                     ← 12 video thumbnail images
```

---

## User Flow

```
New visitor → auth.html (Sign In or Sign Up)
                ↓
Successful auth → index.html (Home)
                ↓
Continue as Guest → index.html (Home)
                ↓
Already signed in → auth.html shows "Continue to NEXUS"
```

---

## Shared Resources — Must Reuse

### Design Tokens (`css/tokens.css`)
All visual values. **Always** use `var(--color-…)`, `var(--space-…)`, etc.
Never hardcode colors, spacing, or font sizes.

### Theme System
- `data-theme` attribute on `<body>` — `"dark"` or `"light"`
- `localStorage` key: `nexus-theme`
- Script: `js/theme-toggle.js`
- Every new page must include the theme toggle button with `id="theme-toggle"`

### Auth State
- `localStorage` key: `nexus-auth`
- Access via: `window.NexusAuth.getAuthState()`, `.setAuthState(user)`, `.clearAuthState()`
- Available after loading `js/auth.js`

### Video Data
- Global constant: `window.NEXUS_VIDEOS`
- File: `data/videos.js`
- Include before any script that uses it

### CSS Load Order
`reset.css` → `tokens.css` → `global.css` → component CSS → page CSS

### BEM Naming
All CSS follows `.block__element--modifier` convention.

---

## Team Responsibilities

### SHREYA — Core Foundation + Integration
**Status:** ✅ Complete

Owns:
- `css/reset.css`, `css/tokens.css`, `css/global.css`
- `css/components/*`, `css/pages/*`
- `js/theme-toggle.js`, `js/auth.js`
- `auth.html`, `index.html`
- `data/videos.js`
- `DESIGN_SYSTEM.md`

Will later handle: Final integration + testing

---

### ANANYA — Search + Feed
**Create these files:**
- `js/search.js` — Search query matching
- `js/filter.js` — Category chip filtering

**Modify (minimally):**
- `index.html` — Add `<script>` tags after existing scripts

**Hook into existing elements:**
- `#search-input` — Search text box
- `.nav__search-form` — Search form (submit already prevented)
- `.category-chip[data-category]` — 14 filter chips
- `.video-card[data-video-id][data-category]` — 12 video cards
- `.video-grid` — Card container
- `window.NEXUS_VIDEOS` — Video data array

**Do not touch:** Any CSS files, `auth.html`, `js/auth.js`, `js/theme-toggle.js`

---

### GURASEES — Watch Page + Video Player
**Create these files:**
- `watch.html` — Video watch page
- `css/pages/watch.css` — Watch page layout
- `css/components/video-player.css` — Player component
- `js/player.js` — Player controls, keyboard shortcuts

**Modify (minimally):**
- `index.html` — Update video card `href="#"` → `href="watch.html?v=VIDEO_ID"`
- `data/videos.js` — **Add** `description` and `videoSrc` properties

**Must reuse:**
- Navigation HTML (copy from index.html)
- Footer HTML
- All CSS tokens
- `js/theme-toggle.js` + theme toggle button
- `NEXUS_VIDEOS` for video lookup by ID

**Do not touch:** `css/tokens.css`, `css/reset.css`, `css/global.css`, existing component CSS

---

### BHASKAR — User Features + Community
**Create these files:**
- `library.html` — Library page (history, watch later, playlists)
- `css/pages/library.css` — Library layout
- `css/components/comment.css` — Comment styles
- `js/library.js` — History, watch later, playlists (localStorage)
- `js/comments.js` — Comment display and submission

**Modify (minimally):**
- `watch.html` (Gurasees's) — Add comments section
- `data/videos.js` — **Add** properties as needed

**LocalStorage keys:**
- `nexus-history` — Watched video IDs
- `nexus-watch-later` — Saved video IDs
- `nexus-playlists` — Playlist objects
- `nexus-comments` — Comments by video ID

**Auth access:** Use `window.NexusAuth.getAuthState()` to check if user is signed in

**Do not touch:** `css/tokens.css`, `css/reset.css`, `css/global.css`, `auth.html`

---

## Recommended Development Order

```
Shreya (Done) → Ananya → Gurasees → Bhaskar → Shreya (Integration)
```

**Why:**
1. **Ananya first** — purely additive JS on existing home page DOM
2. **Gurasees second** — creates standalone watch.html
3. **Bhaskar last** — comments need watch.html to exist; library integrates across pages
4. **Shreya final** — cross-page integration and testing

---

## Rules for All Team Members

1. **Use design tokens** — never hardcode visual values
2. **Follow BEM naming** — `.block__element--modifier`
3. **Create new CSS files** — don't modify existing component CSS
4. **Include theme toggle** on every new page
5. **Use `NEXUS_VIDEOS`** — don't create a second data source
6. **Prefix localStorage keys** with `nexus-`
7. **Test both themes** (dark and light)
8. **Test responsive layout** (mobile + desktop)
9. **Do NOT install npm packages or frameworks**
10. **Do NOT convert to React** unless explicitly required by rubric

---

*Built by Team Neon Nexus · © 2026*
