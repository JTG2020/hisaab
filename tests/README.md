# Tests — Hisaab

Owner: Tester. Dev-only. Nothing here ships to `app/`.

## Layout

```
tests/
  package.json
  playwright.config.js
  support/        # diagnostics (console/request/rejection), contrast maths, preflight
  smoke/          # contract selectors, <10 s, every change
  unit/           # money, normalise, sort, date        (planned P1+)
  integration/    # import, persistence, reminder, screenshot (planned P1+)
  e2e/            # phase gate journeys, only at gates
  fuzz/           # generated shops + independent oracle  (planned P2/P6)
  nonfunctional/  # 375 px, dark, quota
```

## Setup

```bash
cd tests
npm install                  # @playwright/test 1.65.1 (only dev dependency, S10)
npx playwright install chromium
```

`playwright.config.js` pins `workers: 1` and runs `support/preflight.js`, which fails
fast with a readable message if `http://localhost:4173` is not serving `app/`. No
`webServer` block: the suite must run against the same server the Coder verifies on
(the reference server drops concurrent sockets, which would fake N6 console noise).

## Serve

```bash
python3 -m http.server 4173 --directory ../app
```

Base URL `http://localhost:4173`.

## Commands

```bash
npx playwright test smoke                 # every change
npx playwright test unit integration      # every change
npx playwright test e2e --grep @P2        # gate only
npx playwright test fuzz --grep @P6       # gates P2/P6
npx playwright test nonfunctional         # gates P5/P6
```

## Gate policy

- **Every change:** smoke + affected unit.
- **Per phase:** full unit + integration + regression.
- **Phase gate only:** E2E suite for the phase and all earlier phases, plus the phase's fuzz/non-functional subset.
- A gate is FAIL on any P0/P1, any failing phase case, or a missing contract selector.

## Oracle rules

1. No import of `app/**` helpers.
2. Expected values from `PRD.md`, `CONTRACT.md`, `sample-expected.json`, or arithmetic computed in the test.
3. Read `textContent` and parse as a hostile grader would.
4. Fuzz seeds are recorded; failures print the smallest offending dataset.
5. Never weaken a test to reach green; escalate a spec conflict instead.

## Evidence

Every run appends to `docs/test-results.md` with a `RUN-<n>` id, command, environment, pass/fail counts, and an output excerpt. The Critic cites these IDs.
