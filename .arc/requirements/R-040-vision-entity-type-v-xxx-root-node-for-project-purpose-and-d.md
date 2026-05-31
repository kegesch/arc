---
id: R-040
title: Vision entity type (V-xxx) — root node for project purpose and direction
status: accepted
date: 2026-05-31
derived_from: []
conflicts_with: []
requested_by: []
---

# Requirement: Vision entity type (V-xxx) — root node for project purpose and direction

## Description

The arc graph currently has no root node. Requirements trace sideways (R↔D) and down (R→UC→EM) but never up to a reason. `arc trace R-001` stops at the requirement — it cannot tell you _why_ that requirement exists.

A vision entity (V-xxx) serves as the terminal node in upward traversal. It captures the project purpose, direction, and success criteria. Every requirement should trace up to a vision. Without it, the graph cannot answer "does this matter?" or "why are we building this?"

This is especially critical for driver commands (#25) — `arc next` can rank readiness but cannot rank importance without understanding what the project is trying to achieve.

## Acceptance Criteria

- Vision entity type (V-xxx) with lifecycle: active | retired
- No special structured fields — the body IS the vision document (purpose, success criteria)
- Requirements can link to visions via `derived_from` edge (reusing existing edge type)
- `arc add vision`, `arc show V-001`, `arc trace V-001` work via EntityDescriptor pattern
- `arc trace R-001` walks up to the vision and shows _why_ the requirement exists
- `arc check` can warn about requirements not derived from any vision
- Follows the same EntityDescriptor pattern as UC-xxx and EM-xxx (D-042)
