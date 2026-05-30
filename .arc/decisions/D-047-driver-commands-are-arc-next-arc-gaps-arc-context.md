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

## Decision

Three new driver commands, all pure graph analysis, no new entity types or fields:

1. `arc next` — what should I work on? Ranks requirements by readiness (has decisions? has use cases?), flags risky assumptions, finds orphans.
2. `arc gaps` — where is the graph incomplete? Requirements without decisions, decisions without use cases, unvalidated assumptions backing accepted decisions.
3. `arc context <id>` — everything needed to implement. One JSON payload: the entity, all related decisions, use cases, entity models, assumptions.

## Consequences

- Arc goes from ledger to driver — agents can query it to decide what to do
- No filesystem access, no new data structures, just graph traversal
- `arc next` + `arc gaps` share most of their analysis logic
- `arc context` is a convenience wrapper around existing trace/show commands
