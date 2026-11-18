# G0 CHECKLIST — Hisaab

Version: 0.2
Updated: 2026-11-18
Owner: Critic (verifies and signs) · Orchestrator (runs the mechanical part)
Supersedes: G0-CHECKLIST.md v0.1
Gate: **G0 — docs frozen, contract frozen**

Rule: **PASS only if every box is ticked with evidence.** An unticked box, an empty evidence cell, or an unreviewed judgment item is a FAIL. "Looks complete" is not evidence.

## A. Mechanical completeness (Orchestrator script; paste raw output)

- [ ] A1 Six living docs exist: `PRD.md`, `TECH-STACK.md`, `IMPLEMENTATION-PLAN.md`, `CONTRACT.md`, `DECISIONS.md`, `TRACEABILITY.md`
- [ ] A2 Each has `Version`, `Updated`, `Owner`, `Supersedes`
- [ ] A3 PRD has no `TODO` / `TBD` / `(Planner)` marker left; every R/B/N has acceptance text
- [ ] A4 PLAN has a block for P0–P6, each with goal, R-IDs, selectors, acceptance, gate suite, risks, rollback
- [ ] A5 CONTRACT has no placeholder text (`<...>`, `TODO`, `TBD`) and no empty section
- [ ] A6 DECISIONS: every row has rationale, impact, and a status (`proposed`/`accepted`); none blank
- [ ] A7 TRACEABILITY: every R/B/N row has a phase; no row is unassigned
- [ ] A8 Sync check (`AGENTS.md` §4) produces **zero** missing R-IDs and **zero** untested contract selectors
- [ ] A9 No doc references a removed requirement ID

Commands (must be pasted into `worklog.md`):

```bash
grep -nE 'TODO|TBD|\(Planner\)|<[a-z-]+>' docs/PRD.md docs/TECH-STACK.md docs/IMPLEMENTATION-PLAN.md docs/CONTRACT.md
grep -o 'R-[0-9]\+' docs/PRD.md | sort -u > /tmp/r
grep -o 'R-[0-9]\+' docs/IMPLEMENTATION-PLAN.md | sort -u > /tmp/p
grep -o 'R-[0-9]\+' docs/TRACEABILITY.md | sort -u > /tmp/t
comm -23 /tmp/r /tmp/p ; comm -23 /tmp/r /tmp/t
grep -o '`[#\[][^`]*`' docs/CONTRACT.md | tr -d '`' | sort -u > /tmp/s
while read -r sel; do grep -qF "$sel" docs/TEST-CASES.md || echo "UNTESTED: $sel"; done < /tmp/s
```

## B. Contract completeness (Critic judgment, per item)

- [ ] B1 Every check listed in `PROJECT.md` "How we check" appears **verbatim** in `CONTRACT.md`
- [ ] B2 `#total-outstanding` rule states bare integer digits and the signed-net formula
- [ ] B3 One-row-per-customer rule covers zero balance, duplicate phone, unknown phone, and customer page
- [ ] B4 `[data-balance]` states attribute **and** text, signed, integer
- [ ] B5 `a[data-remind]` states the exact `https://wa.me/91<phone>?text=` format and required content
- [ ] B6 `#import-box` / `#import-go` state replace (never merge), visible, always rendered, error behaviour
- [ ] B7 `#shot-input` / `img[data-shot]` state always-rendered input and post-save image
- [ ] B8 `?today=` and `?customer=` semantics are explicit
- [ ] B9 Bonus hooks are listed (`#search`, `#export-csv`, Overdue section, UPI link, language switch, OCR)
- [ ] B10 Forbidden list and grader-worst-case assumptions are present
- [ ] B11 A Coder could implement P0 from `CONTRACT.md` alone without asking a question

## C. Coherence (Critic, cross-doc)

- [ ] C1 Every selector named in PRD/PLAN exists in CONTRACT; every CONTRACT node is claimed by a requirement
- [ ] C2 TECH-STACK has no undecided item; every decision has status and rejected alternative
- [ ] C3 PLAN phases reference only existing IDs; no phase has zero requirements or no gate suite
- [ ] C4 PLAN's file scopes, phases and gate order match `AGENTS.md` §3
- [ ] C5 DECISIONS covers every ambiguity the PRD flags; human-gate items are identifiable
- [ ] C6 Doc versions/updates are mutually consistent for this freeze

## D. Testability (Critic judgment)

- [ ] D1 Every R/B has at least one acceptance criterion observable via a selector or a measurement
- [ ] D2 No acceptance criterion depends on taste, judgment, or "looks good"
- [ ] D3 Each phase has an E2E gate suite named, and E2E is marked gate-only
- [ ] D4 Hidden-data cases are listed per requirement that can be fed arbitrary data (R3, R8, R6)
- [ ] D5 Bonus items have a stated likely check (script or screenshot)
- [ ] D6 TRACEABILITY is consistent with TEST-CASES for assigned IDs; unassigned IDs are `TBD` and must be filled by that row's phase gate

## E. Runtime proof (Tester, RUN-1)

- [ ] E1 `app/` serves locally and every contract selector resolves at first paint with empty state
- [ ] E2 `#total-outstanding` reads `0` on empty state
- [ ] E3 `#import-box`, `#import-go`, `#shot-input` are visible (not behind a modal/tab/`<details>`)
- [ ] E4 No console errors on load
- [ ] E5 Vercel shape: `app/index.html`, relative paths, no build step, no auth, no service worker
- [ ] E6 C-01…C-12 (or the project's contract cases) pass

## F. Human decisions (stop if pending)

- [ ] F1 Every `DECISIONS.md` item needed by P1–P3 is `accepted` (Hisaab: D1–D4; FrontDesk: D1–D3, D6, D7)
- [ ] F2 Any accepted deviation is recorded with its impact
- [ ] F3 Judges'-note skeleton is drafted (not submitted yet)

## Sign-off block

```
Gate: G0 | Date: <date>
Mechanical (A): <n>/9 — output pasted
Contract (B): <n>/11
Coherence (C): <n>/6
Testability (D): <n>/6
Runtime (E): <n>/6 — RUN-<n>
Human (F): <n>/3
Verdict: PASS | FAIL
Failures: <list, one line each>
```

Verified by: **Critic** (signature row in `docs/scorecards.md`) · Recorded by: **Orchestrator** (`docs/worklog.md`) · Decisions accepted by: **Human**.

On FAIL: the failure list becomes the Planner's task (docs) or Coder's task (runtime), then the full checklist is re-run. No partial PASS, no phase starts.
