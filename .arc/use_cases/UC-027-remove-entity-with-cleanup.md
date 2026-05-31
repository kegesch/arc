---
id: UC-027
title: Remove entity with cleanup
status: draft
date: 2026-05-31
actors:
  - Human
  - Agent
preconditions:
  - Entity exists
main_flow:
  - step: 1
    actor: User
    action: Run arc remove <id> --clean
  - step: 2
    actor: System
    action: Delete entity file
  - step: 3
    actor: System
    action: Find all references to deleted entity
  - step: 4
    actor: System
    action: Remove references from other entities
acceptance_criteria:
  - Entity removed
  - dangling refs cleaned
derived_from:
  - R-019
requested_by: []
---

# Use Case: Remove entity with cleanup

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
