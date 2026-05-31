---
id: UC-037
title: Support use case entities
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
    action: Run arc add use_case with actors, preconditions, flow
  - step: 2
    actor: System
    action: Create use case entity with structured fields
  - step: 3
    actor: User
    action: Link to requirements via derived_from
acceptance_criteria:
  - Use cases with structured fields supported
derived_from:
  - R-039
requested_by: []
---

# Use Case: Support use case entities

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
