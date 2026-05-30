---
id: D-046
title: Close code-level traceability — agent IS the code
status: accepted
date: 2026-05-30
driven_by:
  - R-003
enables: []
depends_on:
  - D-045
affects: []
---

# Decision: Close code-level traceability — agent IS the code

## Context

#8 proposed linking arc entities to source files via `implements` fields and code annotations (`// arc:D-001`). This creates a static mapping that rots immediately — files get moved, tests get removed, and there is no enforcement mechanism to keep arc frontmatter in sync.

## Decision

Close #8. The agent IS the code. It doesn't need arc to know about files. Code-level traceability is the agent's job, not arc's. An agent working in a repo with arc can grep, read files, and maintain its own mental model of what code implements what.

## Consequences

- No `implements` field, no `arc scan`, no `arc coverage`, no code annotations
- Arc stays pure graph — no filesystem scanning outside `.arc/`
- Simpler mental model: arc entities relate to each other, not to code
