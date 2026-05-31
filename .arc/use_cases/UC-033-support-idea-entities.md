---
id: UC-033
title: Support idea entities
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
    action: Run arc add idea with title
  - step: 2
    actor: System
    action: Create idea entity with explore status
  - step: 3
    actor: User
    action: Optionally promote to requirement or decision
acceptance_criteria:
  - Ideas can be created
  - explored
  - promoted
derived_from:
  - R-027
requested_by: []
---

# Use Case: Support idea entities

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
