---
id: D-049
title: Add vision entity type as graph root — before driver commands
status: accepted
date: 2026-05-31
driven_by:
  - R-040
  - R-003
enables: []
depends_on:
  - D-045
affects: []
---

# Decision: Add vision entity type as graph root — before driver commands

## Context

Arc has no graph root. The traceability chain starts at requirements and goes sideways (R↔D) or down (R→UC→EM) but never up. An agent arriving at a project asks "what is this?" first, not "what should I build?" Without a vision in the graph, `arc next` can rank readiness but not importance — two equally-ready requirements have no way to determine which matters more.

## Decision

Add a vision entity type (V-xxx) as the graph root, before building driver commands (#25). The vision captures project purpose and direction. Requirements derive from visions. The vision is the terminal node in upward traversal — `arc trace R-001` reaches V-001 and tells you *why*.

Design:
- Lifecycle: `active | retired` — you don't draft a vision, either it's why you're building or you've pivoted
- No special structured fields — the body IS the vision document
- Requirements link via `derived_from` (reusing existing edge type)
- Follows EntityDescriptor pattern (D-042)
- Typically one per project, rarely two

## Consequences

- The graph gains a root — every entity can trace up to a reason for existing
- `arc next` can weight requirements by alignment with vision
- `arc check` can flag orphan requirements (not derived from any vision)
- Invalidating a vision (retiring it) signals a pivot and flags all downstream entities for re-evaluation
- Driver commands (#25) become more powerful because they can answer "does this matter?" not just "is this ready?"
