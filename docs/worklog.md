# WORKLOG — Hisaab

Version: 0.1
Updated: 2026-11-17
Owner: Orchestrator
Supersedes: none

Append-only. Every entry: timestamp, phase, agent, action, evidence, result, next. If blocked, add `Blocker:` with the exact question for the human.

## Entry format

```
## <YYYY-MM-DD HH:MM> — <phase> — <agent>
Action: <what was done>
Evidence: <files, commands, run IDs>
Result: PASS | FAIL | BLOCKED
Next: <exact next action>
```

## Log

## 2026-11-17 12:40 — framework — human+assistant
Action: created the agent framework: AGENTS.md, 5 agent prompts, 6 living docs, test scaffolding
Evidence: `agents/*.md`, `docs/*.md`, `tests/README.md`
Result: PASS (framework)
Next: run Phase 0 — Planner produces v1 docs, then Coder P0 and Tester smoke

## 2026-11-17 13:40 — P0 — Orchestrator
Action: recorded the human decisions for G0: D1, D2, D3 accepted; D4 revised to exact integer-paise money with up to 2 dp (machine nodes bare numbers, whole values as integers, fractional values up to 2 dp, no rounding to rupees); D5, D6, D7, D8, D10 accepted; D9 revised to full-name + phone dedupe, one row per phone, last name wins with an import warning; English default confirmed; G0 A5 metavariable/HTML-tag exception approved (angle-bracket notation is intentional, TODO/TBD remains forbidden). Git baseline created for gate tags.
Evidence: session approvals 2026-11-17 13:34–13:38; `git log` baseline `bdbe01b`.
Result: PASS (decisions recorded)
Next: dispatch Planner for v1 docs

## 2026-11-17 14:05 — P0 — Planner
Action: produced v1.0 of `PRD.md`, `TECH-STACK.md`, `IMPLEMENTATION-PLAN.md`, `CONTRACT.md`, `DECISIONS.md`, `TRACEABILITY.md`; incorporated D1–D10 (D4/D9 revised), the A5 notation exception, D11/D12 implementation defaults, exact paise money rules, full P0–P6 blocks, and the judges' note skeleton.
Evidence (raw section A output):
```
A1/A2: PRD 1.0; TECH-STACK 1.0; PLAN 1.0; CONTRACT 1.0; DECISIONS 1.0; TRACEABILITY 1.0
A3/A5 TODO/TBD/(Planner) in PRD/TECH/PLAN/CONTRACT: none
A5 angle-bracket matches: 24, all in CONTRACT; 0 outside CONTRACT — approved notation
A4: P0–P6 blocks present; 8/8 core labels per phase
A6: 12 decision rows; 12 accepted; 0 proposed
A7: 23/23 traceability rows have a phase
A8 literal AGENTS `R-` check: 0 IDs matched (vacuous; project uses R1, not R-1)
A8 corrected `[RNB][0-9]+` check: 23 PRD IDs; missing in PLAN 0; missing in TRACEABILITY 0
A8 contract selectors: 29; 23 still untested in Tester-owned TEST-CASES.md:
#add-customer #cust-balance #cust-name #customers #entries #entry-amount #entry-date
#entry-form #entry-note #entry-save #entry-type #export-csv #import-msg #lang-switch
#new-name #new-phone #overdue #search [data-amount] [data-customer="<phone>"]
[data-days] [data-entry-id] [data-overdue="<phone>"]
PROJECT.md "How we check" strings in CONTRACT: 10/10 yes
```
Result: PASS (docs; A8 selector coverage deferred to the Tester per the approved sequencing)
Next: Coder P0
Note: approved deviations to carry into the Critic: A5 metavariable/HTML notation exception; A8 ID regex corrected because `AGENTS.md` §4 matches nothing for `R1`-style IDs; G0 B2/B4 "integer digits" is superseded by D4 exact-paise rendering (whole values integer, fractional up to 2 dp); D1 accepted interpretation includes positive-balance-only and no-payment-excluded; D11/D12 are Planner defaults for human veto at G0.

## 2026-11-17 14:20 — P0 — Coder
Action: created the P0 static skeleton: `app/index.html`, `app/styles.css`, `app/app.js`. Every `CONTRACT.md` §2 node is static HTML; `#total-outstanding` is `0`; the add-customer form, entry form with always-present `#shot-input`, import box/button/message, search, export, language switch, Overdue section, and customers empty state are present. `?customer=` renders a not-found customer view with `#cust-name`, `#cust-balance` (`data-balance="0"`), and an empty `#entries`; `?today=` is parsed without behaviour. Baseline light/dark CSS, 375 px layout, labels, focus ring, and `aria-live` are in place. No business logic.
Evidence: `node --check app/app.js` OK; no external URLs, `localhost`, `overflow-x`, service worker, or build files; self-check at 375 px reported `scrollWidth` 375 and zero data-dependent nodes at empty state. Coder's self-check is not a Tester run.
Result: PASS (Coder handoff; Tester verification pending)
Next: Tester P0 — update TEST-CASES selector coverage, write contract smoke, produce RUN-1

## 2026-11-17 14:35 — P0 — Tester
Action: extended `TEST-CASES.md` to v0.4 (C-01–C-39, U-01–U-14, I-01–I-10, E2E-P0-01–03, F-01/F-02, N-01–N-06); covered 29/29 contract tokens plus 9/9 letter-prefixed selectors; built the dev-only Playwright suite under `tests/`; ran RUN-1 (22/22), RUN-2 (23/23), RUN-3 (23/23; C-39 replaces the mislabelled `N6` case). No bugs filed.
Evidence: `cd tests && npx playwright test` → `23 passed (8.6s)`; 19/19 §2 nodes visible; 0 data-dependent nodes; total text and `data-value` `0`; `?customer=` not-found view; 375×812 `scrollWidth` 375 in light and dark; body contrast 17.10; requests only `/`, `/styles.css`, `/app.js`; no console errors; app SHA-256 unchanged `0cc08edf…`, `cf5a53dd…`, `58d51eac…`. Runs in `docs/test-results.md`; cases in `docs/TEST-CASES.md` v0.4.
Result: PASS (RUN-3)
Next: Critic G0

## 2026-11-17 14:45 — P0 — Planner
Action: synced `TRACEABILITY.md` v1.2 (23/23 rows, all phases, 0 TBD, test IDs mapped) and `IMPLEMENTATION-PLAN.md` v1.2 (P0 gate suite `C-01–C-03`, `C-09–C-23`, `C-39`, `E2E-P0-01–03`; `C-04–C-08` at P2/P3); corrected `DECISIONS.md` v1.1 D1 attribution (positive-balance/no-payment sub-rules are the Planner's interpretation, vetoable at G0).
Evidence: R-ID sync 23 IDs, 0 missing in PLAN/TRACEABILITY; selector sync 29/29, 0 untested; headers 4/4 on all six docs; no `TODO`/`TBD`/`(Planner)` in PRD/TECH-STACK/PLAN/CONTRACT.
Result: PASS (docs)
Next: final A evidence + Critic G0

## 2026-11-17 14:50 — P0 — Orchestrator
Action: ran final G0 section A and doc-sync evidence on the freeze candidate.
Evidence:
```
Versions: PRD 1.0 | TECH-STACK 1.0 | PLAN 1.2 | CONTRACT 1.0 | DECISIONS 1.1 | TRACEABILITY 1.2
A3/A5 TODO/TBD/(Planner) in PRD/TECH/PLAN/CONTRACT: none
A5 angle brackets: 24 total, 0 outside CONTRACT (approved notation)
A4 phase labels: P0–P6 8/8 each
A6 decisions: 12 rows, 12 accepted, 0 proposed
A7 traceability: 23 rows, 0 TBD cells, 23/23 with a phase
A8 corrected ID sync: 23 PRD IDs, 0 missing in PLAN, 0 missing in TRACEABILITY
A8 contract selectors: 29, 0 untested
PROJECT.md "How we check" strings in CONTRACT: 10/10 yes
app: 0 external URLs, 0 serviceWorker, 0 absolute asset paths
app SHA-256: index 0cc08edf…, styles cf5a53dd…, app.js 58d51eac…
```
Result: PASS (mechanical)
Next: Critic G0

## 2026-11-17 15:05 — P0 — Orchestrator — GATE G0
Action: recorded G0 PASS from the Critic's signed scorecard; marked `docs/CONTRACT.md` v1.0 **FROZEN**; committed the G0 build and created gate tag `g0` for rollback.
Evidence: `docs/scorecards.md` GATE G0 (Critic, 2026-11-17); RUN-3 (Tester) 23/23; CRITIC-RUN-1 23/23; CRITIC-ADV-1/2 independent checks; contract audit 48/48; doc sync PASS; Vercel readiness PASS; provisional model score 5/100 (P0 skeleton only).
Sign-off block:
```
Gate: G0 | Date: 2026-11-17
Mechanical (A): 9/9 — output pasted
Contract (B): 11/11
Coherence (C): 6/6
Testability (D): 6/6
Runtime (E): 6/6 — RUN-3, CRITIC-RUN-1
Human (F): 3/3
Total: 41/41
Verdict: PASS
Failures: none
```
Notes:
- `docs/G0-CHECKLIST.md` remains unchanged. Per the write-scope rule, the full checklist is reproduced with evidence in `docs/scorecards.md`; that entry is the signed record. The Orchestrator copies the sign-off here.
- Human veto window (no G0 impact): D1 positive-balance/no-payment sub-rules; D11 malformed-entry defaults; D12 UPI payee `hisaab@upi`. D1's 30+ day threshold and D2/D3/D4/D5–D10 are already accepted.
- Non-blocking risks carried forward: R-1 D9 leading-0 clause absent from CONTRACT §4 (resolve before P2, docs-only or human-approved contract change); R-2 PRD N1 "every §1–§5 selector resolves" wording (tighten at P1 sync); R-3 PRD R5 credit-entry no-screenshot not restated in CONTRACT (P3 note); R-4 no E2E-P1…P6 case rows yet; R-5 375 px with data unproven; R-6 closed by the g0 commit/tag; R-7 the 90 scored marks are unproven at P0.
- **Stop here per the human's instruction.** P1 has not started. Phase 0 is complete at G0; the next action is human review of the veto items and the P1 dispatch decision.
Next: awaits human instruction; do not start P1.

## 2026-11-17 16:40 — post-G0 — Orchestrator
Action: recorded the human's post-G0 resolutions: D1's positive-balance/no-payment sub-rules confirmed; D11 malformed-entry defaults accepted; D12 **Option A** accepted (owner-configured "Shop UPI ID" setting, demo `hisaab@upi` fallback with a visible demo label, no import-schema/contract change); R-1 resolved by aligning D9 to CONTRACT §4 (the 11-digit leading-0 clause is removed). Accepted the R-2–R-7 recommendations: R-2 tighten PRD N1 wording at the P1 doc sync; R-3 add the P3 credit-screenshot acceptance note; R-4 add E2E-P1…P6 case rows before each phase gate; R-5 add an early P1 375 px smoke with long unicode and keep the scored audit at P5; R-6 closed by tag `g0`; R-7 prioritize P1 data core and P2 import/fuzz over bonus polish.
Evidence: `docs/DECISIONS.md` v1.2 (12/12 accepted, 0 proposed, D1/D11/D12 human-confirmed, D9 aligned to CONTRACT §4); no CONTRACT/PRD/PLAN/TECH/TRACEABILITY changes; app and tests unchanged; G0 tag `g0` remains.
Scoring priority applied: hidden-data 60 (P2, R-1/D11) > bonus 30 (D12-A preserves B5; D1 overdue; D5 OCR) > phone/theme 10 (R-5 early 375 px; P5 audit).
Result: PASS (decisions recorded)
Next: no blocking items; P1 awaits human go. Non-blocking docs nuances to fold into the P1 sync: D4 says "up to two decimals" while CONTRACT §3.3 fixes fractional values at exactly two; PRD N1 over-broad wording; PRD R5 credit-screenshot note. At P4, update C-35 to cover the owner UPI setting, since it is no longer only an import-supplied VPA.

## 2026-11-17 21:35 — pre-P1 — Planner + Tester
Action: completed the pre-P1 sync. `PRD.md` v1.1 now states fractional machine values render with exactly two decimals (whole values no decimals) and N1 is tightened to the CONTRACT §2/E2E-P0-01 reading. `DECISIONS.md` v1.3 records the D4 wording clarification. `TRACEABILITY.md` v1.3 maps the new P1 cases. `IMPLEMENTATION-PLAN.md` v1.3 cites `E2E-P1-01–05`. `TEST-CASES.md` v0.5 adds planned P1 cases: data core (R1/R2/R3), reload/storage failure (R7/N5), customer view (R4), `?today` default date (R2/§1.6), and early 375 px long-unicode (R9/N2).
Evidence: R-ID sync 23 IDs, 0 missing in PLAN/TRACEABILITY; 29/29 contract selectors tested; 0 TBD; E2E-P1-01–05 defined; P0 suite still 23/23 against the unchanged app; no CONTRACT change.
Result: PASS (pre-P1 sync)
Next: Coder P1
