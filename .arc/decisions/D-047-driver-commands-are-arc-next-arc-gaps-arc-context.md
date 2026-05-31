---
id: D-047
title: Driver commands are arc next, arc gaps, arc context
status: accepted
date: 2026-05-30
driven_by:
  - R-003
enables: []
depends_on:
  - D-045
affects: []
---

# Decision: Driver commands are arc next, arc gaps, arc context

## Context

Arc currently answers factual queries (show entity, trace dependencies, find orphans). It cannot answer the most important question for a generative agent: "what should I work on next?" The graph contains all the data needed but no command synthesizes it.

## Decision (redesigned via Socratic method)

Two new driver commands, all pure graph analysis, no new entity types or fields:

1. `arc next` — what should I work on? Outputs categories (ready, needs_use_cases, needs_design, risky, orphan) WITHOUT ordering. Pure signals — the agent decides priority based on context.
2. `arc context <id>` — everything needed to implement. Full transitive closure by default, `--shallow` for one-hop only. Bundles entity with all related decisions, use cases, assumptions, risks.

`arc gaps` was merged into `arc check` as warnings (exit 0). No separate command needed.

## Consequences

- Arc goes from ledger to driver — agents can query it to decide what to do
- No filesystem access, no new data structures, just graph traversal
- `arc next` outputs signals, not orders — respects different workflows
- `arc context` compensates for LLM limitation of not making multiple calls
- Gap warnings in `arc check` keep CI clean (exit 0 for gaps, exit 1 for errors)
