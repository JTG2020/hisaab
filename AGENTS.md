# Hisaab — Agent Framework

This folder is **one project**. Never read, reference, or modify a sibling project folder.

- Deployable unit: `app/` (static; Vercel Root Directory = `app`).
- Source brief (read-only): `PROJECT.md`, `WIN-ANALYSIS.md`, `WIN-PLAN.md`, `DESIGN.md`, `sample-*.json`.
- Living docs (versioned, owned): `docs/`.
- Verification: `tests/` (Playwright, dev-only).

Deadline: **Sun 22 Nov 2026, 10:00 am IST**. Tie-break: earlier submission.

---

## 1. How to start

Paste this to the Orchestrator agent:

> You are the Orchestrator for Hisaab. Read `AGENTS.md` and every file in `docs/` and `agents/`, then execute Phase 0 exactly as defined in `docs/IMPLEMENTATION-PLAN.md`. Stop at gate G0 and report.

Do not start the Coder before the Planner has produced `PRD.md`, `TECH-STACK.md`, `IMPLEMENTATION-PLAN.md`, `CONTRACT.md`, `DECISIONS.md`, and `TRACEABILITY.md` at v1.

## 2. Roles and write scopes

| Agent | May write | Must never write |
|---|---|---|
| Orchestrator | `docs/worklog.md` | app code, tests, other docs |
| Planner | `docs/PRD.md`, `docs/TECH-STACK.md`, `docs/IMPLEMENTATION-PLAN.md`, `docs/CONTRACT.md`, `docs/DECISIONS.md`, `docs/TRACEABILITY.md` | `app/`, `tests/`, test results |
| Coder | `app/**` | docs, tests, worklog |
| Tester | `tests/**`, `docs/TEST-CASES.md`, `docs/test-results.md` | `app/**`, PRD/plan/contract |
| Critic | `docs/scorecards.md` | everything else |

Every role reads the whole `docs/` set before acting. No role may weaken a test, rename a contract node, or change a requirement to make a result green.

## 3. The loop

```
Phase 0: Planner ──► G0 (docs complete + contract frozen + smoke green)
For each phase Pn in docs/IMPLEMENTATION-PLAN.md:
  Coder(Pn) ──► Tester(Pn: unit + integration + regression)
     ▲                    │ red: bug report (repro + root cause)
     └────────────────────┘ Coder fixes; Tester re-runs the FULL suite
                          │ green
                          ▼
                  Tester E2E gate suite (only here)
                          │ green
                          ▼
                  Critic scorecard ──► G_n gate ──► next phase
```

Rules:

1. One phase at a time. No parallel phases inside this project.
2. E2E runs **only at phase gates**. Every change runs the 10-second contract smoke + affected unit tests.
3. A red test blocks the phase. Fix the cause, not the assertion.
4. No phase advances without a Critic scorecard and an Orchestrator gate entry in `worklog.md`.
5. If a phase needs a change to `CONTRACT.md`, stop and escalate (see §6).

## 4. Doc sync protocol (non-negotiable)

Source of truth order: **PRD (what) → TECH-STACK (constraints) → IMPLEMENTATION-PLAN (sequence) → CONTRACT (machine interface) → TEST-CASES (oracle)**.

Every doc carries a header:

```
Version: x.y
Updated: YYYY-MM-DD
Owner: <agent>
Supersedes: <doc or none>
```

Any change requires, **in the same phase**:

1. Bump `Version` and `Updated` on every affected doc.
2. Update `TRACEABILITY.md`: every new/changed `R-*` maps to a phase, selector(s), and test case ID(s).
3. Update `IMPLEMENTATION-PLAN.md` if sequencing, scope, or gate criteria changed.
4. Append a `worklog.md` entry stating what changed and why.
5. If `CONTRACT.md` changed: version bump, full regression re-run, Critic re-score, and a human note.

**Sync check before every gate** (Orchestrator runs it and pastes output into `worklog.md`):

```bash
# 1. Every R-ID in PRD appears in PLAN and TRACEABILITY
grep -o 'R-[0-9]\+' docs/PRD.md | sort -u > /tmp/r
grep -o 'R-[0-9]\+' docs/IMPLEMENTATION-PLAN.md | sort -u > /tmp/p
grep -o 'R-[0-9]\+' docs/TRACEABILITY.md | sort -u > /tmp/t
comm -23 /tmp/r /tmp/p   # must be empty
comm -23 /tmp/r /tmp/t   # must be empty
# 2. Every contract selector appears in at least one test case
grep -o '`[#\[][^`]*`' docs/CONTRACT.md | tr -d '`' | sort -u > /tmp/s
while read -r sel; do grep -qF "$sel" docs/TEST-CASES.md || echo "UNTESTED: $sel"; done < /tmp/s
# 3. No doc references a removed R-ID (add removals to DECISIONS.md)
```

## 5. Contract lock

`docs/CONTRACT.md` is frozen at G0. After G0:

- No renaming, moving, or conditionally rendering a machine node.
- No formatting change inside a machine node (bare digits only).
- UI work may not hide `#import-box`, `#import-go`, `#shot-input`, `#total-outstanding`, `[data-customer]`, `[data-balance]`, `a[data-remind]`.

## 6. Bug protocol

Tester files (never fixes):

```
BUG-<n> | severity P0/P1/P2/P3 | phase | case ID
Expected: <exact>
Actual: <exact>
Repro: <commands/steps>
Evidence: <command + output snippet>
Suspected layer: <normalise|balance|render|storage|import|css|...>
Root cause: <stated, not guessed>
Contract impact: none | <selector>
```

Coder fixes the cause. Tester adds the regression case from the spec (not from the fix), verifies it fails on the old build if available, then re-runs the **full** suite. P0/P1 bugs block the gate; P2/P3 need an explicit Critic waiver.

## 7. Human gates (stop and ask)

- Any change to `CONTRACT.md` after G0.
- Any ambiguity in `DECISIONS.md` that is still `proposed`.
- Adding a dependency, build step, framework, backend, or external service.
- Exposing keys, auth, or personal data.
- Going live / submitting, and the final judges' note.

## 8. Vercel constraints (design for this from P0)

- Deployable output is `app/`; no build step required.
- `app/index.html` is the entry. Customer view uses `?customer=<phone>` (no server rewrites).
- All asset paths are relative (`./assets/...`), never absolute or `localhost`.
- No service worker, no auth, no cookies required, no server runtime.
- Optional `app/vercel.json` only for headers/rewrites; must not be required for the app to work.
- Local verification: `python3 -m http.server 4173 --directory app`, then run tests against `http://localhost:4173`.

## 9. Scoring (what "done" means)

| Marks | Check | Evidence required |
|---|---|---|
| 60 | Hidden-data test | Fuzz run over randomised shops, independent expected values |
| 30 | Bonus (7 items, 6 count) | One test/screenshot per item in `test-results.md` |
| 10 | 375 px + light/dark | `scrollWidth` assertion + dark-mode contrast check |
| Tie | Earlier submission | Submit as soon as the final gate is green |

Gate thresholds: G0 = `docs/G0-CHECKLIST.md` fully ticked with evidence (contract audit 100%, docs complete and in sync, smoke green, RUN id); each phase gate 100% acceptance + 100% regression, no open P0/P1; final model score ≥95/100.

## 10. Phase index

See `docs/IMPLEMENTATION-PLAN.md`. Phases: P0 skeleton, P1 data core, P2 import, P3 reminders/screenshot, P4 bonuses, P5 responsive/theme, P6 hardening.
