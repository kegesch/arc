---
id: UC-006
title: Invalidate assumption
status: draft
date: 2026-05-30
context: core
actors:
  - User
  - Agent
preconditions:
  - Assumption exists in unvalidated or validated status
main_flow:
  - step: 1
    actor: User
    action: Runs arc invalidate <assumption-id> with optional --derive-requirement flag
  - step: 2
    actor: System
    action: Finds assumption and marks status as invalidated
  - step: 3
    actor: System
    action: Identifies all decisions driven by this assumption
  - step: 4
    actor: System
    action: If --derive-requirement provided, creates opposing requirement and re-links decisions
  - step: 5
    actor: System
    action: Outputs impact summary showing affected decisions
acceptance_criteria:
  - Assumption marked as invalidated
  - Dependent decisions flagged
  - Optional opposing requirement created and linked
derived_from:
  - R-009
requested_by: []
---

# Use Case: Invalidate assumption

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
