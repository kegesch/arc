---
id: D-048
title: Close artifact chains machinery — provenance field is sufficient
status: accepted
date: 2026-05-30
driven_by:
  - R-003
enables: []
depends_on:
  - D-045
affects: []
---

# Decision: Close artifact chains machinery — provenance field is sufficient

## Context

#9 proposed artifact chains with `generated_from` fields, staleness detection via file timestamps, and `arc regenerate` to mark downstream chains as stale. The staleness detection depends on file mtimes (git doesn't preserve them) and `arc regenerate` is orchestration (arc is the graph, not the orchestrator).

## Decision

Close #9's machinery (staleness detection, regeneration). Keep only the seed idea: an optional `provenance` field that records where an entity came from (source doc, entity ID, or free text). No enforcement, no verification, just metadata for the next agent session.

## Consequences

- No staleness detection, no `arc regenerate`, no file timestamp comparison
- Optional `provenance` field may be added as a simple frontmatter string
- Arc doesn't need to read files outside `.arc/` for this
