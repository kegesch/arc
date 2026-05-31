---
id: UC-031
title: Rename entity with propagation
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
    action: Run arc rename <old-id> <new-id>
  - step: 2
    actor: System
    action: Rename file
  - step: 3
    actor: System
    action: Find all references to old ID
  - step: 4
    actor: System
    action: Update references in other entities
acceptance_criteria:
  - ID renamed
  - all references updated
derived_from:
  - R-024
requested_by: []
---

# Use Case: Rename entity with propagation

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
