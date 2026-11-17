# TECH-STACK — Hisaab

Version: 1.0
Updated: 2026-11-17
Owner: Planner
Supersedes: TECH-STACK.md v0.1-draft

The Coder may not change a decision here without a new version of this file and, where `AGENTS.md` §7 applies, human sign-off. Each decision records a rationale, its consequence, and the alternative rejected.

## 1. Decisions

| ID | Decision | Rationale | Consequence | Rejected alternative | Status |
|---|---|---|---|---|---|
| S1 | Vanilla HTML + CSS + JavaScript, no framework | Critical selectors exist at first paint; no hydration or synthetic-event quirks; every node is directly inspectable and scriptable | State and rendering are hand-written; discipline needed to re-render everything from state | React/Vue/Svelte — hydration delay, controlled-input risk, build output | accepted |
| S2 | No build step; the source files are the deployed artifact | The tester visits a static URL; fewer moving parts and no build drift | No bundler, no minifier, no TypeScript; plain ES2020 in the browser | Vite/Next/webpack | accepted |
| S3 | Deployable unit is `app/`; Vercel Root Directory = `app` | Keeps docs and tests out of the deployed site; matches the required hosting shape | Vercel serves `app/index.html` directly; no server runtime | Deploy the repository root; serverless functions | accepted |
| S4 | Persistence in `localStorage` with an in-memory fallback | Meets "data survives reload" with no backend; synchronous and simple | Must catch quota and access errors and degrade with a visible warning | IndexedDB (async complexity), server database (contradicts brief) | accepted |
| S5 | Money is **integer paise** in state and in every derived value; machine nodes render bare rupee numbers by the §3.3 rule (whole → no decimals, fractional → exactly two) | Exact integer sums; no floating-point artefacts; a parser reading `11820` or `670.50` succeeds; the sample stays `11820` because its amounts are whole rupees | A shared parse and render pair; amounts with more than two decimals round to the nearest paise (half away from zero) and log; never round to the rupee | Floating-point rupees (`0.1 + 0.2` drift, `toFixed` in machine nodes); integer rupees with rupee rounding (loses paise precision, contradicts D4) | accepted — amended by D4 |
| S6 | Customer view via `?customer=` on the single page | No server rewrites; identical behaviour on Vercel and `python3 -m http.server`; no 404 route to misconfigure | One HTML entry; the customer view is an in-page section that does not remove the list nodes | A `/c/` path rewrite or hash routing | accepted |
| S7 | Import fully replaces state, atomically | The tester may import twice in one tab; a merge would double-count and lose the hidden-data marks | Parse → normalise → validate → write → re-render; previous state restored on any throw | Merge/append | accepted |
| S8 | Screenshots downscaled client-side to at most 800 px JPEG at quality about 0.7 before storage | Fits the storage quota; a 3 MB photo becomes a small data URL | Slight quality loss on thumbnails is acceptable; quota failure still saves the entry without the image | Store the original; upload to a server | accepted |
| S9 | OCR is a progressive enhancement (local/self-hosted Tesseract when feasible) | Worth at most 5 bonus marks; must never block save or overwrite typed input | May ship without B7; OCR failure leaves manual entry intact; no network dependency added to scored flows | Hard OCR requirement; server/API OCR (breaks R10) | accepted |
| S10 | Playwright as a dev-only dependency under `tests/` | Automates the grader model: import, read contract, reload, re-import, upload, 375 px, dark mode | `tests/` never ships inside `app/`; CI or local only | Cypress, Puppeteer, manual checks | accepted |
| S11 | System font stack; no web font, no CDN on the critical path | No blocking request, no flash of invisible text, no third-party failure | Slightly generic typography; Telugu/Devanagari rely on system fonts with Noto fallbacks | Google Fonts or any hosted font | accepted |
| S12 | No service worker, no PWA, no cache layer | A stale cache during grading is a zero; the brief does not require offline install | No offline install; plain HTTP caching only | Workbox or a hand-written cache | accepted |
| S13 | No auth, no cookies, no analytics, no consent banner | The tester must reach every route anonymously and read first paint immediately | Public app; no personal data leaves the browser | Any login, cookie gate, or analytics tag | accepted |

**Money is never floating point.** This is a hard constraint on S5 and on `CONTRACT.md` §3: money is parsed into integer paise with exact integer arithmetic, summed as integers, and rendered by integer division and remainder. No `toFixed`, `toLocaleString`, `Intl.NumberFormat`, `parseFloat` accumulation, percentage, or division of money is permitted in the money path.

## 2. Constraints

- **Hosting shape:** static files in `app/`; `app/index.html` is the entry; relative asset paths only (`./styles.css`, `./assets/...`), never absolute or `localhost`; `app/vercel.json` is optional and must not be required for the app to work.
- **Routing:** no server routing; `?customer=` and `?today=` are query parameters read from `location.search`.
- **No runtime services:** no backend, no database, no auth, no cookies, no service worker, no environment variables, no API keys.
- **Browser support:** current Chrome, Safari, Firefox, and mobile Safari at 375 px; ES2020, `Intl` only outside the money path.
- **Performance budget:** first paint under 1 s locally; total shipped JS under 100 KB uncompressed; no network request on the critical path.
- **Accessibility baseline:** a label for every input; visible focus ring; `aria-live` on import status and save confirmations; `color-scheme: light dark`; body text contrast at least 4.5:1 and large text/borders at least 3:1 in both schemes.
- **Money:** integer paise; the render rule from `CONTRACT.md` §3.3; the sample stays byte-identical to `sample-expected.json`.
- **Test tooling:** Playwright only under `tests/`, never referenced by `app/`.

## 3. File shape

```
app/
  index.html          # entry; all contract nodes in the markup
  styles.css          # tokens, layout, responsive, dark scheme
  app.js              # state, money, import, render, bonus hooks
  assets/             # inline SVG preferred; no external images
tests/
  package.json
  playwright.config.*
  smoke/ unit/ integration/ e2e/ fuzz/
docs/
  ...
```

`app/` must work with only these files served, with no build command.

## 4. Dev commands

```bash
# serve the deployable unit
python3 -m http.server 4173 --directory app

# dev-only test tooling
cd tests && npm i -D playwright && npx playwright install chromium
npx playwright test
```

## 5. Data shape

`hisaab.v1` in `localStorage`:

```json
{
  "shop": "string",
  "customers": [{ "name": "string", "phone": "string" }],
  "entries": [{ "id": "string", "phone": "string", "type": "credit|payment", "amountPaise": 0, "date": "YYYY-MM-DD", "note": "string", "shot": "dataURL?" }]
}
```

- `amountPaise` is an integer number of paise (S5). The import format keeps `amount` in rupees as the brief defines; it is converted at the boundary by the `CONTRACT.md` §3.2 parser and stored as `amountPaise`.
- Balances, the total, overdue membership, and day counts are derived on every render and never persisted.
- `customers` is keyed by the normalised phone; `entries` reference a phone, so one row per phone is the only shape that cannot double-count.

## 6. Rejected options

- **React/Vue/Svelte:** hydration and controlled-input risks under a scripted tester; a build step and a slower first paint for no scored benefit.
- **Vite/Next or any bundler:** adds build output and drift; the tester reads the deployed HTML directly.
- **IndexedDB:** asynchronous complexity with no scored advantage over `localStorage`.
- **Server or database:** contradicts "browser storage is fine", adds cold starts, auth, and failure modes.
- **Custom date picker or custom dropdowns:** break programmatic `fill`/`selectOption` and blur the native input contract.
- **Web fonts and CDNs:** block first paint and add a third-party dependency to a static, offline-tolerant app.
- **Service worker / PWA:** stale-build risk during grading.
- **Float money or rupee rounding:** violates D4 and produces machine values no parser can trust.
- **Server-side or API OCR:** would make B7 a network dependency and risk R10.
