---
id: R-041
title: arc next must analyze per-entity graph completeness and suggest missing links
status: draft
date: 2026-05-31
derived_from: []
conflicts_with: []
requested_by: []
---

# Requirement: arc next must categorize accepted requirements by readiness — ready (decisions + use cases), needs_use_cases (decisions only), needs_design (no decisions), risky (unvalidated assumptions backing accepted decisions), orphan (decisions with no backing requirement)

## Description

`arc next <entity>` analyzes a single entity's connections in the graph and reports what's missing — decisions, use cases, assumptions, entity models, or validation status. Each gap includes the exact command to fix it.

`arc next` (no argument) aggregates completeness across all entities, showing those needing attention and those ready to implement.

Completeness rules differ per entity type (R needs decisions, D needs requirements, A needs validation, etc.). This is distinct from `arc trace` (provenance) and `arc impact` (blast radius).

## Acceptance Criteria

- `arc next R-xxx` reports missing decisions, use cases, entity models with suggested commands
- `arc next D-xxx` reports missing requirements and unlinked assumptions
- `arc next A-xxx` reports validation status and downstream impact if invalidated
- `arc next` (no arg) shows aggregate graph completeness and entities needing attention
- Output includes actionable commands (`arc add decision ... --driven-by R-xxx`) for each gap
- Works for any entity even in a sparsely populated graph
