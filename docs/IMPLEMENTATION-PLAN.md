# IMPLEMENTATION-PLAN — Hisaab

Version: 0.1-draft
Updated: 2026-11-17
Owner: Planner
Supersedes: none
Depends on: `PRD.md`, `TECH-STACK.md`, `CONTRACT.md`

> Planner: verify phase boundaries and gate suites, then bump to 1.0. Phases are sequential; no parallel phases inside this project.

## 0. Global rules

- One phase at a time. Each phase ends at its gate with a Tester run and a Critic scorecard.
- E2E runs **only at gates**; every change runs contract smoke + affected unit tests.
- The Coder writes only `app/`; the Tester only `tests/` and results; the Planner only docs; the Critic only `scorecards.md`; the Orchestrator only `worklog.md`.
- No phase starts before the previous gate is recorded in `worklog.md`.
- Any contract change stops the phase (see `AGENTS.md` §5).
- Deploy the `app/` directory at every gate (preview is enough locally until Vercel is wired).

## 1. Phase table

| Phase | Goal | Requirements | Gate suite |
|---|---|---|---|
| P0 | Static skeleton, every selector, empty state, smoke suite | R1–R10 structure, N1, N6 | E2E-P0 |
| P1 | State, customer/entry CRUD, balances, total, persistence, customer view | R1–R4, R7, N4, N5 | E2E-P1 |
| P2 | Import: replace, tolerant parse, error state | R8 | E2E-P2 + 50-shop fuzz |
| P3 | WhatsApp reminder, screenshot upload + downscale | R5, R6 | E2E-P3 |
| P4 | Bonuses B1–B7 | B1–B7 | E2E-P4 |
| P5 | 375 px, light/dark, long strings, large numbers | R9, N2, N3 | E2E-P5 |
| P6 | Hardening, 200-shop fuzz, quota, reload, double import, submission note | all | E2E-P6 full |

## 2. Phase details

### P0 — Skeleton and contract
- **Goal:** an empty but complete shell; every selector resolvable before data.
- **Selectors:** all of `CONTRACT.md` §1–§5.
- **Files:** `app/index.html`, `app/styles.css`, `app/app.js`, `app/assets/*`.
- **Acceptance:** `#total-outstanding` renders `0`; import box, import button, shot input visible; containers exist; `?today` and `?customer` parsed (no behaviour yet); no console errors.
- **Gate E2E-P0:** contract smoke (C-01…C-12), empty-state assertions, 375 px no-overflow baseline, dark-mode baseline.
- **Risks:** hiding inputs in a modal; rendering rows only when data exists.
- **Rollback:** revert `app/` to the previous gate tag.

### P1 — Data core
- **Goal:** real ledger in memory + storage.
- **Requirements:** R1, R2, R3, R4, R7, N4, N5.
- **Selectors:** `[data-customer]`, `[data-balance]`, `#total-outstanding`, `?customer=`.
- **Acceptance:** add customer (10-digit validation), add credit/payment, balances = credit − payments, total = signed sum, rows sorted/persisted, customer view newest first, reload preserves, integer rendering.
- **Gate E2E-P1:** add 2 customers + 4 entries via UI, verify balances and total, reload, reopen customer view, enter via `?customer=`.
- **Risks:** float money; caching totals; dropping zero balance; duplicate rows.
- **Rollback:** revert `app/app.js` to gate tag.

### P2 — Import (the 60-mark surface)
- **Goal:** arbitrary shop JSON replaces state correctly and safely.
- **Requirements:** R8, plus R3 under hidden data.
- **Selectors:** `#import-box`, `#import-go`, `[data-customer]`, `[data-balance]`, `#total-outstanding`.
- **Acceptance:** sample → `11820` and all 8 balances; replacement on second import; unknown phones auto-created; zero-entry customers kept; string/comma amounts; type casing; empty arrays; malformed JSON → message + old state intact.
- **Gate E2E-P2:** sample case, double import, reload, 50-shop fuzz vs independent expectation.
- **Risks:** merge; `NaN`; dropping rows; stale totals.
- **Rollback:** revert import module only.

### P3 — Reminder and screenshot
- **Goal:** the two per-customer/per-payment interactions the tester exercises.
- **Requirements:** R5, R6.
- **Selectors:** `a[data-remind]`, `#shot-input`, `img[data-shot]`.
- **Acceptance:** href exactly `https://wa.me/91<phone>?text=…` with name + balance; image downscaled, saved, rendered, survives reload; quota failure keeps the entry with a warning.
- **Gate E2E-P3:** check every reminder href; upload 3 MB image; verify thumbnail and reload.
- **Risks:** unencoded `&`/unicode; storing original image; save abort on quota.
- **Rollback:** revert reminder/screenshot modules.

### P4 — Bonuses
- **Goal:** 30 marks.
- **Requirements:** B1–B7.
- **Acceptance:** each item verifiable in ≤2 clicks, visibly labelled; none changes the contract.
- **Gate E2E-P4:** one scripted check per item; screenshot evidence for OCR/language.
- **Risks:** bonus UI hiding contract nodes; OCR blocking save.
- **Rollback:** disable an item behind a flag; never remove contract nodes.

### P5 — Responsive and theme
- **Goal:** 10 marks.
- **Requirements:** R9, N2, N3.
- **Acceptance:** `scrollWidth <= 375` with sample and long-unicode data; dark mode contrast; tap targets; no overlap with the sticky bar.
- **Gate E2E-P5:** viewport audit + contrast audit.
- **Risks:** long names, big amounts, thumbnails, sticky bar covering the import section.
- **Rollback:** CSS-only revert.

### P6 — Hardening
- **Goal:** make the hidden-data test boring.
- **Acceptance:** 200-shop fuzz green; double import; storage cleared; quota path; `?today`; all bonuses; full regression; judges' note drafted.
- **Gate E2E-P6:** full journey + fuzz + non-functional suite.
- **Risks:** overfitting to fuzz seeds; last-minute UI changes.
- **Rollback:** freeze features; fix only.

## 3. Gate checklist (Orchestrator, every gate)

- [ ] Tester RUN id present with commands and evidence
- [ ] Phase acceptance 100%, regression 100%
- [ ] No open P0/P1
- [ ] Contract audit 100%
- [ ] Doc sync check passes
- [ ] Critic scorecard written; model score not lower than previous gate
- [ ] `worklog.md` entry with `Next:`
