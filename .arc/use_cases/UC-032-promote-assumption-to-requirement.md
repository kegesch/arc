---
id: UC-032
title: Promote assumption to requirement
status: draft
date: 2026-05-31
actors:
  - Human
  - Agent
preconditions:
  - Validated assumption exists
main_flow:
  - step: 1
    actor: User
    action: Run arc promote <assumption-id>
  - step: 2
    actor: System
    action: Create new requirement from assumption
  - step: 3
    actor: System
    action: Move driven_by edges to new requirement
  - step: 4
    actor: System
    action: Update assumption status to promoted
acceptance_criteria:
  - New requirement created
  - decisions re-linked
derived_from:
  - R-025
requested_by: []
---

# Use Case: Promote assumption to requirement

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
