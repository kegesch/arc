---
id: UC-038
title: Support vision entities
status: draft
date: 2026-05-31
actors:
  - Human
preconditions:
  - Arc project initialized
main_flow:
  - step: 1
    actor: User
    action: Run arc add vision with project purpose
  - step: 2
    actor: System
    action: Create vision entity
  - step: 3
    actor: User
    action: Link requirements via derived_from to vision
acceptance_criteria:
  - Vision as root node for project purpose
derived_from:
  - R-040
requested_by: []
---

# Use Case: Support vision entities

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
