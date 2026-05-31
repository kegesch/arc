---
id: UC-034
title: Support stakeholder entities
status: draft
date: 2026-05-31
actors:
  - Human
preconditions:
  - Arc project initialized
main_flow:
  - step: 1
    actor: User
    action: Run arc add stakeholder with name
  - step: 2
    actor: System
    action: Create stakeholder entity
  - step: 3
    actor: User
    action: Link to requirements via requested_by
acceptance_criteria:
  - Stakeholders can be tracked and linked
derived_from:
  - R-028
requested_by: []
---

# Use Case: Support stakeholder entities

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
