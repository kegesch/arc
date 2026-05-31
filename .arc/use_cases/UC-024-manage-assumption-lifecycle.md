---
id: UC-024
title: Manage assumption lifecycle
status: draft
date: 2026-05-31
actors:
  - Human
  - Agent
preconditions:
  - Assumption exists
main_flow:
  - step: 1
    actor: User
    action: Run arc validate/invalidate/promote on assumption
  - step: 2
    actor: System
    action: Update assumption status
  - step: 3
    actor: System
    action: If promoting, create new requirement and link decisions
acceptance_criteria:
  - Assumption can be validated
  - invalidated
  - or promoted
derived_from:
  - R-009
requested_by: []
---

# Use Case: Manage assumption lifecycle

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
