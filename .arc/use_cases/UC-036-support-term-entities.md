---
id: UC-036
title: Support term entities
status: draft
date: 2026-05-31
actors:
  - Human
preconditions:
  - Arc project initialized
main_flow:
  - step: 1
    actor: User
    action: Run arc add term with definition
  - step: 2
    actor: System
    action: Create term entity
  - step: 3
    actor: User
    action: Reference in other entities as needed
acceptance_criteria:
  - Terms can be defined for glossary
derived_from:
  - R-030
requested_by: []
---

# Use Case: Support term entities

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
