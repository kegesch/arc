---
id: UC-012
title: Promote entity
status: draft
date: 2026-05-30
context: core
actors:
  - User
  - Agent
preconditions:
  - Assumption is validated or idea exists
main_flow:
  - step: 1
    actor: User
    action: Runs arc promote <id> with optional --to flag
  - step: 2
    actor: System
    action: Validates entity is promotable
  - step: 3
    actor: System
    action: Creates new entity with appropriate type
  - step: 4
    actor: System
    action: Links dependent decisions to the new entity
acceptance_criteria:
  - Assumption promoted to requirement
  - Idea promoted to requirement or decision
  - Dependent decisions auto-linked to new entity
derived_from: []
requested_by: []
---

# Use Case: Promote entity

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
