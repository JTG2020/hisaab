# Hisaab — project workspace

Digital ledger for a local shop, with WhatsApp reminders. Build Projects, Freedom With AI.
Deadline: **Sun 22 Nov 2026, 10:00 am IST**.

This folder is self-contained. Do not mix in the other project.

## Read in this order

1. [`PROJECT.md`](PROJECT.md) — what the page asks for: requirements, the exact DOM contract the tester reads, bonus menu, scoring.
2. [`WIN-ANALYSIS.md`](WIN-ANALYSIS.md) — the honest read: what is actually scored, why we might lose, strategy, definition of done, judges' note.
3. [`WIN-PLAN.md`](WIN-PLAN.md) — execution: contract skeleton, data model, edge-case matrix, bonus specs, fuzz harness, build order.
4. [`DESIGN.md`](DESIGN.md) — UI/UX: design constraints, tokens, screens, states, visual risks.

## Sample data

- [`sample-data.json`](sample-data.json) — 8 customers, 38 entries (fictional shop).
- [`sample-expected.json`](sample-expected.json) — expected total `11820` and per-phone balances.

## Agent framework

| Path | Role |
|---|---|
| `AGENTS.md` | orchestration contract: roles, write scopes, loop, gates, doc-sync, Vercel rules |
| `agents/orchestrator.md` | runs the loop and gates; writes only `docs/worklog.md` |
| `agents/planner.md` | owns PRD, TECH-STACK, IMPLEMENTATION-PLAN, CONTRACT, DECISIONS, TRACEABILITY |
| `agents/coder.md` | implements one phase at a time in `app/` |
| `agents/tester.md` | independent oracle, cases, runs, bug reports; never fixes |
| `agents/critic.md` | scores against the rubric and gates; never builds |
| `docs/` | living documents (versioned) — see `AGENTS.md` §4 for sync rules |
| `tests/README.md` | test layout, commands, gate policy |

Deployable unit is `app/` (not created yet). Start by pasting the Phase 0 prompt from `AGENTS.md` §1.

## First action

Build the contract skeleton + replica harness (see `WIN-PLAN.md` §9), then submit early and iterate.
