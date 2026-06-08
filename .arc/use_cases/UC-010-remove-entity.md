---
id: UC-010
title: Remove entity
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
    action: Runs arc remove <id> with optional --force or --clean
  - step: 2
    actor: System
    action: Checks for dependents
  - step: 3
    actor: System
    action: If --clean, removes references from all dependent entities
  - step: 4
    actor: System
    action: Deletes entity file
acceptance_criteria:
  - Entity file deleted
  - Option to force removal despite dependents
  - Option to clean references from dependents
derived_from:
  - R-019
requested_by: []
---

# Use Case: Remove entity

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
