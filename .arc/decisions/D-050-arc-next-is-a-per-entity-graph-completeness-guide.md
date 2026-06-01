---
id: D-050
title: "arc next is a per-entity graph-completeness guide"
status: proposed
date: 2026-05-31
driven_by: [R-003, R-041]
supersedes: D-047
---

## Context

D-047 designed `arc next` as a forward-looking work prioritization tool: categorize all accepted requirements by readiness (ready, needs_use_cases, needs_design, risky, orphan). This has a fatal flaw: it assumes the graph is fully populated. In practice, requirements often live in GitHub Issues or Jira, not in arc. `arc next` returns nothing useful until someone invests heavily in populating the graph first.

`arc impact` and `arc trace` already do graph traversal in two directions. A third traversal that just categorizes readiness adds overlap without adding unique value.

## Decision

Redesign `arc next <entity>` as a **per-entity graph-completeness guide**. Instead of "what should I build next?" it answers "what is this entity missing to be well-connected in the graph?"

**With argument** — `arc next R-041`:
- Analyzes the entity's current links
- Reports missing connections (decisions, use cases, assumptions, entity models)
- Suggests the exact command to fix each gap
- Warns about structural risks (unvalidated assumptions backing accepted decisions)

**Without argument** — `arc next`:
- Aggregates completeness across all entities
- Shows entities needing attention with specific missing links
- Shows most-complete entities ready to implement
- Provides graph completeness percentage

Completeness rules per entity type:
- R-xxx: needs ≥1 decision, ideally use cases and entity models
- D-xxx: needs ≥1 requirement (driven_by), ideally linked assumptions
- A-xxx: needs validation/invalidation, ideally decisions that depend on it
- UC-xxx: needs ≥1 requirement (derived_from), filled acceptance criteria
- EM-xxx: needs ≥1 requirement or decision
- K-xxx: needs mitigation decision or accepted risk status
- V-xxx: needs ≥1 requirement deriving from it
- I-xxx: no minimum (speculative by nature), warn if stale

This makes `arc next` distinct from `arc trace` (what backs this) and `arc impact` (what depends on this). Three different questions, no overlap:
- `trace` → downward traversal (provenance)
- `impact` → upward traversal (blast radius)
- `next` → completeness analysis (what's missing)

## Consequences

- `arc next` works immediately for any entity, even in a sparse graph — no cold start problem
- Drives agent behavior by suggesting concrete commands to run
- Replaces abstract readiness categories with actionable "add this link" guidance
- Makes `arc check` (structural errors) and `arc next` (completeness gaps) complementary, not overlapping
- Removes the assumption that all requirements must be in arc before the tool is useful
