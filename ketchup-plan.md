# Plan — fix how agents use arc (instruction text, 5 surfaces)

## Problem (evidence from this repo's .arc/)

1. R/D confusion: every surface leads with "make a requirement"; no R-vs-D aid. (50 R / 61 D)
2. Only R/D/I: reminder omits S/UC/EM/V; validator only sees R/D/A/K. (4 K, 1 V)
3. Never reworks: "supersedes" appears 0x in any workflow/process step. (4/61 D superseded, 0 R deprecated)
4. Write-only: reminder step 1 is "create"; query cmds only in reference.

## Scope chosen: rewrite all 5 surfaces, text-only, no structural change

## TODO

- [Burst 1] init-agent.ts: add supersede rule + R/D aid + query-first to getArcSection().
  TCR: add failing contract test "emitted section mentions supersede" first.
- [Burst 2] skill/arc/SKILL.md: + R/D decision aid, + "Rework: supersede don't duplicate" workflow, query-first intro. Keep required strings (ARC, tagline, arc add requirement/decision, arc check, 7 types, no MCP).
- [Burst 3] skill/agents/arc-reminder.md + arc-requirements-engineer.md (GENERIC templates): query-first, full entity table, supersede step, R/D aid. Must stay generic (no `bun run dev`, no D-0xx) — guarded by init-agent.test.ts.
- [Burst 4] Repo instance: AGENTS.md (root) + installed customized copies (.ketchup/reminders/arc.md, .pi/agents/arc-requirements-engineer.md). PRESERVE repo customizations (K-004, A-013, D-059, V-001, D-034/D-045, `bun run dev`).

## DONE

- (none yet)

## Test strategy (honest)

- init-agent.ts is the only CODE change -> full TCR with contract test.
- Pure-markdown files: guard is existing contract tests stay green + grep proves new guidance present. No brittle per-sentence prose tests (YAGNI).
