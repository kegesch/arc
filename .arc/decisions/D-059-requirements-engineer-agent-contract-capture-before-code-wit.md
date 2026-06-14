---
id: D-059
title: "Requirements-engineer agent contract: capture-before-code with an arc context hand-off"
status: proposed
date: 2026-06-14
tags:
  - agents
  - integration
driven_by:
  - R-010
  - R-042
enables: []
depends_on: []
affects: []
---

## Context

D-058 decides to delegate graph capture to a specialist agent. This decision specifies that agent's contract. It uses only existing arc capability, so R-042 (`arc context` bundles an entity with all related entities) is the hand-off mechanism.

## Decision — the RE agent contract

**Role.** A single-purpose agent that turns a request into a well-formed slice of the graph. It never edits `src/`. Candidate for a small local/tier1 model (`.ketchup/state.json`) since capture is its only job.

**Inputs.**
- The user request / task.
- Existing graph context: `arc status`, `arc query "<area>"`, `arc context <neighbor-id> --shallow` to avoid duplicating entities.

**Outputs — mandatory on every slice (traceability core).**
- One testable **R-xxx** (the requirement driving the work), `derived_from` an existing pillar or vision so it traces up.
- A **D-xxx** for every design choice, `driven_by` the R (and a real assumption/requirement — never an invalidated one).
- An **A-xxx** for each unvalidated belief, with a concrete validation path in the body.
- Links, consistent tags, and a clean `arc check` (no new anomalies).

**Outputs — as-needed (readiness; create when the situation calls, omit otherwise).**
- **UC-xxx** (use cases) when the requirement is user-facing behavior — without them `arc next` caps the requirement at "Needs use cases", not "Ready".
- **EM-xxx** (entity models) when the work introduces or changes domain entities.
- **K-xxx** (risks) the moment a risk surfaces during capture, `mitigated_by` the decision that addresses it.
- **I-xxx** (ideas) for speculative by-catch worth logging without committing — non-binding, free to add.
- **S-xxx** (stakeholders) / **T-xxx** (terms) when "who asked for this?" or new vocabulary is load-bearing for the slice.

**Hand-off.** The RE agent returns **one ID** (the requirement). The coding agent runs `arc context <id> --format json`, implements, and references that ID in its commit. No second source of truth.

**Non-goals.**
- The RE agent does not write implementation code.
- The coding agent does not author entities (at most minor `arc link` touch-ups).
- The RE agent never creates a **V-xxx** — visions are project-level and pre-existing (typically one per project). It links the requirement up to the existing vision via `derived_from`.
- The RE agent does not guarantee the graph is *complete* — only that *this slice* is traceable (mandatory core) and as *ready* as the task warrants (as-needed tier).

## Consequences

- The coding agent's precondition becomes machine-checkable (D-060).
- `arc context` becomes the contract boundary between two agents — a stable, structured hand-off instead of free-form prose.
- Keeps arc feature-light: the contract is a usage pattern over R-042, not a new command.

## Validation

Adopted when: a coding agent implements against an RE-authored `arc context <id>` and the graph stays healthy **without** a validator NACK. That outcome is the remediation evidence for A-013.
