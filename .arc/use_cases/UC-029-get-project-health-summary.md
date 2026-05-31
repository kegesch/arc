---
id: UC-029
title: Get project health summary
status: draft
date: 2026-05-31
actors:
  - Human
  - Agent
preconditions:
  - Arc project exists
main_flow:
  - step: 1
    actor: User
    action: Run arc status
  - step: 2
    actor: System
    action: Count entities by type and status
  - step: 3
    actor: System
    action: Check for issues (dangling refs, orphans)
  - step: 4
    actor: System
    action: Display summary
acceptance_criteria:
  - Entity counts
  - status breakdown
  - issues shown
derived_from:
  - R-022
requested_by: []
---

# Use Case: Get project health summary

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
