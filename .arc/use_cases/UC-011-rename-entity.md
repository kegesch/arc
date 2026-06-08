---
id: UC-011
title: Rename entity
status: draft
date: 2026-05-30
context: core
actors:
  - User
preconditions:
  - Entity exists in .arc/
main_flow:
  - step: 1
    actor: User
    action: Runs arc rename <old-id> <new-id>
  - step: 2
    actor: System
    action: Validates type prefix matches
  - step: 3
    actor: System
    action: Renames entity file
  - step: 4
    actor: System
    action: Propagates new ID to all entities that reference the old ID
acceptance_criteria:
  - Entity file renamed
  - All references across the graph updated
  - Type mismatch between old and new prefix rejected
derived_from:
  - R-024
requested_by: []
---

# Use Case: Rename entity

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
