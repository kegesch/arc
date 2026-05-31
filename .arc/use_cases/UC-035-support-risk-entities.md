---
id: UC-035
title: Support risk entities
status: draft
date: 2026-05-31
actors:
  - Human
  - Agent
preconditions:
  - Arc project initialized
main_flow:
  - step: 1
    actor: User
    action: Run arc add risk with title
  - step: 2
    actor: System
    action: Create risk entity with identified status
  - step: 3
    actor: User
    action: Link to mitigating decisions
  - step: 4
    actor: User
    action: Update status to mitigated when addressed
acceptance_criteria:
  - Risks tracked with mitigation status
derived_from:
  - R-029
requested_by: []
---

# Use Case: Support risk entities

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
