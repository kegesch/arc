---
id: UC-042
title: Store data in project root
status: draft
date: 2026-05-31
actors:
  - Human
  - Agent
preconditions:
  - Git repository exists
main_flow:
  - step: 1
    actor: User
    action: Initialize arc in project
  - step: 2
    actor: System
    action: Create .arc/ in project root
  - step: 3
    actor: System
    action: Store all entities under .arc/
acceptance_criteria:
  - .arc/ directory in project root
  - one per repo
derived_from:
  - R-015
requested_by: []
---

# Use Case: Store data in project root

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
