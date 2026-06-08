---
id: UC-008
title: List entities
status: draft
date: 2026-05-30
context: core
actors:
  - User
  - Agent
  - CI pipeline
preconditions:
  - Project has .arc/ directory
main_flow:
  - step: 1
    actor: User
    action: Runs arc list with optional filters
  - step: 2
    actor: System
    action: Reads all entities from disk
  - step: 3
    actor: System
    action: Applies filters
  - step: 4
    actor: System
    action: Renders grouped list with status icons
acceptance_criteria:
  - Entities grouped by type
  - Filterable by type
  - status
  - tag
  - context
  - Output as text table or JSON
derived_from:
  - R-003
requested_by: []
---

# Use Case: List entities

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
