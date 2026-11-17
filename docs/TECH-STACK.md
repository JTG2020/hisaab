# TECH-STACK — Hisaab

Version: 0.1-draft
Updated: 2026-11-17
Owner: Planner
Supersedes: none

> Planner: ratify or amend each decision, mark status, bump to 1.0. The Coder may not change a decision without a new version here.

## 1. Decisions

| ID | Decision | Rationale | Consequence | Rejected alternative | Status |
|---|---|---|---|---|---|
| S1 | Vanilla HTML/CSS/JS, no framework | No hydration, no synthetic-event quirks, selectors at first paint | Manual state/render code | React/Vue/Svelte | proposed |
| S2 | No build step; source is the artifact | Tester visits a static URL; fewer failure modes | No bundler, no minify requirement | Vite/Next | proposed |
| S3 | Deployable unit `app/`; Vercel Root Directory = `app` | Clean separation from docs/tests; Vercel-compatible | Deploys as static site | Repo-root deploy | proposed |
| S4 | `localStorage` + in-memory fallback | Meets persistence with zero backend | Quota handling required | IndexedDB (more code), server DB | proposed |
| S5 | Integer rupees in state and machine nodes | Exact sums, parser-proof rendering | Reject/round decimals at import | Float rupees, paise integers | proposed |
| S6 | Customer view via `?customer=<phone>` | No server rewrites; Vercel/local parity | One-page app | `/c/<phone>` rewrites, hash routes | proposed |
| S7 | Import replaces state | Hidden-data test may import twice | Must recompute all derived values | Merge/append | proposed |
| S8 | Screenshots downscaled client-side to ≤800 px JPEG q≈0.7 | Fits storage quota | Slight quality loss acceptable | Store original, upload to server | proposed |
| S9 | OCR optional, progressive enhancement | 5 bonus marks, must never block save | May ship without B7 | Hard requirement, server OCR | proposed |
| S10 | Playwright as a dev-only dependency under `tests/` | Automates the grader model | Not shipped to `app/` | Cypress, Puppeteer | proposed |
| S11 | System font stack, no web fonts | No blocking request, no CDN | Slightly generic look | Google Fonts | proposed |
| S12 | No service worker, no PWA | Avoid stale builds during grading | No offline support (not required) | Workbox | proposed |
| S13 | No auth, no cookies, no analytics | Tester must reach every page anonymously | Public app | Any gate | proposed |

## 2. Constraints

- Browser support: current Chrome/Safari/Firefox, mobile Safari at 375 px.
- Performance: first paint <1 s locally; total JS <100 KB uncompressed; no network on the critical path.
- Accessibility: labels, focus ring, `aria-live` on import status, `color-scheme: light dark`, contrast ≥4.5:1 body.
- Vercel: static, relative asset paths, `app/index.html`, no build command required, no environment variables.

## 3. File shape

```
app/
  index.html
  styles.css
  app.js
  assets/            # inline SVG preferred; no external images
tests/
  package.json
  playwright.config.*
  smoke/ unit/ integration/ e2e/ fuzz/
docs/
  ...
```

## 4. Dev commands

```bash
# serve
python3 -m http.server 4173 --directory app
# tests
cd tests && npm i -D playwright && npx playwright install chromium
npx playwright test
```

## 5. Data shape

`hisaab.v1` in `localStorage`:

```json
{
  "shop": "string",
  "customers": [{ "name": "string", "phone": "string" }],
  "entries": [{ "id": "string", "phone": "string", "type": "credit|payment", "amount": 0, "date": "YYYY-MM-DD", "note": "string", "shot": "dataURL?" }]
}
```

Derived values (balances, total, overdue) are computed on render and never persisted.

## 6. Rejected options

- **React/Vue:** hydration and controlled-input risks under a scripted tester.
- **IndexedDB:** more code, async complexity, no scored benefit.
- **Server + database:** contradicts "browser storage is fine" and adds failure modes.
- **Custom date picker:** breaks programmatic input.
