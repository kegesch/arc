---
id: UC-021
title: Detect requirement contradictions
status: draft
date: 2026-05-31
actors:
  - Agent
preconditions:
  - Multiple requirements exist
main_flow:
  - step: 1
    actor: Agent
    action: Run arc check
  - step: 2
    actor: System
    action: Find explicit conflicts_with edges
  - step: 3
    actor: System
    action: Scan for opposing keyword pairs
  - step: 4
    actor: System
    action: Report possible contradictions
acceptance_criteria:
  - Explicit conflicts and heuristic opposites flagged
derived_from:
  - R-006
requested_by: []
---

# Use Case: Detect requirement contradictions

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
