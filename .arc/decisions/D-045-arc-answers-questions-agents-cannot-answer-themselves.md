---
id: D-045
title: Arc answers questions agents cannot answer themselves
status: accepted
date: 2026-05-30
driven_by:
  - R-003
  - A-013
  - A-014
enables: []
depends_on: []
affects: []
---

# Decision: Arc answers questions agents cannot answer themselves

## Context

Arc has accumulated feature proposals that cross the architecture→code boundary (code traceability, test traceability, artifact chains). These all share the same flaw: they require maintaining a static mapping between arc entities and source files that rots immediately with no enforcement mechanism.

## Decision

Arc's value is the architecture graph. Arc should answer questions that agents cannot answer by themselves. An agent can read files, scan code, and check tests. It cannot synthesize "what should I build next" from a web of 100+ relationships. That synthesis is arc's job.

Feature priority is determined by: does the agent need arc to answer this, or can it figure it out alone?

## Consequences

- Arc stays focused on graph analysis, not filesystem scanning or code annotation
- Closes the door on code-level traceability, test annotations, artifact staleness detection
- Opens the door to driver commands (arc next, arc gaps, arc context) that are pure graph analysis
- Arc becomes a driver, not just a ledger
